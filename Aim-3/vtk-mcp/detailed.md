# VTK-MCP and VTK RAG Detailed Technical Report

## 1. Background

Aim 3 requires more than a language model trained on public code. VTK has a large, evolving API; class names are exact; wrappers distribute symbols across modules; and valid pipelines depend on data types and execution order. Earlier work addressed these problems through VTK RAG and VTK API-MCP. RAG collected documentation, examples, and regression tests into normalized chunks for semantic and lexical search. API-MCP extracted a registry from installed VTK and used it to inspect generated Python.

The 2026 work reorganized those prototypes into a service-oriented ecosystem. March meeting notes identify dependency problems among the initial projects. In April, we strategically proposed separating VTK data and MCP concerns and removing embedded RAG from VTK-Prompt. By May, the knowledge library, index, validation functions, and prompt integration were being demonstrated as one system; June notes record VTK-Prompt running with the MCP server as a separate component.

## 2. Corpus and retrieval foundation

The RAG corpus was designed around several evidence types:

- Python-facing API documentation and signatures;
- curated examples showing canonical pipelines;
- regression tests that capture less common but executable usage; and
- explanatory material and metadata that connect a symbol to a task.

Records are normalized into JSONL with provenance rather than stored only as scraped prose. Metadata distinguishes documentation, code, explanations, tests, and images and retains source locations. Exact lexical retrieval matters for symbols such as `vtkAppendPolyData`; semantic retrieval matters when a user describes an intent without knowing the class name. The current `vtk-index` design combines dense retrieval with BM25 in Qdrant.

Retrieval can be client-directed or agent-directed. In the first mode, VTK-Prompt inserts a bounded number of relevant records into the generation context. In the second, the model decides when to search documentation or examples. Both modes should log record identifiers, scores, corpus version, and tool exchanges so a result can be reproduced and audited.

## 3. Knowledge representation

`vtk-knowledge` owns the structured class and method model. Its tools include:

- class identification and search;
- class-to-module and module-to-class queries;
- Python class information, documentation, and synopsis;
- action phrases, roles, visibility, and input/output data types;
- complete and semantic method lists; and
- method information, documentation, and signatures.

The architecture update lists 17 knowledge operations. These go beyond ordinary text search: they let an agent ask a precise question, such as which module contains a class or what output data type a filter produces, without interpreting a long document.

## 4. Validation and DSL support

`vtk-validate` analyzes Python through its abstract syntax tree. The original API-MCP design checks imports, VTK class construction, method names, call shapes, and arguments against the extracted registry. Diagnostics are structured so a model or editor can locate and repair the affected expression rather than regenerating an entire program.

The current service exposes four operations in this area: VTK code validation, import validation, DSL-prompt detection, and prompt-to-DSL translation. The DSL tools connect API validation with the ontology work. They help transform a request into an ordered pipeline before the assistant chooses concrete classes and methods.

Static validation has defined limits. Python values can be computed dynamically; overload behavior and wrapped C++ signatures can be difficult to infer; data-dependent execution is invisible to an AST; and a valid API call can still implement the wrong analysis. Runtime tests, render inspection, and domain review remain separate requirements.

## 5. MCP service layer

`vtk-mcp` acts as a composition root. It depends on the knowledge, index, and validation libraries and exposes their functions through MCP rather than reimplementing them. The architecture slide reports 25 tools, while the function inventory explicitly names 24: 17 from `vtk-knowledge`, four from `vtk-validate`, two Qdrant searches, and version information. The missing or extra item should be reconciled before the list is treated as the formal interface.

This thin-gateway approach has two advantages. First, libraries can be imported directly or wrapped in command-line tools when MCP is unavailable or inefficient. Second, changes in transport do not require rewriting VTK indexing and validation logic. This addresses concerns raised in the May meeting about protocol overhead and the rapid evolution of agent interfaces.

VTK-Prompt accepts a server URL and can log every tool call. It can also parse inline textual calls from self-hosted models that do not natively support MCP. The client executes the operation and feeds the result back into the conversation, preserving the VTK tool vocabulary across model types.

## 6. Build and deployment

The architecture update describes a versioned build path:

1. `vtk-knowledge` introspects VTK and produces a JSONL artifact.
2. `vtk-index` chunks and embeds that artifact and creates a Qdrant store.
3. `vtk-mcp` packages the server and its library dependencies.
4. Container images publish knowledge, index, and service artifacts tagged for the relevant VTK version or source revision.
5. A shared deployment orchestrates the service and database; thin VTK-Prompt clients connect over HTTP.

The reported internal environment supports shared testing and self-hosted models. It should be described as a development deployment, not as evidence of a public production service. A public release needs installation instructions, authentication and network policy, resource controls, observability, artifact retention, and a documented compatibility matrix.

## 7. Example: append and render two sources

The Sequential Thinking Pipeline uses a cone-and-sphere request to illustrate the combined system. Retrieval locates records for `vtkConeSource`, `vtkSphereSource`, and `vtkAppendPolyData`. Knowledge queries confirm their modules, method names, and data roles. The model writes ordered fragments for the sources, append operation, mapper, actor, and renderer.

After assembly, the validator checks calls such as `AddInputData()` and `Update()`. An unsupported symbol produces a diagnostic and repair request. The program can then be executed and visually tested. This separates probabilistic choices—retrieval and generation—from deterministic checks that can be applied before execution.

## 8. Status and evaluation priorities

Implemented or demonstrated work includes component separation, a JSONL knowledge layer, hybrid Qdrant retrieval, API and import checks, DSL tools, the reported MCP tool surface, VTK-Prompt integration, local-model tool handling, and an internal containerized deployment path.

Priority evaluation areas are:

- coverage and accuracy of extracted Python signatures;
- retrieval precision for symbol, task, and pipeline queries;
- ranking behavior across documentation, examples, and tests;
- false-positive and false-negative rates in AST validation;
- alignment among VTK, JSONL, index, and server versions;
- latency and token use for pre-injected versus agentic retrieval;
- access control, logging, and sensitive-data handling; and
- downstream measures of runtime, visual, and scientific correctness.

## 9. Conclusion

The VTK-MCP work converts a collection of experiments into a reusable intelligence layer. Its architecture recognizes that retrieval, API knowledge, validation, and transport are different concerns. That separation makes the system easier to test, version, deploy, and reuse—and gives VTK-Prompt a stronger foundation than model memory alone.