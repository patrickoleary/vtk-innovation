# VTK Innovation

## Accelerating Community-Driven Medical Innovation with VTK

The VTK Innovation project advances the Visualization Toolkit (VTK) as a foundation for modern medical and scientific visualization. Supported under NIH grant **2R01EB014955-09**, the project addresses a central problem: scientific visualization is increasingly essential across research, healthcare, engineering, and education, but access remains limited by platform, data, usability, and expertise barriers.

The project's overarching purpose is to enhance human life and reduce morbidity and mortality by improving the visual computing tools used to:

- train practitioners;
- plan treatments, surgery, and therapies;
- improve medical imaging and diagnostics; and
- understand complex physiological processes.

VTK already serves as core infrastructure for widely used research and clinical applications, including 3D Slicer, ParaView, OsiriX, MITK, SCIRun, MeVisLab, PLUS, and commercial surgical-guidance and biomechanical-analysis systems. The VTK Innovation project builds on that foundation through three interconnected aims: make visualization available everywhere, integrate visualization and artificial intelligence, and make VTK easier to learn and use.

> **Collection scope:** The documents currently assembled in this folder report **Aim 1: Ubiquitous Visual Analytics** and the two technical thrusts of **Aim 2: AI-Ready Visualization**. This index places that work in the context of the complete three-aim project and summarizes the prior-year accomplishments recorded in [VTK Innovation.pdf](./VTK%20Innovation.pdf).

## The three-aim program

| Aim | Project goal | Prior-year accomplishment baseline |
|---|---|---|
| **Aim 1: Ubiquitous Visual Analytics** | Create an easy-to-use WebAssembly and WebGPU toolchain that transforms VTK analytics workflows into portable modules for desktop, mobile, web, cloud, and embedded applications. Demonstrate delivery through platforms such as 3D Slicer, JupyterLab, SCIRun, Python, trame, and ParaView. | VTK-WASM brought compiled C++ VTK into browsers; `vtkHardwareWindow` separated native window management from OpenGL and WebGPU rendering; and a schema-driven, in-memory data path began connecting Python, AI, and simulation arrays to VTK without a new reader for every format. |
| **Aim 2: AI-Ready Visualization** | Integrate AI into immersive and point-of-care workflows; use saliency, Grad-CAM, sensitivity, and uncertainty visualization to explain AI; and use AI to configure visualization processes such as transfer functions. | The AI-TF pipeline used differentiable rendering and small neural networks to produce adaptive, reproducible transfer functions. A trame prototype visualized saliency, sensitivity, and uncertainty volumes so users could inspect model focus, response, and confidence in anatomical context. |
| **Aim 3: Enhanced Community Support** | Use open-source language models, retrieval-augmented generation, VTK source code, documentation, examples, and tests to help users learn VTK, generate correct code, and interact with visualization through natural language. | VTK-RAG grounded responses in curated VTK knowledge; VTK API-MCP validated generated code against the live API; a sequential reasoning pipeline assembled auditable scripts; VTK-Prompt provided an AI-native learning and coding interface; and trame-llm connected conversational commands to live visualization. |

These aims are designed to reinforce one another. Aim 1 makes VTK portable. Aim 2 uses that visualization platform to drive and explain AI. Aim 3 makes the resulting capabilities easier to discover, program, validate, and control.

## Why the project is needed

### Platform and deployment barriers

VTK's native C++ architecture historically assumed direct memory control, synchronous execution, access to operating-system services, and platform-specific graphics and windowing. Browsers use an asynchronous, sandboxed model. Desktop graphics are also fragmenting across OpenGL, Vulkan, Metal, Direct3D, WebGPU, X11, Wayland, and embedded application surfaces.

The project responds by compiling VTK through WebAssembly and separating rendering from window ownership. The intended result is one visualization foundation that can operate in a browser, notebook, cloud application, desktop program, or embedded clinical tool without maintaining unrelated implementations for every target.

### Data barriers

Modern scientific data increasingly arrives as live simulation memory, Python arrays, AI tensors, or evolving experiment outputs. A workflow based only on static files and custom C++ readers slows experimentation and encourages repeated conversions.

The project therefore advances schema-driven, in-memory ingestion. Conduit and Fides provide an important Aim 1 path: applications supply arrays in memory, a declarative model describes their visualization meaning, and VTK receives data suitable for filtering and rendering.

### AI trust and control barriers

AI can automate parts of visualization, but learned behavior may be fragile or opaque. Transfer functions for medical volumes, for example, are difficult to design consistently, while neural-network predictions may depend on high-dimensional features that clinicians and researchers cannot inspect directly.

Aim 2 treats visualization in both directions: AI can help create a visualization, and visualization can help explain AI. Adaptive transfer functions address repeatability and scale; saliency, sensitivity, and uncertainty volumes address model transparency and human supervision.

### Learning and usability barriers

VTK contains decades of source code, documentation, examples, and community knowledge. That depth is powerful but difficult to navigate. General-purpose language models can generate plausible-looking VTK code that uses the wrong class, method, import, or parameter.

