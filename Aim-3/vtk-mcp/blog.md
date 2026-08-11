# VTK-MCP: Giving AI Assistants Reliable Access to VTK Knowledge

## 1. The Challenge

Large language models know enough programming vocabulary to produce convincing VTK code, but they do not reliably know the installed VTK API, its modules, method signatures, data contracts, or the best example for a particular task. Retrieval can help, yet an early system that mixes scraping, indexing, validation, model calls, and a user interface becomes difficult to maintain and reuse.

Aim 3 began with two complementary prototypes. VTK RAG normalized documentation, examples, and tests into searchable records. VTK API-MCP built a live registry and an AST-based validator that could check imports, classes, methods, and arguments. The 2026 challenge was to turn these ideas into a coherent service that could support VTK-Prompt, local models, command-line tools, and other AI clients without embedding all of that logic in each application.

## 2. The Implementation

The current design is a small ecosystem with clear responsibilities:

- `vtk-knowledge` owns normalized VTK class and method records and the in-memory API index.
- `vtk-index` chunks those records and example material into a Qdrant store for hybrid dense and BM25 retrieval.
- `vtk-validate` performs AST checks on VTK Python and translates natural-language requests into the VTK DSL.
- `vtk-mcp` is the service layer and composition root. It exposes the libraries as Model Context Protocol tools but contains little domain logic itself.

The architecture reports a 25-tool service. The accompanying function inventory explicitly names 24 operations: 17 knowledge tools, four validation/DSL tools, two vector searches, and VTK version information. That one-tool count discrepancy should be reconciled before the inventory is published as a formal interface. The named tools can identify VTK classes, locate modules, return class and method documentation, list semantic methods, report roles and input/output data types, search documentation and examples, and check code structure before execution.

Build and deployment are also separated from runtime. Continuous integration can introspect a VTK version and publish a JSONL knowledge artifact, build an associated Qdrant index, and package the service with its library dependencies. We have created container images for the knowledge artifact, index, and server, plus an internal shared deployment reached by thin VTK-Prompt clients.

## 3. The Example

Suppose an assistant must combine the outputs of `vtkConeSource` and `vtkSphereSource`. Retrieval finds examples that use `vtkAppendPolyData`; knowledge tools confirm where the class lives, what it consumes and produces, and which methods matter. The model can then generate calls to `AddInputData` and `Update` rather than guessing from a similarly named filter.

The validator parses the completed Python into an abstract syntax tree and compares its imports, class construction, method calls, and arguments with the registry. A misspelled method or unsupported signature produces a structured diagnostic that can drive a focused repair. The assistant receives evidence and a concrete error instead of simply trying another unconstrained answer.

VTK-Prompt can prefetch context or let the model decide which tools to use. A local model that lacks native tool calling can emit a textual request; VTK-Prompt executes it against the same service and returns the result. The knowledge layer therefore remains consistent across model providers.

## 4. Why This Matters?

The main value is not the protocol by itself. It is the stable boundary around reusable VTK expertise. Applications do not need to carry their own scrapers, vector database, API registry, and validator. The libraries can be tested directly or used through command-line interfaces, while MCP provides a common agent-facing surface.

This modularity also makes evaluation more honest. Retrieval quality, knowledge coverage, AST diagnostics, and model behavior can be measured separately. Versioned JSONL and index artifacts can bind an answer to a particular VTK release. Because the model asks explicit tools, the system can retain which records or examples informed a result.

There are limits. API validation can reject nonexistent calls, but it cannot prove that a visualization answers the scientific question. Retrieval may return a syntactically relevant but conceptually poor example. MCP also adds transport and orchestration costs, so the project keeps the underlying libraries and command-line paths usable independently of the protocol.

## 5. Conclusion

VTK-MCP and VTK RAG have matured from separate prototypes into a composable knowledge, retrieval, and validation service. The result gives VTK-Prompt and other assistants a practical way to ask VTK-specific questions, retrieve grounded evidence, check generated programs, and support both hosted and local models.

The enduring contribution is the structured VTK intelligence underneath the endpoint. Protocols and models will continue to change; versioned knowledge, tested retrieval, deterministic diagnostics, and traceable evidence remain useful whichever client sits in front of them.