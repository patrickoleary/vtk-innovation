# AI Transfer Functions Detailed Technical Report

## 1. Background and motivation

A transfer function maps values in a volume to optical properties such as color and opacity. In one-dimensional transfer functions, scalar intensity is the primary input. More expressive mappings may also use gradient magnitude or other derived features. The result determines which structures become visible, which are suppressed, and how material boundaries appear in a rendered volume.

Transfer-function design is difficult to reuse. MRI intensity is not an absolute physical scale, and two scans may differ because of patient physiology, scanner manufacturer, coil, field strength, acquisition sequence, or post-processing. Similar variation occurs in scientific ensembles and transient simulations. A transfer function optimized for one member can therefore fail on another even when the user wants to communicate the same structures.

Aim 2 addresses this problem by using AI to adapt a known visualization rather than asking the user to redesign it.

## 2. Prior-year technical baseline

The prior implementation built on the Transferring Transfer Functions framework of Saravi et al. The principal entities are:

- a **reference volume** with a known, useful transfer function;
- a **target volume** for which a corresponding transfer function is needed;
- scalar intensity and gradient features;
- small neural networks that predict RGB and alpha; and
- image-based loss functions that guide optimization.

In the original architecture, a differentiable PyTorch renderer allowed loss gradients to propagate back into the transfer-function networks. The project tested combinations of transfer-function value losses, 2D slice losses, 3D rendered-image losses, and style-related terms. Practical additions included pre-mapping, adaptive learning-rate schedules, early stopping, and support for transfer functions exported from 3D Slicer.

The 2025 progress report characterized this work as a learned, reproducible pipeline intended to adapt semantic visual organization to new volumes. It also correctly framed the work as a foundation that still required integration and broader validation.

## 3. Focused 2026 architecture

### 3.1 Inputs and initialization

The workflow accepts a reference volume and a volume-property transfer function. Our 2026 application work focused on the 3D Slicer `.vp` and `.vp.json` representations, which store scalar control points with corresponding RGB and alpha values. These points can be converted into VTK color and opacity functions and sampled to initialize the neural model.

The documented scanner-transfer experiment uses:

- a **GE 3T reference scan from a 59-year-old male**, with a segmentation mask and a hand-authored Slicer `.vp` transfer function;
- eight reference control points moving from cyan through blue and red to yellow, with a corresponding scalar-opacity ramp; and
- a **Philips 3T target scan from a 42-year-old male**, rigidly registered onto the reference grid.

The scans contain the same anatomy class but come from different subjects and MRI vendors. Rigid registration is essential to the current training design because the same slice index and crop must select corresponding anatomy in both volumes.

Initialization matters because random weights require the optimizer to discover both the general shape and the target-specific correction. Pre-mapping or reuse of a conditioned network begins closer to a useful answer and can reduce convergence time.

### 3.2 Neural transfer-function representation

`TransferFunctionNet` is a pointwise network with two inputs and five outputs, organized into two branches rather than one joint image model:

| Branch | Input | Output |
|---|---|---|
| `ColorOpacityNet` | normalized scalar intensity | red, green, blue, scalar alpha |
| `GradientOpacityNet` | normalized gradient magnitude | gradient alpha |

Each scalar input is expanded with Fourier features:

`gamma(x) = [x, sin(2^k pi x), cos(2^k pi x)]`, for `k = 0...5`.

Six log-sampled frequencies through `2^5`, plus the raw input, produce 13 values. An input block maps 13 values to 64. Four identical hidden blocks apply `Linear(64)`, `LayerNorm`, and `ReLU`. A sigmoid-bounded head maps 64 values to four outputs in the color/scalar-opacity branch or one output in the gradient-opacity branch.

VTK's volume mapper computes rendered opacity as:

`alpha_render = alpha_scalar x alpha_gradient`.

The network itself does not multiply the two opacity terms. Every operation is pointwise, so the same learned weights can process a training batch shaped `[N,2,H,W]` or a flat `[N,2]` export grid. Export evaluates the model at 256 equally spaced samples and writes a lookup table suitable for ParaView JSON or Slicer `.vp`.

### 3.3 Loss selection

The most consequential 2026 decision was to prioritize 2D slice supervision with opacity and remove the full 3D rendering loss from the focused workflow.

The implemented `SharedSlicePlaneDataset` provides this supervision. Because the two volumes share a voxel grid, each sample selects:

1. a random anatomical axis;
2. a random index within the middle 50% of that axis, using a margin of 0.25 to avoid mostly empty boundary slices; and
3. one random square crop applied at the same origin to both volumes.

