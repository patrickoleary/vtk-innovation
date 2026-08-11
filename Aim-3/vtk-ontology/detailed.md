# VTK Ontology, DSL, and Knowledge Graph Detailed Technical Report

## 1. Background and motivation

The early VTK assistant work showed that retrieval is effective for familiar, localized questions but becomes less reliable when a request requires an unfamiliar multi-stage pipeline. General models can imitate examples without understanding why a reader, filter, mapper, actor, renderer, and interaction stage occur in a particular order. Aim 3 therefore expanded from text retrieval toward an explicit model of VTK concepts and constraints.

In January, we described the need to encode input, filter, visual-asset, output, renderer, scene, and interaction rules. February demonstrations showed that an ontology-derived DSL made detailed prompts more precise. March work connected example parsing to knowledge-graph construction. The repositories were then reorganized in June so that examples, API extraction, and semantic knowledge could evolve independently while exchanging versioned artifacts.

## 2. Repository responsibilities

### 2.1 vtk-python-examples

The public [`patrickoleary/vtk-python-examples`](https://github.com/patrickoleary/vtk-python-examples) repository owns the example corpus and gallery. The local snapshot contains 2,259 generated JSONL records and approximately the same number of example programs, with sidecar JSON metadata, rendered PNGs, and shared datasets. VitePress generates gallery, tag, and per-example pages.

The repository publishes `data/data.jsonl` for ontology parsing. It consumes a pinned `experiments.jsonl` from `vtk-ontology`, which supplies parsed topology, phrases, and events for the documentation site. The current workflow supports lock-file sources and SHA-256 verification.

The regression harness runs examples offscreen, captures screenshots, and compares them with references using structural similarity with a 0.995 threshold. Results are recorded in a CSV. This turns the corpus from passive sample text into executable evidence, although image similarity alone cannot establish scientific equivalence.

### 2.2 vtk-python-api

`vtk-python-api` discovers classes from the installed `vtkmodules` package, parses Python `help()` output, filters templates and internal classes, and extracts semantic rather than boilerplate methods. It can use Doxygen-derived information when wrapper documentation is incomplete. JSON schemas define class and module record shapes.

The extractor enriches each class with `ontology_per_vtk.jsonl`: phase, group, DSL templates, properties, I/O contracts, roles, and probabilities. The current local `api.jsonl` contains 2,972 records. Because this worktree has no committed local history, that count is reported as a development snapshot rather than a published release.

Errata and triage files record unresolved or inappropriate classes. This is important: raw introspection is not automatically a user-facing API, and wrapper signatures or help text may require cleanup.

### 2.3 vtk-ontology

`vtk-ontology` is the semantic source of truth. Its README reports approximately 2,000 VTK classes organized across 16 pipeline phases. Phase files and referenced noun definitions encode groups, ontology classes, VTK mappings, DSL templates, properties, `requires` relationships, and input/output contracts. Current generated artifacts contain 322 ontology records and 1,988 per-VTK mappings.

The ontology repository also contains:

- a tree-sitter Python parser and VTK API-to-DSL mapper;
- an ontology index and experiment report generator;
- scripts that compute occurrence and conditional probabilities;
- structural, empirical, probability, and combined graph builders;
- ontology coverage and DSL-quality audits; and
- VitePress documentation with an embedded Sigma.js graph viewer.

## 3. DSL generation and parsing

The DSL describes VTK intent at a level between natural language and Python. It uses pipeline-aware verbs and nouns, names intermediate results, and expresses properties. Because the vocabulary is generated from the ontology, documentation, parsing, and generation share a common semantic model.

For a cylinder program, parsing can recover a sequence equivalent to:

1. create a cylinder source with a resolution;
2. show the cylinder with a selected color;
3. render against a chosen background;
4. configure the render-window size and title; and
5. launch interaction.

This structured request is specific enough for a model to generate code without receiving every ontology record. It also preserves pipeline order. Parsing existing programs back into the DSL tests whether the ontology covers real examples and produces training or evaluation pairs for future assistants.

## 4. Knowledge graph layers

The graph builders create complementary representations.

### Structural graph

The structural graph represents declared knowledge: phase → group → ontology class → noun → property, plus `requires`, optional, ownership, pipeline, consumes, and produces relationships. It expresses what the ontology says should be possible.

### Empirical graph

The empirical graph is generated from parsed examples. It records VTK object use, setters, pipeline and assembly connections, and evidence tied to a specific example. This layer shows what the selected corpus actually demonstrates.

### Probability graph

Probability records summarize observations such as the prior frequency of a noun, a property given a noun, or the next class given a source class. The records retain numerators, denominators, corpus versions, and conditioning fields so their meaning can be reconstructed. Richer conditions can include input kind, current output type, phase, desired output, and active intent.

These probabilities are ranking evidence, not rules of science. A common example pattern may be irrelevant to a user's data, while a rare class may be exactly right.

## 5. Rebuild and artifact exchange

The current dependency order is:

1. `vtk-python-examples` generates `data.jsonl` from source, metadata, and tests.
2. `vtk-ontology` fetches that artifact and parses it into full experiment data.
3. Probability extraction enriches ontology records.
4. Ontology records are reorganized into per-VTK-class mappings.
5. Structural, empirical, probability, and combined graphs are rebuilt.
6. Ontology documentation is regenerated.
7. A slim `experiments.jsonl` is produced for the example gallery.
8. `ontology_per_vtk.jsonl` is distributed to `vtk-python-api`, which rebuilds enriched API records.

This loop lets each repository own one kind of source while consuming explicit generated contracts. The next engineering step is to replace remaining manual copies with automated releases, compatibility metadata, and continuous integration that tests a complete pinned set.

## 6. Use in VTK-Prompt and VTK-MCP

The ontology supports the assistant in several ways:

- translate a natural-language request into a pipeline-ordered DSL;
- retrieve by semantic role instead of exact class name;
- constrain candidate filters using consumes/produces contracts;
- rank likely next steps using empirical evidence;
- connect a recommendation to executable examples;
- enrich API records with phase, role, and relevant methods; and
- validate whether a generated pipeline is structurally admissible before execution.

In July, discussion sharpened the motivation. As general models improve at syntax, a VTK-specific system should contribute application knowledge and tool connections rather than compete only at autocomplete. An ontology and knowledge graph become most valuable when they guide a scientific application through structured domain choices.

## 7. Auditing and quality controls

The repository includes audits for missing setters, ontology coverage, DSL phrase quality, and mismatched pipeline contracts. Empirical exceptions can reveal legitimate VTK behavior that the declared ontology omits. For example, selected dataset filters accept composite data through VTK's executive even when a narrow port declaration suggests otherwise; observed examples provide evidence for extending their `consumes_any` definitions.

Quality should be evaluated at several levels:

- parser accuracy across diverse Python styles;
- ontology coverage and reviewer agreement;
- API extraction and wrapper-signature accuracy;
- structural versus observed pipeline consistency;
- artifact reproducibility and version alignment;
- graph retrieval precision and ranking calibration; and
- end-to-end improvements in generated code and task completion.

## 8. Status, limitations, and next work

Implemented work includes the repository split, 2,259-record example exchange, API extraction and ontology enrichment, 16-phase ontology, DSL generation and parsing, three graph layers, browsable documentation, and screenshot regression tests.

Continuing priorities include publishing and versioning all three repositories and artifacts; automating the cross-repository rebuild; documenting licenses and corpus provenance; expanding coverage for complex and domain-specific workflows; integrating graph-aware retrieval with `vtk-index`; and creating benchmarks that distinguish API correctness, pipeline validity, rendering similarity, and scientific usefulness.

## 9. Conclusion

The ontology effort has developed into a connected VTK knowledge pipeline rather than a single graph experiment. Executable examples provide evidence, API extraction provides version-specific facts, and the ontology supplies meaning and constraints. Together they create a foundation for machine-readable documentation, graph-aware retrieval, structured prompting, validation, and application-specific assistants.