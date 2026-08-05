# AI-Data Detailed Technical Report

## 1. Background and motivation

AI models in medical imaging often produce classifications, segmentations, or measurements from high-dimensional inputs. Conventional evaluation reports aggregate performance, but a user examining one case needs different evidence. The user may need to know which structures influenced the decision, whether a local change would alter the output, and where repeated inferences are unstable.

Aim 2 treats those questions as a visualization problem. Rather than showing only the original image and final prediction, the AI-Data thrust creates spatially aligned model-derived data that VTK can render and explore. This work complements AI-TF: AI-TF uses AI to help construct a visualization, while AI-Data uses visualization to inspect AI.

The AI-Data foundation summarized here comes from the prior reporting period. In 2026, active Aim 2 development is concentrated on transfer functions. Major AI-Data work is deferred and planned to resume later in 2027.

## 2. Interpretability as three data problems

The project organized the work into three related but distinct concepts.

### Explainability

Explainability asks which spatial features contributed to a model's output. Gradient- and activation-based techniques create maps that attribute importance to image regions. These maps depend on the selected method and network layer, so a single map is not a complete explanation.

### Sensitivity

Sensitivity asks how the output changes when the input is perturbed. Occlusion is conceptually direct: hide a region, repeat inference, and measure the difference. A complete sensitivity experiment may generate hundreds or thousands of outputs, making the resulting data organizationally and visually challenging.

### Uncertainty

Uncertainty asks how much the model's output varies and what kind of variability is being measured. The project distinguishes:

- **aleatoric uncertainty**, associated with noise or variation in the observed data; and
- **epistemic uncertainty**, associated with the model, its parameters, or limited training exposure.

Repeated inference produces distributions rather than a single volume. Those distributions can be summarized globally, by structure, or at every voxel.

## 3. Explainability dataset

### 3.1 DenseNet and LayerCAM

The expanded AI-Data work used MONAI and a DenseNet-121 lung-lesion classifier. LayerCAM outputs were captured from several network depths and registered to the input image. This provides a progression from early local responses to later semantic activation.

Early layers commonly respond to edges, blobs, and textures. Deeper layers have larger receptive fields and can concentrate on regions related to the classification, but their maps may be spatially coarse. The project combined multiple layer outputs to retain local information while representing deeper focus. Each input therefore has both individual layer maps and an aggregate map.

### 3.2 XAITK saliency prototype

The earlier VTK Innovation highlight described a related pipeline built with XAITK. Lung CT volumes were divided into axial slices and labeled as lesion or normal using source metadata. A DenseNet classifier was trained on the slice collection. Sliding Window and RISEStack saliency algorithms were applied to test slices, and the resulting maps were assembled into a 3D saliency volume.

A trame application displayed the CT and saliency volume using linked 2D slices and 3D rendering. Sharp saliency transitions near lesion/normal slice boundaries provided a useful inspection target. This prototype demonstrated the delivery architecture even though the computation was not yet integrated into the application.

### 3.3 Data requirements

An explainability dataset should preserve:

- the source image and spatial transform;
- model and checkpoint identity;
- predicted class and score;
- explainability method and parameters;
- selected network layer;
- raw and normalized attribution values; and
- any aggregation method used to combine layers.

Without this provenance, visually similar heatmaps may represent different computations and cannot be compared reliably.

## 4. Sensitivity dataset

Occlusion analysis moves a mask through the image or volume and records how the model output changes. The mask size determines a basic tradeoff:

- a small mask localizes influence more precisely but requires many inference passes;
- a large mask is less expensive but merges distinct regions and produces a smoother response; and
- stride controls whether perturbations overlap and how completely the input is sampled.

The project's current XAITK output approximates sensitivity as a summarized saliency-style volume. That is useful for an overview but loses the individual response to each perturbation. The planned full representation is a stack or indexed collection of 3D outputs, one for each localized perturbation.

Such a collection needs more than an additional array dimension. It must retain mask origin, shape, size, stride, replacement value, output class, baseline score, perturbed score, and spatial alignment. A visualization can then let the user select a region in the anatomy and inspect the corresponding response, or select an output change and locate the perturbations that caused it.

## 5. Uncertainty dataset

### 5.1 Model and source data

The project trained a 3D UNet segmentation model on brain-tumor data from the Medical Segmentation Decathlon. The output is a voxel-wise tumor segmentation suitable for repeated-inference analysis.

### 5.2 Test-time augmentation

Test-time augmentation applies controlled transformations to the input, performs inference, and reverses the spatial transformation on the output. Repeating this process generates multiple predictions for the same original case. Variation among those aligned outputs estimates sensitivity to plausible input changes and is used as a measure of data-related uncertainty.

The documented experiment used ten runs. Outputs included:

- the original image and ground-truth segmentation;
- transformed inputs and labels;
- per-run predictions mapped back to original space;
- voxel-wise mean;
- voxel-wise mode;
- voxel-wise standard deviation; and
- a volume variation coefficient for structural variation.

### 5.3 Monte Carlo dropout