The two-channel target input contains normalized scalar intensity and normalized gradient magnitude. The five-channel reference target contains red, green, blue, scalar opacity, and gradient opacity produced by the known transfer function. The network never receives the reference volume's scalar values, and the training run uses no paired voxel labels.

The objective combines pixel fidelity with local structural preservation:

`loss = 0.2 x L1 + 0.8 x (1 - SSIM)`.

SSIM operates over all five channels with an 11-by-11 Gaussian window, sigma 1.5, dynamic range 1.0, unit luminance/contrast/structure exponents, `k1 = 0.01`, and `k2 = 0.03`. All predicted quantities are sigmoid-bounded. The application exposes the blend factor, SSIM exponents, window size, and sigma in its settings editor.

The slides show why the blend matters. Pixel-wise L1 alone tends toward a uniform, averaged color field that erases tissue-class boundaries. The SSIM component penalizes that loss of local structure and helps preserve white-matter, gray-matter, and cerebrospinal-fluid organization.

The reasoning is empirical and architectural:

- 2D slices expose internal structures directly rather than comparing fuzzy projections.
- Including alpha in the slice representation provides visibility information relevant to later volume rendering.
- Transfer-function-only RGB and opacity comparisons performed less well than the slice-informed loss.
- The full 3D loss required propagation through a differentiable volume renderer and produced little observed improvement.
- A March planning discussion estimated that the 3D path increased computation by roughly fortyfold; this should be treated as a meeting estimate, not a benchmark valid for every configuration.

The application can still use VTK volume rendering to inspect the result. What was removed is the expensive 3D rendered-image term from the optimization objective.

### 3.4 Application layer

The trame interface turns the optimization into a guided workflow. It provides side-by-side reference and target views, training parameters, transfer-function editing and display, navigation between input stages, comparison with conventional mapping, and output saving. The June demonstration used VTK-WASM through trame for local visualization. Camera, crop planes, and slice index remain synchronized so visible differences between the two views are attributable to the transfer function rather than the viewing configuration.

The documented training configuration is:

| Setting | Value |
|---|---|
| Optimizer | Adam |
| Initial learning rate | `1e-3` |
| Scheduler | `ReduceLROnPlateau` |
| Epochs | 2 |
| Samples per epoch | 1,024 slices |
| Batch size | 16 |
| Export | 256-point LUT, ParaView JSON or Slicer `.vp` |

## 4. 2026 development timeline

### February: scope and code recovery

The February 24 meeting narrowed the objective to completing and packaging the transfer-function work. The team identified 2D slice loss with opacity, conditioned initialization, and a small trame application as the valuable core. At that time, the code was not in a repository; we recovered it from a work directory and planned to remove the unused 3D components and refactor the retained implementation.

### March: technical review and repository setup

We refreshed his machine-learning knowledge, reviewed hyperparameter tuning and overfitting, and revisited the earlier experiments. By March 12, the code had been uploaded to a private GitHub repository. The team reaffirmed that 2D slice generation was the intended path and that the deliverable should let a VTK user provide a known transfer function and adapt it to another dataset.

Later in March, the discussion concentrated on data preparation, 3D Slicer segmentation, slice selection, training resolution, and stopping criteria. The team explicitly resisted presenting an AI-branded product before it could explain and validate the model's behavior.

### April: competing priorities

The combined meetings show that work was not uniform every week. We reported no transfer-function progress in early April while focusing on other project tasks. This pause is important context: the 2026 accomplishment is a continued, part-time refinement effort, not uninterrupted full-time development.

### May: user workflow and format design

By May 7, we had a trame application skeleton, a refined UI mockup, and a clear two-stage workflow. The reference volume and Slicer transfer function initialize the network; the target volume then receives an adapted transfer function. File loading was not yet complete, but navigation and initial views were functioning. The team again removed the need to differentiate through a 3D renderer and specified random 2D slices from meaningful interior regions with alpha included.

### June: working demonstration

On June 4, we demonstrated the workflow with a segmented GE reference brain and a registered Philips MRI from another subject. The application:

1. imported a Slicer transfer function;
2. rendered the reference brain and its tissue-oriented colors;
3. loaded the registered target brain;
4. showed that simple linear mapping produced a poor result;
5. trained the learned mapping on 2D slices;
6. displayed the optimized target transfer function and volume;
7. allowed changes to the number of sampled transfer-function points; and
8. saved the result for reuse.

The later AI-TF slides formalized this demonstration as a reproducible experiment: two epochs, 1,024 sampled slices per epoch, batch size 16, Adam at `1e-3`, a plateau scheduler, and 256-point export. The slides do not report wall-clock time. The meeting demonstration reported roughly 20 seconds on the available hardware; that figure is a point observation, not a performance guarantee. The session also identified high GPU-memory use, registration, image dimensions, gradient-opacity visualization, and future inference as the main technical questions.

