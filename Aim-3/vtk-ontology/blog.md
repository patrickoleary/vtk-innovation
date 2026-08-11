# Building a Machine-Readable Map of VTK

## 1. The Challenge

An AI assistant can copy the shape of a familiar VTK example, but harder questions require more than pattern matching. It must understand that VTK is a pipeline: data enters through a source or reader, passes through compatible filters, becomes a visual asset, and is assembled into a scene. It must know which properties matter, which classes play equivalent roles, and which connections are valid.

VTK's existing resources contain much of this knowledge, but in different forms. Python examples show real usage. The installed API exposes classes, modules, methods, and docstrings. Human expertise supplies concepts such as “clip,” “contour,” “map,” and “render.” Aim 3 needed a way to preserve all three without turning one experimental repository into an unmaintainable collection of code, images, generated data, and graphs.

## 2. The Implementation

The work is now organized as three connected repositories.

`vtk-python-examples` owns a corpus of 2,259 Python examples and tests, their metadata, data files, and rendered images. A VitePress gallery makes them browsable, while a generated `data.jsonl` gives downstream tools a stable machine-readable artifact. Screenshot regression tests execute examples offscreen and compare results with reference images.

`vtk-python-api` introspects the installed `vtkmodules` package. It parses Python help, filters internal or non-user-facing classes, extracts semantic methods, and merges ontology metadata. The current local snapshot contains 2,972 API class records with schemas for classes and modules.

`vtk-ontology` supplies the semantic layer. It maps approximately 2,000 VTK classes across 16 pipeline phases and defines groups, nouns, DSL templates, properties, requirements, and input/output contracts. Its parser reads the example corpus and produces events and pipeline connections. Graph builders then create three complementary views: the declared structural graph, an empirical graph of observed use, and a probability graph weighted by corpus frequency. VitePress documentation and an embedded Sigma.js viewer make the result inspectable.

The repositories exchange generated artifacts. Examples publish `data.jsonl`; the ontology publishes `experiments.jsonl` back to the gallery and `ontology_per_vtk.jsonl` to the API extractor. Lock files and checksums can pin the data used for a build.

## 3. The Example

Take the ordinary VTK cylinder example. The parser can recognize source construction, resolution, mapper and actor creation, colors, renderer settings, window size, and interaction. The ontology maps those API calls to a compact request such as creating a cylinder source, showing it with a named color, rendering it against a background, setting the window, and launching the visualization.

That DSL is easier for a user or model to reason about than a long Python file. It preserves pipeline order and names the properties that matter. The same parsed example also contributes evidence to the graph: which noun maps to `vtkCylinderSource`, which setters commonly configure it, what data it produces, and what usually follows it in a working pipeline.

When VTK-Prompt receives a more complex request, the graph can narrow the possibilities before generation. It can identify admissible next classes, rank configurations observed in examples, and retrieve evidence linked back to executable code. The API repository then supplies exact modules and method signatures.

## 4. Why This Matters?

The ontology captures knowledge that a general language model is unlikely to learn reliably from source code alone: VTK-specific roles, pipeline order, data compatibility, and the difference between a common pattern and a merely possible call. The empirical layer also makes assumptions testable. If a declared connection never appears in the corpus—or an example uses a connection the ontology rejects—the mismatch becomes an audit target.

Separating the repositories improves maintainability. Example authors can update and test the gallery without rebuilding every ontology asset. API extraction can follow an installed VTK version. Ontology changes can be reviewed as semantic changes, then distributed as versioned artifacts. This also creates useful outputs beyond an assistant: improved example discovery, structured API documentation, editor metadata, coverage audits, and research datasets for pipeline analysis.

The numbers should be interpreted carefully. Corpus frequency measures what appears in the selected examples, not what is scientifically best. An ontology is curated and incomplete by design, and generated API records still require versioning and quality checks.

## 5. Conclusion

The VTK ontology work turns examples, API facts, and visualization expertise into a connected, inspectable knowledge system. The three-repository architecture now supports a browsable corpus, enriched API records, a pipeline DSL, structural and empirical knowledge graphs, and reproducible artifact exchange.

This provides a more durable foundation for VTK assistants. Better models will write better syntax, but they still benefit from knowing what VTK components mean, how they connect, and which evidence supports a proposed workflow.