Aim 3 combines retrieval, code validation, structured reasoning, and conversational interfaces. The goal is not merely to produce code quickly, but to produce grounded, inspectable, API-compliant workflows that help users understand what the system generated and why.

## Prior-year highlights

The [VTK Innovation presentation](./VTK%20Innovation.pdf) records a common accomplishment baseline across all three aims.

### Aim 1: ubiquitous visualization

- **VTK-WASM:** Compiled the VTK C++ pipeline with Emscripten so VTK algorithms and rendering can execute in modern browsers. The work supports C++, JavaScript, Python/trame, Jupyter, and standalone web-delivery paths.
- **WebGPU and window decoupling:** Introduced `vtkHardwareWindow` to separate platform-window lifecycle from graphics rendering. OpenGL and WebGPU backends can operate over browser canvases, Qt widgets, Wayland surfaces, and native windows through a clearer boundary.
- **Schema-driven data:** Established an in-memory model for connecting live Python, AI, and simulation data to visualization without building a new file reader for every source.

### Aim 2: AI-integrated visualization

- **AI-driven transfer functions:** Used differentiable volume rendering and learned mappings from scalar intensity and gradient values to color and opacity. The aim is to preserve clinically meaningful structures while adapting to new imaging data.
- **Visualization of AI:** Produced saliency maps, occlusion-based sensitivity volumes, and uncertainty volumes derived from test-time augmentation and Monte Carlo dropout. These outputs can be rendered as spatial overlays for model inspection.

### Aim 3: conversational visualization and support

- **Grounded code generation:** Combined VTK-RAG retrieval, API validation, and sequential task decomposition to generate code that can be traced to VTK documentation, examples, tests, and the current API.
- **VTK-Prompt:** Organized VTK knowledge into normalized, retrieval-ready material and exposed explanations, scripts, and rendering feedback through command-line and browser interfaces.
- **trame-llm:** Added a conversational layer in which text or voice intent can drive rendering and data interaction through structured application tools.

### VTK 9.5.x engineering foundation

The prior-year presentation also highlights the team's contribution to VTK 9.5.x. That release cycle adopted C++17 and improved rendering, data handling, cross-language development, tests, continuous integration, and documentation. Notable work included `vtkFastLabeledDataMapper`, `vtkGridAxesActor3D`, improved physically based lighting, expanding WebGPU support, GPU-memory tools, NetCDF enhancements, a memory-stream GLTF importer, multi-touch gestures, modular shaders, and the `vtkHardwareWindow` abstraction. NIH-supported WebAssembly, WebGPU, and JavaScript infrastructure formed part of that foundation.

## Current report collections

The present folder develops Aim 1 in depth and adds the first parallel Aim 2 collection. Aim 1 covers the engineering required to make VTK portable, browser-capable, data-flexible, testable, and accessible to existing Python and web communities. Aim 2 covers AI-assisted transfer-function design and VTK data products for understanding AI behavior.

### Start here

### Aim 1 topic reports

Each topic is organized into four standalone forms: a blog in the project's preferred style, an executive summary, a short technical report, and a detailed technical report.

| Topic | Documents | Aim 1 contribution |
|---|---|---|
| **VTK-WASM** | [Blog](./Aim-1/vtk-wasm/blog.md) · [Executive summary](./Aim-1/vtk-wasm/summary.md) · [Short report](./Aim-1/vtk-wasm/short.md) · [Detailed report](./Aim-1/vtk-wasm/detailed.md) | Compiled VTK in the browser; JavaScript runtime/session model; standalone and remote scenes; serialization; WebGL/WebGPU and wasm32/wasm64 delivery. |
| **VTK WebGPU** | [Blog](./Aim-1/vtk-webgpu/blog.md) · [Executive summary](./Aim-1/vtk-webgpu/summary.md) · [Short report](./Aim-1/vtk-webgpu/short.md) · [Detailed report](./Aim-1/vtk-webgpu/detailed.md) | Portable modern rendering across native and browser environments; window/rendering separation; mapper, shader, render-pass, testing, and migration work. |
| **Fides and Conduit** | [Blog](./Aim-1/fides/blog.md) · [Executive summary](./Aim-1/fides/summary.md) · [Short report](./Aim-1/fides/short.md) · [Detailed report](./Aim-1/fides/detailed.md) | Schema-driven, in-memory data ingestion for simulations, experiments, Python, and AI outputs. |
| **trame-vtklocal** | [Blog](./Aim-1/trame-vtklocal/blog.md) · [Executive summary](./Aim-1/trame-vtklocal/summary.md) · [Short report](./Aim-1/trame-vtklocal/short.md) · [Detailed report](./Aim-1/trame-vtklocal/detailed.md) | Python/trame adoption layer for VTK-WASM and WebGPU; scene mirroring, interaction, lifecycle, export, and end-to-end browser testing. |

### Aim 2 topic reports