Monte Carlo dropout leaves dropout active at inference time. Repeated passes through the same model and input produce a distribution caused by stochastic internal pathways. The project compared models trained with and without dropout and used ten inference passes to examine the resulting variability.

This pathway approximates model-related uncertainty. It can identify regions where predictions depend strongly on the sampled network configuration and can also inform model-design decisions.

### 5.4 Voxel-wise uncertainty volumes

After repeated outputs are aligned, a statistic such as standard deviation can be computed at every voxel. Low values indicate agreement; high values indicate instability. The resulting 3D field can be rendered with VTK, sliced with the anatomy, or summarized over a tumor or other structure.

The visualization must state what each field measures. A standard-deviation volume from TTA is not interchangeable with one from Monte Carlo dropout, and neither is a calibrated probability of error by default.

## 6. Visualization architecture

The trame prototype established the fundamental interaction pattern:

- a source image view;
- one or more derived-data views;
- synchronized slice position and camera state;
- 2D overlays for precise anatomical localization;
- 3D volume rendering for spatial context; and
- controls for method, layer, run, statistic, color map, and opacity.

Future VTK representations should make model-derived arrays first-class without discarding their provenance. Candidate structures include multiblock or partitioned datasets for collections, field data for method metadata, and explicit transforms or shared image geometry for alignment. The design should support lazy loading because full perturbation stacks can be large.

## 7. Completed foundation and current status

The completed prior-year foundation includes:

- LayerCAM maps from multiple DenseNet layers and combined saliency maps;
- XAITK saliency experiments reconstructed into 3D;
- occlusion-sensitivity experiments with multiple mask sizes;
- a 3D UNet brain-tumor segmentation model;
- TTA-based data-uncertainty outputs;
- MCD-based model-uncertainty outputs;
- voxel-wise mean, mode, standard deviation, and structural variation measures; and
- a trame prototype with 2D and 3D visualization.

The following work remains incomplete or planned:

- a full per-perturbation 3D sensitivity stack;
- standardized VTK data and provenance conventions;
- integrated computation inside the visualization application;
- scalable loading and comparison of many outputs;
- linked multi-view metaphors validated with users; and
- systematic assessment of whether the displays improve model review.

As of August 2026, these planned items are deferred. Major AI-Data work is expected to resume later in 2027. This timing should remain explicit in summaries, presentations, and progress reports.

## 8. Risks and limitations

### Interpretability is method-dependent

Saliency methods can disagree, change with model architecture, and respond to preprocessing. An attribution map should be treated as one measurement of model behavior, not a literal explanation of reasoning.

### Visualizations can imply false certainty

Smooth color maps and opaque overlays may look authoritative. Interfaces should show scales, baselines, distributions, and method parameters and should allow the user to inspect the source anatomy without the overlay.

### Computation and storage can be large

Occlusion and repeated inference multiply the cost of a normal prediction. Full 3D perturbation stacks can be much larger than the source image. Sampling, caching, progressive loading, and aggregation will be required.

### Spatial alignment must be preserved

Transforms used during TTA, preprocessing, cropping, or resampling must be inverted and recorded correctly. Misalignment can create a plausible but false explanation.

### Clinical usefulness requires domain evaluation

The current work is a visualization and research foundation. It is not evidence of clinical deployment or diagnostic validity. Domain experts must evaluate whether the outputs support real review tasks.

## 9. Later-2027 work plan

When the thrust resumes, a staged plan is recommended.

### Stage 1: formalize the data contract

Define VTK-compatible representations for single attribution volumes, layer collections, repeated-inference ensembles, perturbation stacks, aggregate statistics, and provenance. Create small reference datasets with expected results.

### Stage 2: complete computation pipelines

Reproduce the LayerCAM, occlusion, TTA, and MCD workflows from versioned configurations. Add deterministic tests where possible and record model/checkpoint hashes, transforms, seeds, and software versions.

### Stage 3: build linked exploration

Connect anatomical slices, 3D context, per-layer saliency, perturbation selection, and uncertainty statistics. Make it easy to move from an aggregate pattern to the underlying run or perturbation.

### Stage 4: evaluate with users

Define review tasks with medical-imaging and AI experts. Measure whether the visualization helps users find spurious focus, unstable boundaries, or method disagreement, and record where the interface causes confusion.

### Stage 5: integrate with VTK workflows

Document Python and trame APIs, provide example data, and identify reusable VTK filters or data adapters. Integration should support external AI frameworks rather than binding the design to one model family.

## 11. Conclusion

The AI-Data thrust established that model behavior can be organized as visualization data. Explainability maps show focus across network layers, occlusion reveals sensitivity to localized changes, and repeated inference produces spatial uncertainty fields. The prior-year work generated concrete medical-imaging datasets and demonstrated their use in a trame/VTK prototype.

The responsible 2026 status is a maintained foundation, not a claim of continuing implementation. Aim 2's active effort is the AI transfer-function workflow, while AI-Data is planned to resume later in 2027. That later phase can build directly on the existing datasets by formalizing provenance, completing perturbation stacks, and creating validated linked views that make AI behavior inspectable without overstating what the visualizations prove.