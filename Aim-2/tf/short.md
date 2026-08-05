# AI Transfer Functions Technical Report

## Purpose

The AI transfer-function thrust in Aim 2 seeks to reduce the manual effort required to adapt a good volume visualization to a new dataset. We continued this work in 2026 by consolidating the prior research code and developing a trame application for reference-to-target transfer-function optimization.

## Prior-year foundation

The original pipeline followed the Transferring Transfer Functions method described by Saravi et al. A reference volume and a validated transfer function define the desired visual organization. Small multilayer perceptrons map scalar intensity and gradient magnitude to RGB and alpha. A differentiable optimization loop adjusts the mapping for a target volume.

Prior-year work added several practical ideas: pre-mapping or conditioned initialization, 3D Slicer transfer-function input, 2D and 3D image losses, adaptive learning-rate schedules, and early stopping. It established feasibility but remained a research implementation.

## 2026 implementation progress

The 2026 work refined the method around the strongest experimental findings:

- 2D axial, coronal, and sagittal slice losses provide useful supervision.
- Opacity must be included with the 2D slices so the learned mapping remains useful for volume rendering.
- A full 3D volume-rendering loss added substantial cost with little observed benefit and was removed from the focused workflow.
- Initialization from an existing transfer function or conditioned network reduces the distance optimization must travel.
- 3D Slicer `.vp` and `.vp.json` control points provide an interoperable input path.
- A trame interface can organize reference input, target input, training, comparison, and export.

In February the implementation was still local code requiring refactoring. By March it had been placed in a private GitHub repository. In May a trame navigation skeleton and application design were running. On June 4, we demonstrated a working application that used VTK-WASM with trame, loaded a reference transfer function and MRI volume, trained a mapping for a registered target MRI, compared it with linear mapping, and saved the output.

## Dataset, model, and objective

The documented experiment uses a GE 3T scan from a 59-year-old male as the reference and a Philips 3T scan from a 42-year-old male as the target. The reference includes a segmentation mask and a hand-authored Slicer `.vp` transfer function with eight cyan-to-blue-to-red-to-yellow control points and a scalar-opacity ramp. The target is rigidly registered onto the reference grid.

`SharedSlicePlaneDataset` selects a random axis, a random slice from the middle 50% of the volume, and one random square crop applied at the same origin in both volumes. The target input contains normalized scalar intensity and gradient magnitude. The supervisory reference contains RGB, scalar opacity, and gradient opacity. The network never receives the reference scalar field, and training requires no paired voxel labels.

`TransferFunctionNet` contains two pointwise branches:

- `ColorOpacityNet`: normalized scalar to RGB and scalar alpha;
- `GradientOpacityNet`: normalized gradient magnitude to gradient alpha.

Each branch embeds its scalar input using six Fourier frequencies plus the raw input, producing 13 dimensions. An input projection maps 13 to 64 values, followed by four `Linear(64) -> LayerNorm -> ReLU` blocks and a sigmoid output head. VTK multiplies scalar and gradient alpha during rendering.

The training loss is:

`loss = 0.2 x L1 + 0.8 x (1 - SSIM)`

SSIM is evaluated across all five output channels with an 11-by-11 Gaussian window, sigma 1.5, and dynamic range 1.0. This structural term counters the tendency of L1-only optimization to average tissue classes into indistinct colors. The application exposes the blend, SSIM exponents, window size, and sigma in its settings.

## Demonstrated workflow

1. Load a segmented or otherwise well-understood reference volume.
2. Load its 3D Slicer volume-property transfer function.
3. Convert the transfer-function control points into VTK color and opacity mappings and use them to initialize the network.
4. Load a registered target volume.
5. Train on matched random 2D crops with RGB, scalar-opacity, and gradient-opacity supervision.
6. Compare the learned transfer function with a linear range mapping.
7. Evaluate the pointwise network at 256 equally spaced samples.
8. Inspect the target rendering and export the learned lookup table as ParaView JSON or Slicer `.vp`.

The documented training run used Adam with a learning rate of `1e-3`, `ReduceLROnPlateau`, two epochs of 1,024 sampled slices, and batches of 16. Linear mapping produced blue and red regions but assigned tissue classes incorrectly. The untrained network produced flat green output; orange and yellow cortex appeared during convergence; and after two epochs the learned rendering recovered the reference's cyan background and blue, red, and yellow tissue organization. The live June demonstration reported about 20 seconds for the two epochs on its available hardware, but that is not a general performance guarantee.

## Status, limitations, and next steps

The work has reached a functional prototype, not a finished general-purpose product. Its main constraints are:

- target and reference volumes currently need compatible registration or resampling;
- training requires substantial GPU memory;
- gradient-opacity behavior is not fully visible in the editor;
- evaluation has concentrated on a small set of MRI examples;
- the current pairwise training workflow is not yet a pretrained inference service; and
- the code's public release status is not established by the available meeting record.

Near-term work should complete input handling, registration or resampling integration, error reporting, export, documentation, reproducible examples, and validation across scanners and subjects. Exploration of CFD and time-varying scientific data began in July 2026, but it should be treated as a future research direction until feature characterization and evaluation are defined.
