# VTK-Prompt Technical Report

## 1. Aim 3 context

Aim 3 seeks to help users learn VTK, develop correct code, and deliver visual-analytics applications more quickly. The prior-year work established VTK-Prompt as a command-line and browser prototype supported by VTK-specific retrieval, API validation, and structured prompt chaining. The 2026 work turns that prototype into a more complete authoring environment and separates its reusable knowledge services from the user interface.

This report extracts only the language-driven VTK assistant work. January discussions set goals for the updated UI, RAG, MCP, and prompt chaining. In March and April the team focused on restructuring prototype dependencies and moving retrieval out of VTK-Prompt. By May, VTK-Prompt was using the external knowledge and index tools; in June the separate MCP service and updated UI were demonstrated together.

## 2. User-facing workspace

The current VTK-Prompt UI is organized around three persistent regions:

- **Recents:** pinned and previous conversations, including visible busy state.
- **Generated Code:** a Monaco editor with undo, redo, Run, and data attachment controls.
- **Visualization and records:** the live VTK render plus Conversation and Console tabs.

The prompt client is stateless with respect to UI sessions. Each conversation owns its messages, generated code, console record, and scene. Consequently, several requests may be processed at once; a completion is delivered to the conversation that initiated it, even when the user is viewing another conversation. Returning to a busy conversation does not surface an old result, and switching sessions restores the appropriate scene.

Generated programs use the renderer and render window provided by the application. Safeguards prevent code from creating a native popup or replacing the embedded render window. These controls improve application stability, but they should not be interpreted as a complete sandbox for untrusted Python.

## 3. Authoring and diagnostics

Monaco supplies familiar editing behavior. Completion and hover requests are evaluated through Jedi over the existing websocket connection, avoiding a second language-server deployment. Results include installed VTK docstrings and the renderer objects injected into the execution context. The editor remains mounted while a user types and changes only when the active conversation changes, which stabilizes completion behavior.

Execution output is part of the conversation record. Standard output and standard error are classified by stream rather than by words in a line, so a printed class such as `vtkErrorCode` is not incorrectly marked as a runtime error. Errors, warnings, resolver suggestions, and normal output are retained together. A severity badge alerts the user to failures, while truncation and width controls keep the interface manageable.

The data workflow indexes a configured VTK data root and uploaded files. Known datasets can be fetched when needed. When generated code refers to an unresolved name, matching proceeds from exact stems to fuzzy candidates. A “Fix data file” action replaces the reference and runs the program again. This connects language generation with the practical problem of locating the data required by a visualization.

## 4. Structured thinking and generation

Natural-language prompts are often underspecified. The new thinking stage first expresses the request as a DSL-like VTK pipeline: intended sources, filters, parameters, outputs, and their order. Translation is enabled by default but can be disabled when raw natural-language generation is preferred.

This stage operationalizes earlier Sequential Thinking Pipeline research. That work defined a chain of decomposition, grounded generation, assembly, API validation, repair, post-processing, and visual testing. Its cone-and-sphere example showed how a request can be divided into source creation, `vtkAppendPolyData`, and mapping/rendering tasks while retaining the complete state of prior steps. The current VTK-Prompt does not imply that every experimental stage is production-complete, but it brings the core idea—reason about a pipeline before writing code—into the interactive application.

## 5. Knowledge and tool integration

VTK-Prompt connects to `vtk-mcp` through a configurable HTTP endpoint. The service exposes VTK API knowledge, document and example search, validation, and DSL translation. The UI can pre-inject retrieved context or enable agentic retrieval so the model decides which tools to call. Optional persisted logging records tool selection and results.

Local and quantized models often return tool calls as inline text instead of a provider-native function-call object. VTK-Prompt parses this form, executes the requested `vtk-mcp` operation, returns its result to the model, and allows generation to continue. This makes the same knowledge path available to self-hosted models. A `--debug` mode for the CLI and UI records the LLM conversation, injected context, and MCP calls and results.

The separation is intentional. In planning meetings, we described removing embedded RAG components from VTK-Prompt and placing them behind VTK-MCP. A standalone VTK-Prompt can still work with a model, while a configured knowledge service improves grounding and validation. This reduces coupling and permits the service to support other clients.

## 6. Relationship to trame-llm

`trame-llm` demonstrates a complementary form of conversational visualization. Its chat and voice widget sends user intent to an LLM client, which selects from explicitly registered, typed functions. A request such as “make the cone smoother” becomes a bounded state update and reactive rerender. Only registered functions are callable.

VTK-Prompt and `trame-llm` therefore address different levels of interaction. VTK-Prompt helps create, inspect, and run new VTK Python. `trame-llm` lets users operate capabilities deliberately exposed by an existing application. Both support the Aim 3 goal of translating human intent into transparent visualization behavior.

## 7. Example end-to-end interaction

For the request “Create a cone and a sphere, combine them into a single polydata mesh, and render them,” the system can:

1. Translate the request into an ordered source → append → map → actor → render specification.
2. Retrieve VTK documentation and examples for `vtkConeSource`, `vtkSphereSource`, and `vtkAppendPolyData`.
3. Confirm modules, method names, and input/output expectations through VTK knowledge tools.
4. Generate code into Monaco rather than hiding it behind a response.
5. Run the program with the embedded renderer and capture all output in the active conversation.
6. Preserve the code and scene while the user asks for color, resolution, camera, or data changes.
7. Log retrieval and tool calls when diagnostic mode is enabled.

This workflow is valuable as both an authoring aid and a learning path: users see the pipeline structure and the executable implementation together.

## 8. Status, risks, and next work

Implemented or demonstrated capabilities include the three-panel UI, conversation isolation, concurrent requests, console capture, code completion, data resolution, MCP integration, textual tool calls for local models, DSL translation, and debug records.

Continuing work includes:

- preparing a stable public release and deployment documentation;
- evaluating generated programs across representative VTK domains and difficulty levels;
- defining stronger execution isolation and resource limits;
- measuring retrieval quality, validation coverage, latency, and model-to-model variation;
- connecting ontology constraints and knowledge-graph retrieval more deeply to pipeline planning;
- retaining provenance without exposing secrets or excessive prompt data; and
- distinguishing API correctness, visual correctness, and scientific validity in evaluation.

## 9. Conclusion

The 2026 work changes VTK-Prompt from a single-response prototype into a stateful, observable development workspace backed by modular VTK intelligence. Its most important contribution is the combination of structured intent, grounded tools, editable code, real execution, and visual feedback. That combination supports Aim 3's broader objective: make VTK expertise easier to learn and apply while keeping the generated work visible to the user.