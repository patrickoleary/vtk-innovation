# AI-Data Technical Report

## Purpose

The AI-Data thrust of Aim 2 creates visualizable data products that explain where AI models focus, how their predictions respond to perturbations, and where their outputs are uncertain. The technical foundation described here was produced in the prior reporting period. Major new AI-Data implementation is deferred and is planned to resume later in 2027.

## Prior-year foundation

The project created datasets for three interpretability dimensions:

| Dimension | Question | Method | Visualizable output |
|---|---|---|---|
| Explainability | Where did the model focus? | DenseNet-121 with LayerCAM; earlier XAITK saliency methods | Per-layer and combined saliency maps; reconstructed 3D saliency volume |
| Sensitivity | Which input regions can change the prediction? | Occlusion with multiple mask sizes | Sensitivity/saliency volume; planned full perturbation stack |
| Uncertainty | Where is the prediction unstable, and why? | Test-time augmentation and Monte Carlo dropout with a 3D UNet | Mean, mode, standard deviation, volume variation, and voxel-wise uncertainty volumes |

The data is spatially aligned with the source medical images. That alignment allows a trame/VTK application to synchronize anatomical slices, segmentation results, saliency fields, and uncertainty volumes.

## Explainability data

A MONAI DenseNet-121 lung-lesion classifier supplied the explainability example. LayerCAM was evaluated at multiple network depths. Early layers emphasized edges, textures, and small local structures; deeper layers produced coarser activation concentrated on more semantic regions. Combining layer maps retained local detail while representing higher-level model focus.

The earlier VTK Innovation highlight also described an XAITK pipeline using Sliding Window and RISEStack saliency algorithms on CT slices. Slice outputs were assembled into a 3D saliency volume and displayed in a trame prototype with 2D and volume views. Together, these experiments demonstrate more than one method for producing VTK-compatible explainability data.

## Sensitivity data

Occlusion analysis repeatedly masks a local region and measures the resulting prediction change. Smaller masks increase spatial resolution and computational cost; larger masks reduce cost but can hide localized effects. The current XAITK-derived output summarizes sensitivity as a saliency-style volume. A more complete dataset would preserve a separate 3D output for each perturbation, enabling users to inspect the model's response landscape rather than only an aggregate.

## Uncertainty data

A 3D UNet trained on Medical Segmentation Decathlon brain-tumor data generated segmentation predictions under two repeated-inference strategies:

- **Test-time augmentation (TTA):** transforms the input, runs inference, and maps the result back to estimate data-related uncertainty.
- **Monte Carlo dropout (MCD):** keeps dropout active during inference to estimate model-related uncertainty.

Repeated outputs produce voxel-wise distributions. Mean and mode summarize the expected segmentation; standard deviation highlights unstable regions; and a volume variation coefficient summarizes structural variation. These outputs can be displayed in anatomical context rather than reduced to one global confidence number.

## Status and timing

The prior-year work completed dataset generation and an initial trame visualization prototype. It did not complete a unified production pipeline, a full perturbation stack, or validated user-interface metaphors for navigating all outputs. The 2026 meeting series combined Aim 2 and Aim 3 reporting, but the current project plan prioritizes the AI transfer-function work. AI-Data implementation is expected to pick up later in 2027.

Planned work should therefore be described as future activity:

- define standard VTK representations and metadata for model-derived volumes;
- retain model, checkpoint, input, transform, perturbation, and inference provenance;
- generate complete 3D perturbation stacks;
- connect computation and visualization in a reproducible application;
- design linked anatomical, saliency, sensitivity, and uncertainty views; and
- evaluate the displays with clinical and AI-domain experts.

## Limitations

Saliency, sensitivity, and uncertainty are evidence about a model, not proof that it is correct. Different methods can disagree, preprocessing can influence every output, and visual encodings can exaggerate or hide variation. The application must keep source anatomy, derived quantities, parameters, and uncertainty definitions visible and traceable.
