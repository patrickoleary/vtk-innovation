# VTK Ontology, DSL, and Knowledge Graph Technical Report

## Purpose

The ontology work encodes VTK's pipeline semantics in a form that people, documentation systems, and AI assistants can query. It connects executable examples, exact Python API information, curated visualization concepts, and observed pipeline patterns.

## Three-repository architecture

| Repository | Primary role | Key outputs |
|---|---|---|
| `vtk-python-examples` | Own and test the Python example corpus and gallery. | Source, metadata, renders, `data.jsonl`, gallery pages, screenshot tests. |
| `vtk-python-api` | Extract and normalize the installed Python API. | Enriched `api.jsonl`, schemas, class/module documentation. |
| `vtk-ontology` | Define phases and semantics; parse examples; build DSL and graphs. | Ontology JSONL, per-VTK mappings, experiments, probabilities, structural/empirical/probability graphs. |

Current local artifacts report 2,259 example records, 2,972 API class records, 322 ontology records, and 1,988 per-VTK ontology mappings. The ontology organizes roughly 2,000 VTK classes across 16 phases.

## 2026 implementation progress

- Split the example corpus and gallery from the ontology repository.
- Established release-style JSONL exchange between repositories.
- Added VitePress example and ontology documentation plus a Sigma.js graph viewer.
- Extracted Python classes, docstrings, methods, and modules from `vtkmodules` and enriched them with ontology metadata.
- Defined phase, group, class, noun, property, `requires`, and input/output-contract records.
- Parsed Python examples with tree-sitter into events, object use, connections, pipeline topology, and DSL phrases.
- Generated structural, empirical, and probability graphs per phase and as combined graphs.
- Added coverage and DSL-quality audits and identified valid composite-data consumers from empirical examples.
- Added screenshot regression testing to the example corpus using an SSIM threshold of 0.995.

## Artifact flow

`vtk-python-examples` generates `data.jsonl`. `vtk-ontology` consumes it, parses the code, and generates `experiments.json`, probabilities, graphs, `experiments.jsonl`, and `ontology_per_vtk.jsonl`. The slim experiment artifact returns to the gallery, while the per-VTK mapping enriches `vtk-python-api`. Checksums or lock files can pin consumed versions.

## Example

A cylinder example is parsed into its VTK objects, setters, and connections. The ontology maps these to ordered DSL phrases such as create a cylinder, show it with a color, render with a background, set the window size, and launch interaction. Those events become empirical graph evidence and frequency counts. An assistant can retrieve the original working example, use graph constraints to plan a pipeline, and ask the API data for exact methods.

## Benefits and limitations

The system provides machine-readable VTK semantics, traceable example evidence, better documentation inputs, and a foundation for graph-aware RAG. Structural and empirical views help detect gaps in both the ontology and examples.

Coverage is not completeness. Frequency is not correctness, and rare but valid workflows may rank poorly. Parser behavior must accommodate diverse Python styles, the API changes by VTK release, and cross-repository artifacts require automated version and compatibility checks.