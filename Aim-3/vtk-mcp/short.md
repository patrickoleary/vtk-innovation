# VTK-MCP and VTK RAG Technical Report

## Purpose

VTK-MCP gives AI applications a version-aware interface to VTK documentation, examples, API facts, retrieval, code validation, and DSL translation. It reduces hallucinated API use and prevents every VTK assistant from rebuilding the same knowledge infrastructure.

## Architecture

The 2026 design separates domain logic into testable libraries:

| Component | Responsibility |
|---|---|
| `vtk-knowledge` | Build and query normalized class and method records; own the in-memory API index. |
| `vtk-index` | Chunk knowledge and examples; build and search a Qdrant index with dense and BM25 retrieval. |
| `vtk-validate` | Parse generated Python, produce AST diagnostics, validate imports and API use, and support prompt-to-DSL translation. |
| `vtk-mcp` | Compose the libraries and expose them as MCP tools over a configured transport. |

The architecture reports 25 tools, but its function inventory names 24: 17 knowledge tools, four validation/DSL tools, two retrieval tools, and one version operation. This count discrepancy is retained as an item to resolve. The deployment model builds JSONL and Qdrant artifacts for a VTK version, publishes container images, and allows thin clients such as VTK-Prompt to use a shared server.

## 2026 implementation progress

- Refactored the VTK Python documentation, VTK RAG, and API-MCP prototypes into smaller projects with explicit dependencies.
- Removed retrieval ownership from VTK-Prompt and routed it through the external service.
- Added hybrid document and example retrieval through `vtk-index`.
- Expanded knowledge queries to roles, semantic methods, method signatures, and pipeline data types.
- Exposed AST validation and DSL detection/translation as reusable tools.
- Added a command-line path as well as MCP access, reducing protocol lock-in.
- Connected VTK-Prompt to the service and demonstrated a shared internal deployment with self-hosted models.
- Defined continuous-integration and container flows for versioned knowledge, index, and server artifacts.
- Published a pre-built embedded Qdrant artifact (`vtk-index` image) and added `vtk-knowledge download` and `from_artifact()` loading from a ghcr.io OCI image, so the server no longer builds its index at startup.
- Fixed the published index lacking the `vtk_code` collection (example search failed with "Collection vtk_code not found"): `vtk-index chunk --with-code` now fetches and chunks the `vtk-examples` Python sources, and the build workflow fails if `vtk_docs` or `vtk_code` is missing or empty. The published `9.6.1-embedded` artifact still needs to be rebuilt.
- Added the `translate_prompt_to_dsl` and `is_dsl_prompt` tools, then fixed a deployed crash caused by a missing `litellm` dependency.
- Changed `translate_prompt_to_dsl` (October 2026) to stop calling an LLM from the server: it returns the DSL grammar plus relevant VTK class context and the calling assistant writes the DSL. The server no longer needs its own model or API key, and the `VTK_MCP_TRANSLATE_*` settings were removed.

## Example workflow

For a request involving `vtkAppendPolyData`, the client searches examples and documentation, confirms the class module and relevant methods, generates code, and sends the assembled program to the validator. A nonexistent method or incompatible call produces a structured diagnostic for repair. Tool logs can link the program to the records used during generation.

## Benefits and limitations

The modular service supports multiple clients and model providers, makes knowledge and validation independently testable, and creates a path to version-aligned VTK answers. Hybrid retrieval combines semantic similarity with exact vocabulary matching, which is important for class names and method symbols.

Validation is necessarily partial: static AST checks cannot prove runtime behavior, rendering fidelity, or scientific correctness. The index must be regenerated when VTK or its corpus changes. Retrieval quality depends on chunking, metadata, and ranking, while service transport and repeated model/tool exchanges introduce latency and token costs.