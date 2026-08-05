# Making the Invisible Visible: AI Behavior as Data for VTK

An AI model can return a classification or a segmentation, but the answer alone does not tell a researcher what the model noticed, which regions could change the answer, or where the prediction is unstable. Those questions become especially difficult for three-dimensional medical images. A single heatmap cannot adequately represent a model acting across an entire CT or MRI volume.

The AI-Data thrust in Aim 2 treats model behavior as data that can be inspected with visualization. The prior-year work created explainability, sensitivity, and uncertainty outputs aligned with medical images and demonstrated that they could be rendered with VTK and trame. The project is retaining that foundation, but major new AI-Data implementation is deferred; work is planned to resume later in 2027.

## 1. The Challenge

Accuracy summarizes whether a model was right over a collection of cases. It does not explain an individual decision. In medical and scientific settings, users also need to know:

- **where the model focused;**
- **how its output changes when part of the input is perturbed;** and
- **where repeated predictions agree or disagree.**

These concepts are commonly called explainability, sensitivity, and uncertainty. Each produces more than a label. Saliency can vary across network layers. Occlusion analysis can create an output for every perturbed region. Repeated inference can produce a distribution at every voxel. The visualization problem is therefore not simply to overlay one colored image, but to organize multiple spatially registered data products without separating them from their anatomical context.

## 2. The Implementation

The prior-year Aim 2 work created datasets for three complementary views of model behavior.

**Explainability** used a DenseNet-121 lung-lesion classifier and generated activation-based maps across several network layers. LayerCAM outputs showed how early layers responded to local edges and textures while deeper layers concentrated on more semantic regions. Combining layer outputs retained both localized and high-level information. An earlier XAITK prototype also applied Sliding Window and RISEStack methods to CT slices and reconstructed their outputs as a 3D saliency volume.

**Sensitivity** used occlusion analysis. A mask moves across the input, and the change in prediction reveals which regions affect the model. Smaller masks offer more spatial detail at greater computational cost; larger masks are faster but blur localized effects. The current XAITK-derived result approximates this behavior as a saliency-style volume. A more complete representation would preserve the individual 3D output from each localized perturbation.

**Uncertainty** used a 3D UNet trained on brain-tumor data from the Medical Segmentation Decathlon. Test-time augmentation estimated data-related, or aleatoric, uncertainty by repeatedly transforming the input and mapping the predictions back to the original volume. Monte Carlo dropout estimated model-related, or epistemic, uncertainty by keeping dropout active during repeated inference. Mean, mode, standard deviation, and volume-variation measures summarized the resulting prediction distributions, while voxel-wise standard deviation became a 3D uncertainty field.

A trame prototype displayed these model-derived products with the underlying images using linked 2D slices and 3D rendering. This demonstrated the central architectural idea: saliency, sensitivity, and uncertainty can enter VTK as spatial data rather than being confined to static figures.

## 3. The Example

Consider the brain-tumor segmentation example. One MRI volume is passed through the UNet multiple times. In the test-time-augmentation path, each run applies a controlled spatial transformation before inference and reverses that transformation afterward. In the Monte Carlo dropout path, the same input is evaluated while parts of the network are stochastically disabled.

The repeated outputs are aligned in the original image space. A mode volume shows the most frequent segmentation. A mean volume summarizes the average response. A standard-deviation volume shows where the prediction changes from run to run. Low standard deviation indicates a stable region; high standard deviation identifies a region that deserves closer inspection.

VTK can render that uncertainty volume beside or over the anatomy, synchronize slice positions, and let a user move between the original image, segmentation, aggregate prediction, and uncertainty. The model's confidence is no longer a single score. It becomes a spatial field that can be explored in context.

The same pattern applies to explainability. A lung-lesion image can be displayed with LayerCAM outputs from multiple levels of DenseNet. Instead of choosing one layer and hiding the rest, a linked view can show how attention changes from local texture to lesion-oriented activation and how a combined map relates to the original image.

## 4. Why This Matters?

This work changes the role of visualization in an AI pipeline. VTK is not only showing the image that entered the model or the segmentation that came out. It is showing evidence about the model's internal focus, response to perturbation, and stability.

That distinction supports human supervision. A clinician or researcher can notice when a model attends to an irrelevant region, when a small perturbation causes a large change, or when uncertainty concentrates along an important boundary. The visualization does not prove that the model is correct, but it makes questions and failure modes easier to locate.

The work also gives the VTK community a new class of data. Saliency fields, perturbation stacks, and uncertainty volumes can be filtered, registered, rendered, compared, and linked like other scientific arrays. That creates a path from one-off explainability images toward reproducible visual analytics for AI behavior.

## 5. Conclusion

The AI-Data work established a useful foundation: concrete explainability, sensitivity, and uncertainty datasets; spatial alignment with medical images; and a trame/VTK prototype for exploring them. It also exposed the next technical challenge: representing entire families of model-derived outputs without overwhelming the user or collapsing them into a misleading single heatmap.

This thrust is not being presented as active 2026 implementation. The current project plan is to resume major AI-Data work later in 2027, after the nearer-term Aim 2 transfer-function effort. When it resumes, the strongest next steps are to complete perturbation stacks, standardize VTK data representations and provenance, create linked multi-view interaction, and validate the displays with domain experts. The foundation is ready; the next phase must turn model behavior into visual evidence that users can interrogate responsibly.
