# Executive Summary

VTK-MCP is the reusable knowledge-service layer for Aim 3's VTK assistants. It consolidates earlier VTK RAG and VTK API-MCP prototypes into four focused components: `vtk-knowledge` for normalized API records, `vtk-index` for hybrid dense and BM25 retrieval in Qdrant, `vtk-validate` for AST checks and DSL translation, and `vtk-mcp` as a thin Model Context Protocol gateway.

The architecture reports 25 tools, while the accompanying inventory explicitly names 24: 17 for VTK classes, modules, roles, methods, documentation, and input/output types; four for Python validation and DSL processing; two for documentation and example search; and one for VTK version information. The discrepancy should be resolved before formal interface publication. VTK-Prompt can inject retrieval results before generation or allow the model to call these tools as needed. Text-form tool calls extend the same capability to local models without provider-native function calling.

This architecture reflects a deliberate 2026 refactoring. We strategically planned for the removal of embedded RAG from VTK-Prompt, creation of a separate knowledge/index service, and an internal deployment for shared testing. The update architecture builds versioned JSONL knowledge and Qdrant artifacts in continuous integration and packages them with the server for reproducible deployment.

The service improves grounding and catches many API-level errors, but it does not certify scientific intent, visual quality, or arbitrary-code safety. Retrieval relevance, validator coverage, version alignment, latency, public release packaging, and evaluation across realistic workflows remain active concerns. Keeping the libraries usable without MCP also protects the work from changes in agent protocols.
