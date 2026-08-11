# VTK-Prompt: From a Question to an Executable Visualization

## 1. The Challenge

VTK can express sophisticated visualization workflows, but learning how its sources, filters, mappers, actors, renderers, and data objects fit together takes time. A large language model can produce plausible Python, yet plausible is not the same as correct. It may select an outdated class, invent a method, omit an update, connect incompatible data types, or hide the mistake inside a long answer.

The challenge for the VTK Innovztion Project Aim 3 is therefore larger than adding a chat box to VTK. We need an assistant that helps a user describe an intent, produces understandable code, runs it in a real VTK environment, exposes failures, and lets the user refine the result. The same system should remain useful with cloud models and self-hosted models, and it should make VTK's own documentation and examples part of the conversation.

## 2. The Implementation

VTK-Prompt has evolved into a three-panel workspace. Recent and pinned conversations appear on the left, generated Python is editable in the center, and a live VTK visualization appears beside Conversation and Console tabs. Each conversation owns its messages, code, console output, and scene. Multiple requests can generate concurrently without a late result replacing the conversation currently on screen.

The code editor now behaves more like a development environment. Monaco provides completion and hover information backed by Jedi and real VTK docstrings. A data resolver indexes the VTK data collection and uploaded files, offers close matches when a filename cannot be found, and can replace the reference and run the code again. Standard output, warnings, resolver suggestions, and errors are retained per conversation instead of disappearing into a server terminal.

The assistant is also becoming more deliberate. A thinking stage translates an ordinary request into a DSL-like pipeline specification that names intended filters, parameters, and outputs. This structured description gives retrieval and code generation a less ambiguous target. VTK-Prompt can then ask a separate `vtk-mcp` service for API knowledge, examples, retrieval results, validation, and DSL support. Local models that emit tool calls as text can use the same tools even when they lack native tool-calling support. A debug mode records injected context and tool exchanges for inspection.

This design continues ideas explored in the Sequential Thinking Pipeline: decompose a visualization request, ground each step, assemble the program, validate it, and retain enough evidence to understand the result. It also complements `trame-llm`. VTK-Prompt generates and edits VTK programs; `trame-llm` exposes a bounded set of application functions so language or voice can directly control an existing visualization.

## 3. The Example

Consider the request: “Create a cone and a sphere, combine them into one mesh, and render the result.” The thinking stage can first express the intended order: create two polygonal sources, update them, append their `vtkPolyData`, map the merged output, attach it to an actor, and render the scene.

That plan gives the retrieval service focused concepts such as `vtkConeSource`, `vtkSphereSource`, and `vtkAppendPolyData`. The model writes the program in the editor, while VTK knowledge tools can confirm module names, methods such as `AddInputData`, and compatible inputs and outputs. The user runs the code in the embedded scene. If the program prints bounds or raises an exception, the per-conversation Console preserves the exact result. The user can then edit the code, ask for a correction, change colors, or continue the conversation without losing the prior scene.

The same interaction can be performed with a local model. It can list and call `vtk-mcp` tools, receive their results, and use those results to revise the program. Tool-call logging makes that path inspectable instead of treating the model as an opaque code generator.

## 4. Why This Matters?

VTK-Prompt joins learning, authoring, execution, and visualization in one place. New users can see the code behind a result rather than receiving an unexplained image. Experienced users can use it to scaffold pipelines, find APIs, resolve data, and test alternatives more quickly. Maintainers gain a practical surface for evaluating whether VTK documentation, examples, retrieval, and validation actually help users.

The separation between the client and the knowledge service matters just as much. VTK-Prompt remains a usable authoring application, while retrieval and validation can evolve independently and serve other clients. Structured thinking and an ontology provide durable value even as foundation models improve: they encode VTK pipeline constraints, user intent, and application-specific knowledge that a general model does not own.

The boundaries also need to remain clear. Generated code is still model-produced code and should be reviewed. The current work reduces errors and makes execution more observable; it does not establish that arbitrary generation is safe or scientifically correct.

## 5. Conclusion

VTK-Prompt has progressed from an early prompt-and-render prototype toward an AI-assisted VTK workspace. Concurrent conversation state, an integrated console, code intelligence, dataset resolution, local-model tool use, structured thinking, and a separate VTK knowledge service make the experience more useful and more accountable.

The long-term opportunity is not simply to make an LLM write VTK syntax. It is to connect human questions with VTK's executable pipeline, structured knowledge, and visual feedback so that users can learn, inspect, and refine how a visualization was built.
