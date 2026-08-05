# AI Transfer Functions: Turning One Good Visualization into the Next

Volume rendering can reveal structures that are difficult to isolate with surfaces or slices alone, but its success depends on the transfer function: the mapping from scalar values and gradients to color and opacity. A transfer function that works well for one scan may fail on the next, even when both volumes show the same anatomy. Differences among patients, scanners, acquisition settings, and value ranges often force users to repeat a time-consuming design process.

Aim 2 of the VTK Innovation project asks whether AI can make that process more repeatable. We have continued the project's AI transfer-function work during 2026. The team is converting the prior research prototype into a focused workflow that transfers the visual intent of a known transfer function from a reference volume to a target volume.

## 1. The Challenge

Transfer functions encode expertise. A user places color and opacity control points to emphasize structures of interest and suppress distracting material. That work may be clinically or scientifically meaningful, yet a simple linear remapping of the same control points often breaks when the target data has a different distribution.

The project began with the Transferring Transfer Functions approach described by Saravi and colleagues. Its differentiable renderer and small neural networks showed that a reference transfer function could guide optimization for another volume. The initial implementation also exposed practical problems: full 3D rendering losses were costly, the code was still a research prototype, the input volumes generally needed to be registered, and the workflow was not packaged for ordinary VTK users.

The 2026 challenge is therefore more specific than inventing another AI model. It is to identify which parts of the research approach add value, remove expensive or weak components, and place the useful method inside an application that researchers can evaluate.

## 2. The Implementation

The workflow begins with a reference volume and a transfer function that already presents its important structures well. The demonstrated reference is a GE 3T brain MRI with a segmentation mask and a hand-authored 3D Slicer `.vp` transfer function. Its eight control points move from cyan through blue and red to yellow, with a matching scalar-opacity ramp. The target is a Philips 3T scan from another subject, rigidly registered onto the reference grid.

Training compares corresponding rendered 2D slices, not paired voxel labels. For each sample, the application chooses a random axis, selects an index from the middle half of the volume, and applies the same random square crop to both scans. The target contributes normalized scalar intensity and gradient magnitude. The reference contributes the five visual channels that its known transfer function produces: red, green, blue, scalar opacity, and gradient opacity. The network therefore does not copy the reference's scalar values; it learns what the target should render to.

`TransferFunctionNet` contains two pointwise branches. `ColorOpacityNet` maps scalar intensity to RGB and scalar alpha, while `GradientOpacityNet` maps gradient magnitude to gradient alpha. Each branch uses six Fourier frequencies, four 64-unit hidden blocks with layer normalization and ReLU activation, and a sigmoid output. At render time VTK multiplies scalar and gradient opacity. Because the model is pointwise, the same weights operate on 2D crop batches during training and on a flat 256-sample grid when the learned lookup table is exported.

The 2026 work concentrated on five practical decisions:

- **Use 2D slice losses with opacity.** Prior experiments and 2026 review showed that axial, coronal, and sagittal slices provide the strongest useful supervision. Including scalar and gradient alpha is essential because it carries the visibility information needed for later volume rendering.
- **Remove the full 3D rendering loss.** The team found little visual benefit from this loss relative to its computational cost. Eliminating it makes the training path smaller and faster while retaining the differentiable transfer-function model.
- **Preserve local structure.** The training objective blends 20% pixel-wise L1 with 80% structural similarity, or SSIM. L1 alone tends to average tissue classes into indistinct colors; SSIM penalizes the loss of local white-matter, gray-matter, and cerebrospinal-fluid boundaries.
- **Accept and produce established formats.** The application reads 3D Slicer volume-property files and exports the learned 256-point lookup table as ParaView JSON or Slicer `.vp`.
- **Deliver the workflow through trame and VTK-WASM.** Two synchronized volume views keep the camera, crop planes, and slice index linked so the visible comparison isolates the transfer-function difference.

The documented training run used Adam at a learning rate of `1e-3`, `ReduceLROnPlateau`, two epochs of 1,024 sampled slices, and batches of 16. The app exposes the L1/SSIM blend, SSIM exponents, Gaussian-window size, and sigma so the loss can be examined rather than hidden behind a fixed configuration.

Progress was incremental and visible in the meeting record. In February, the code still required recovery and refactoring. In March, it had been placed in a private repository and the trame application was beginning. By May, the navigation and application mockup were running. In June, we demonstrated the end-to-end prototype.

## 3. The Example

The scanner-to-scanner experiment used a GE 3T scan from a 59-year-old male as the reference and a Philips 3T scan from a 42-year-old male as the target. They represented the same anatomy class but different subjects, vendors, and intensity distributions. The target had been rigidly registered to the reference grid so one slice index and crop selected corresponding anatomy.

A linear intensity remap produced blue and red regions but assigned the tissue classes incorrectly. At epoch zero, the untrained network produced a flat green image with no structure. Roughly 35% into training, the orange and yellow cortex began to emerge. After two epochs, the learned target rendering recovered the cyan background and blue, red, and yellow tissue organization visible in the GE reference. This result came from comparisons between rendered 2D slices without paired voxel labels.

The exported result is a smooth, 256-point lookup table that can be loaded directly into ParaView or 3D Slicer. In the live June demonstration, the two epochs took roughly 20 seconds on the available hardware; that meeting observation is not a general performance guarantee.

This example also made the remaining limitations concrete. The demonstration used registered volumes of compatible size; registration or resampling still needs to be incorporated or clearly required. Training needs substantial GPU memory. Gradient-opacity behavior is used but not yet fully exposed in the interface. The current tool trains for the supplied pair rather than performing generalized inference from a broadly trained model.

The team has also begun exploring whether the same idea can extend beyond medical imaging. In July we started to consider transferring a function across time steps in computational-fluid-dynamics data, where shocks, vortices, or other features change location and magnitude. That direction remains exploratory because the scientific feature must first be characterized in a way analogous to segmentation in the medical example.

## 4. Why This Matters?

This work preserves the investment represented by a carefully designed transfer function. Instead of asking a user to rebuild the visualization for every patient, scanner, ensemble member, or simulation time step, the system uses a successful example as a guide.

The project also demonstrates a disciplined use of AI in visualization. The model has a narrowly defined job, its input and output are inspectable transfer functions, and the result can be compared directly with the reference and with conventional linear mapping. The user remains responsible for defining what should be visible; AI assists with adapting that intent to new data.

For VTK, the value is both technical and practical. The work connects learned mappings, VTK volume rendering, 3D Slicer transfer-function formats, trame interaction, and browser delivery. It turns an isolated research method into a candidate community tool and supplies evidence about which optimization components are worth maintaining.

## 5. Conclusion

Aim 2's AI transfer-function work has moved from an exploratory differentiable-rendering pipeline toward a focused application. Our 2026 effort recovered and consolidated the code, prioritized 2D slice supervision with opacity, removed the low-value full 3D loss, added a trame workflow, and demonstrated transfer between registered MRI volumes.

The next milestone is not to broaden the claims, but to finish the product path: improve input handling, address registration and resampling, expose the relevant opacity controls, document compute requirements, validate the method across more datasets, and decide how the prototype should be released. That work will determine how reliably one good visualization can become the starting point for the next.
