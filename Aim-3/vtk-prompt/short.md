# VTK-Prompt Technical Report

## Purpose

VTK-Prompt lowers the barrier to learning and using VTK by combining natural-language assistance, editable Python, live execution, and interactive rendering. It addresses a known weakness of general-purpose LLMs: generated code can look reasonable while using the wrong VTK class, method, data type, or pipeline order.

## Architecture

The current system separates the experience from the knowledge infrastructure:

1. A trame-based UI manages conversations, code, data references, execution output, and the live VTK scene.
2. A stateless prompt client sends each request with its conversation-owned state to a configured cloud or local model.
3. A thinking stage can translate natural language into a DSL-like pipeline specification.
4. The external `vtk-mcp` service exposes VTK class knowledge, hybrid retrieval, examples, AST validation, and DSL tools.
5. Generated code runs against the embedded renderer and render window; its output is captured in a per-conversation Console.

The architecture draws on the Sequential Thinking Pipeline, which decomposes a problem, retrieves context, generates ordered fragments, assembles and validates the result, and retains provenance. It also shares a conversational interaction model with `trame-llm`, although the latter calls registered application tools rather than primarily generating programs.

## 2026 implementation progress

- Introduced a three-panel workspace for recents, generated code, and visualization/conversation/console views.
- Moved messages, code, scene, busy state, and console records into conversation-owned state, enabling concurrent generation.
- Added Monaco undo/redo and Run controls, with Jedi-backed VTK autocomplete and hover information.
- Captured standard output and standard error by stream, with severity badges and resolver advice retained per run.
- Indexed VTK data and uploaded files; added exact-stem and fuzzy matching plus a “Fix data file” rerun workflow.
- Prevented generated scripts from creating disruptive native windows or replacing the application's render window.
- Connected to a configurable `vtk-mcp` server and added optional agent-driven retrieval.
- Supported inline textual tool calls from local models without native function calling.
- Added default-on natural-language-to-DSL translation and a `--debug` record of LLM context, tool calls, and results.

## Example workflow

For “combine a cone and sphere into one mesh,” the thinking stage identifies the two sources, an append filter, mapping, and rendering. Retrieval supplies relevant examples and API records. The model creates editable Python; the user runs it in the live view; API or runtime errors appear in the conversation's Console; and the user can revise the same program without losing the session or scene.

## Benefits and limitations

The workspace makes AI-assisted code visible, editable, runnable, and teachable. Separating `vtk-mcp` allows the same VTK knowledge to support command-line clients, other agents, and future applications. DSL translation and logged tool use improve precision and auditability.

The system remains an assistant. API validation does not prove that an analysis is scientifically appropriate, a rendered result is meaningful, or arbitrary generated code is secure. Representative benchmarks, sandbox policy, release packaging, latency, and behavior across models remain important evaluation areas.