The Aim 2 collection uses the same four-document structure. Jaswant Panchumarti is the principal technical lead for Aim 2. The two thrusts have different current status: AI transfer-function development continued through 2026, while major AI-Data work is planned to resume later in 2027.

| Topic | Documents | Aim 2 contribution and status |
|---|---|---|
| **AI transfer functions** | [Blog](./Aim-2/tf/blog.md) · [Executive summary](./Aim-2/tf/summary.md) · [Short report](./Aim-2/tf/short.md) · [Detailed report](./Aim-2/tf/detailed.md) · [Experiment slides](./AI-TF-slides.pdf) | Transfers a known visualization between registered MRI volumes by learning from corresponding rendered 2D crops. The 2026 trame/VTK-WASM prototype uses separate scalar-color/opacity and gradient-opacity networks, a blended L1/SSIM objective, and 256-point ParaView/Slicer export. |
| **AI-Data** | [Blog](./Aim-2/data/blog.md) · [Executive summary](./Aim-2/data/summary.md) · [Short report](./Aim-2/data/short.md) · [Detailed report](./Aim-2/data/detailed.md) | Creates saliency, sensitivity, and uncertainty data that VTK can display in anatomical context. The prior-year datasets and trame prototype form the current baseline; major new implementation is deferred until later in 2027. |

#### AI transfer-function experiment highlight

The documented scanner-transfer experiment uses a segmented GE 3T brain MRI and an eight-control-point, hand-authored 3D Slicer `.vp` transfer function as the reference. A Philips 3T scan from a different subject and vendor is rigidly registered to the same grid. Random axes, interior slices, and aligned square crops provide training samples without paired voxel labels: the target supplies normalized scalar intensity and gradient magnitude, while the reference supplies rendered RGB, scalar-opacity, and gradient-opacity channels.

`TransferFunctionNet` uses two pointwise Fourier-feature branches. `ColorOpacityNet` maps scalar intensity to RGB and scalar alpha; `GradientOpacityNet` maps gradient magnitude to gradient alpha. Training blends 20% L1 with 80% structural similarity to preserve local tissue boundaries. The documented run used Adam at `1e-3`, `ReduceLROnPlateau`, two epochs of 1,024 sampled slices, and batches of 16. It exported a 256-point lookup table as ParaView JSON or Slicer `.vp`.

The experiment provides a visible baseline and progression. Linear intensity remapping assigned tissue classes incorrectly; the untrained network produced a flat green output; tissue structure emerged during training; and after two epochs the learned Philips rendering recovered the reference's cyan background and blue, red, and yellow tissue organization. The result demonstrates pairwise transfer between registered volumes, not a generalized pretrained inference model.

### Community Activities

Community Activities are organized into four standalone forms: a blog in the project's preferred style, an executive summary, a short technical report, and a detailed technical report.

| Topic | Documents | Aim 1 contribution |
|---|---|---|
| **Releases and community** | [Blog](./vtk2026/blog.md) · [Executive summary](./vtk2026/summary.md) · [Short report](./vtk2026/short.md) · [Detailed report](./vtk2026/detailed.md) | Connects release engineering, technical communication, issue triage, contributor recognition, the May hackathon, and VTK Days planning to Aim 1 adoption. |

## How Aim 1 supports Aims 2 and 3

Although this collection focuses on Aim 1, its infrastructure is shared across the project.

- Browser and cloud deployment make AI explanations and learned visualizations easier to distribute to clinicians, researchers, students, and collaborators.
- WebGPU provides a modern rendering path for spatial AI outputs such as saliency, sensitivity, uncertainty, and adaptive transfer functions.
- Schema-driven data ingestion connects live AI tensors and experimental outputs to VTK without requiring an intermediate file format.
- trame and VTK-WASM provide application surfaces for VTK-Prompt, trame-llm, notebooks, and conversational or AI-assisted workflows.
- Improved documentation, examples, API metadata, serialization coverage, and testing create the grounded knowledge required by Aim 3 systems.

Aim 1 is therefore more than a deployment objective. It is the delivery and data foundation on which the AI and community-support aims can reach users.

## Project outcome

The VTK Innovation project is expanding VTK across three connected dimensions:

1. **Portability and deployment:** visualization can run across native, web, notebook, cloud, and embedded environments.
2. **AI-enhanced and AI-explaining visualization:** visualization can be generated with AI and used to inspect AI behavior.
3. **Intelligent user interaction:** retrieval, validation, and conversational tools can help people learn, program, and control visualization.

Together, the aims are intended to reshape how VTK-based tools are built, shared, understood, and used. The current Aim 1 collection documents the portability and deployment layer in detail; future project collections can use this index to add parallel Aim 2 and Aim 3 reports without changing the overall structure.

---

**Current collection status:** Aim 1 source material and reports through August 2026; Aim 2 source material, 2026 meeting evidence, and parallel AI-TF and AI-Data report collections. Aim 3 is introduced from the full-project presentation but does not yet have an equivalent document collection in this folder.