### July: scientific-data exploration

By July 30, we were exploring OpenFOAM data and considering whether a transfer function could be propagated across simulation time steps. The discussion emphasized that medical segmentation has a clear analogue only if the scientific feature of interest can first be identified. Shocks, vortices, material regions, and topology-derived features were considered. This remains exploratory work and should not be described as a completed extension.

## 5. Demonstrated medical workflow

The reference example contained categorical tissue knowledge: cerebrospinal fluid, white matter, gray matter, and background. Its eight-point transfer function described a cyan, blue, red, and yellow palette with scalar opacity. The target scan differed in subject, scanner, and scalar distribution but was rigidly aligned to the reference grid.

Conventional linear mapping normalized the reference scalar range and stretched the control points onto the target range. It produced blue and red regions but assigned the tissue classes incorrectly. At epoch zero, the untrained network produced a nearly uniform green field with no useful structure. Around 35% of the run, orange and yellow cortex began to emerge. After two epochs, the learned Philips rendering recovered the cyan background and blue, red, and yellow tissue organization present in the GE reference.

The training signal came only from comparisons between corresponding rendered 2D crops. It used no paired voxel labels, and the network did not consume the reference scalar volume. The learned function was evaluated at 256 points to create a smooth lookup table that can be used directly in ParaView or 3D Slicer. Side-by-side, linked views made the comparison inspectable rather than treating the network output as an opaque final answer.

The example also clarified why registration matters. Slice-based training assumes that compared structures occupy compatible spatial locations and that input dimensions can be sampled consistently. The demonstrated Philips volume had already been registered to the GE volume. A production application must either perform registration/resampling, call an established medical-imaging tool, or require pre-registered inputs and validate them explicitly.

## 6. Current status

As of August 2026, the project has a functional research application and evidence-based architectural simplification. The strongest completed elements are:

- recovery and consolidation of the prior AI-TF implementation;
- a focused 2D slice-plus-opacity optimization path;
- removal of the low-value full 3D loss from the intended workflow;
- a documented `SharedSlicePlaneDataset` with aligned random slices and crops;
- a two-branch Fourier-feature network for color, scalar opacity, and gradient opacity;
- a blended L1/SSIM objective that preserves local tissue structure;
- transfer-function input compatible with the Slicer volume-property model;
- a trame interface with reference and target stages;
- a working brain-MRI demonstration;
- comparison with linear mapping; and
- 256-point ParaView JSON and Slicer `.vp` export.

## 7. Risks and limitations

### Data alignment

Registration, resampling, cropping, and scanner-specific normalization can dominate the quality of pairwise transfer. An apparently poor model result may be caused by incompatible inputs rather than the transfer-function network.

### Evaluation

Visual similarity is not equivalent to clinical validity. Evaluation should include controlled datasets, expert review, quantitative comparisons, and failure analysis. The result should be presented as a visualization aid, not an automated diagnostic conclusion.

### Compute requirements

The simplified model trains quickly in the reported demonstration but still requires significant GPU memory. Performance should be measured on representative hardware and volumes before interactive-performance claims are made.

### Generalization

Pairwise training adapts a known reference to a target. A future inference model that works across unseen scanners, subjects, and modalities is a different research problem and will require a suitable dataset, training protocol, and validation design.

### User control

The user needs to inspect scalar and gradient opacity, compare the learned function with the reference, edit the result, and understand when the input assumptions are violated. These controls are central to a trustworthy application.

## 8. Recommended next steps

Near-term product work should:

- complete robust `.vp` and `.vp.json` import and export;
- add registration or resampling through established components, or validate pre-registered inputs;
- expose scalar and gradient opacity clearly;
- capture training configuration and provenance with saved outputs;
- add representative examples from multiple scanners and subjects;
- create repeatable image and numerical tests;
- document GPU memory and runtime requirements; and
- establish a public repository and release path when the code is ready.

Research work can then evaluate generalized inference and transfer across time-varying scientific data. The latter should begin with a deliberately simple feature and dataset so the desired semantic mapping is explicit.

## 9. Conclusion

The 2026 AI-TF effort transformed a broad experimental pipeline into a clearer technical proposition: use a successful reference transfer function, learn a target-specific mapping from 2D slices with opacity, and deliver the result through an inspectable trame workflow. Our continuing work produced a functioning demonstration and resolved a major architectural question by removing the expensive full 3D optimization loss.

The remaining path is well defined. The project must turn a promising pairwise prototype into a documented, validated, and distributable tool while keeping its assumptions visible. If that work succeeds, transfer-function expertise can become reusable across related datasets without hiding the user's visual intent behind an opaque system.
