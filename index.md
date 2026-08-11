# VTK Innovation Project

The VTK Innovation project advances the Visualization Toolkit as a portable, intelligent, and accessible platform for scientific and medical visualization. Its three NIH aims address the full path from computing infrastructure to data understanding and human interaction:

1. **Ubiquitous Visual Analytics:** make VTK pipelines portable across desktop, browser, mobile, cloud, Python, and application frameworks through WebAssembly, WebGPU, modular windowing, and memory-native data access.
2. **AI-Ready Visualization:** use AI to improve visualization, including transferable volume-rendering transfer functions, and use visualization to expose AI saliency, sensitivity, and uncertainty.
3. **Enhanced Community Support:** help users learn VTK, generate and validate code, retrieve trustworthy examples and API knowledge, and interact with visualization through language-driven tools.

The collection combines prior-year reports, 2026 implementation evidence, meeting transcripts, presentations, source narratives, and topic-specific reports. Unless a document states otherwise, the 2026 reporting cutoff is August 10, 2026.

## 2025 foundation

The prior reporting period established the foundation for all three aims. Aim 1 produced browser-native VTK work, WebGPU and hardware-window abstractions, and memory-oriented data pathways. Aim 2 demonstrated learned transfer functions and spatial representations of AI explainability and uncertainty. Aim 3 assembled VTK-specific retrieval, API checking, structured prompt chains, VTK-Prompt, and conversational trame experiments. VTK 9.5.x supplied the shared software-engineering foundation.

## Aim 1: Ubiquitous Visual Analytics

### VTK-WASM

[Blog](./Aim-1/vtk-wasm/blog.md) · [Executive summary](./Aim-1/vtk-wasm/summary.md) · [Short report](./Aim-1/vtk-wasm/short.md) · [Detailed report](./Aim-1/vtk-wasm/detailed.md)

Browser-native VTK, the 2.x runtime and session model, serialization, standalone and remote scenes, packaging, and WebGL/WebGPU across WASM32 and WASM64.

### VTK WebGPU

[Blog](./Aim-1/vtk-webgpu/blog.md) · [Executive summary](./Aim-1/vtk-webgpu/summary.md) · [Short report](./Aim-1/vtk-webgpu/short.md) · [Detailed report](./Aim-1/vtk-webgpu/detailed.md)

The portable rendering backend, `vtkHardwareWindow`, Dawn and the WebGPU C API, mapper and render-pass progress, and cross-platform validation.

### Fides and Conduit

[Blog](./Aim-1/fides/blog.md) · [Executive summary](./Aim-1/fides/summary.md) · [Short report](./Aim-1/fides/short.md) · [Detailed report](./Aim-1/fides/detailed.md)

Schema-driven, in-memory data ingest through Conduit and Fides, including native VTK integration, ownership, and validation.

### trame-vtklocal

[Blog](./Aim-1/trame-vtklocal/blog.md) · [Executive summary](./Aim-1/trame-vtklocal/summary.md) · [Short report](./Aim-1/trame-vtklocal/short.md) · [Detailed report](./Aim-1/trame-vtklocal/detailed.md)

Mirroring ordinary Python VTK and PyVista scenes into VTK-WASM, with protocol, runtime, widget, serialization, and browser-test development.

## Aim 2: AI-Ready Visualization

Jaswant Panchumarti is the principal technical lead for Aim 2. The 2026 emphasis remains the AI transfer-function work; the major AI-Data implementation phase is planned to resume later in 2027.

### AI transfer functions

[Blog](./Aim-2/tf/blog.md) · [Executive summary](./Aim-2/tf/summary.md) · [Short report](./Aim-2/tf/short.md) · [Detailed report](./Aim-2/tf/detailed.md)

Transfer a reference volume-rendering appearance to a target volume using learned scalar/gradient-to-RGBA mappings, 2D slice losses, 3D Slicer volume-property input, trame delivery, and scientific-data extensions. [AI-TF-slides.pdf](./Aim-2/AI-TF-slides.pdf) provides the latest experiment evidence.

### AI-Data

[Blog](./Aim-2/data/blog.md) · [Executive summary](./Aim-2/data/summary.md) · [Short report](./Aim-2/data/short.md) · [Detailed report](./Aim-2/data/detailed.md)

Spatial visualization of explainability, sensitivity, and uncertainty, including prior LayerCAM/XAITK, occlusion, test-time augmentation, and Monte Carlo dropout foundations and the plan for renewed implementation.

## Aim 3: Enhanced Community Support

The 2026 Aim 3 work now has three connected layers: an authoring experience, a reusable knowledge service, and a structured data/ontology pipeline. Meeting files named “Aim #3 catch up” sometimes contain both Aim 2 and Aim 3 updates; the reports separate the topics by technical workstream.

### VTK-Prompt

[Blog](./Aim-3/vtk-prompt/blog.md) · [Executive summary](./Aim-3/vtk-prompt/summary.md) · [Short report](./Aim-3/vtk-prompt/short.md) · [Detailed report](./Aim-3/vtk-prompt/detailed.md)

A three-panel prompt-driven VTK workspace with conversation-owned state, concurrent generation, editable code, live rendering, console capture, VTK-aware completion, dataset resolution, local-model tools, and a DSL-like thinking stage.

### VTK-MCP and VTK RAG

[Blog](./Aim-3/vtk-mcp/blog.md) · [Executive summary](./Aim-3/vtk-mcp/summary.md) · [Short report](./Aim-3/vtk-mcp/short.md) · [Detailed report](./Aim-3/vtk-mcp/detailed.md)

The modular knowledge, hybrid retrieval, API validation, and DSL service behind VTK-Prompt: `vtk-knowledge`, `vtk-index`, `vtk-validate`, and the thin `vtk-mcp` gateway.

### VTK ontology, DSL, and knowledge graphs

[Blog](./Aim-3/vtk-ontology/blog.md) · [Executive summary](./Aim-3/vtk-ontology/summary.md) · [Short report](./Aim-3/vtk-ontology/short.md) · [Detailed report](./Aim-3/vtk-ontology/detailed.md)

The three-repository knowledge pipeline spanning [`vtk-python-examples`](https://github.com/patrickoleary/vtk-python-examples), `vtk-python-api`, and `vtk-ontology`: executable evidence, enriched API records, a 16-phase ontology, pipeline DSL, and structural, empirical, and probability graphs.

## VTK releases and community activity

[Blog](./vtk2026/blog.md) · [Executive summary](./vtk2026/summary.md) · [Short report](./vtk2026/short.md) · [Detailed report](./vtk2026/detailed.md)

The VTK 9.6 release line and 9.7 candidates, 2026 technical blogs, the May 13 hackathon, and VTK Days planning.
