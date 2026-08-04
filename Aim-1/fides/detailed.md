# Fides-Conduit Technical Report

## 1. Background and motivation

Visualization readers sit at the boundary between storage and meaning. They identify variables, decode metadata, reconstruct topology, establish field associations, expose time, and create concrete VTK objects. That boundary is difficult because medical and scientific storage formats are intentionally general: HDF5 and ADIOS2 can hold almost any hierarchy, while the visualization model needs to know which arrays are coordinates, which define cells, and which are attributes.

A bespoke reader encodes that knowledge in C++. This can deliver an excellent end-user experience for a stable public format, but it is costly for research data that changes frequently or is already accessible through Python. Repeated reader implementations also mix two different concerns:

- **data acquisition:** obtaining bytes and arrays from files, services, or live memory; and
- **data interpretation:** mapping those arrays into visualization structures.

Fides (see [repository](https://fides.readthedocs.io/en/latest/?badge=latest) and [documentation](https://fides.readthedocs.io/en/latest/?badge=latest)) makes interpretation declarative. Conduit makes memory-resident data describable. Their integration creates a boundary between the two.

## 2. Fides data models

A Fides model is a JSON document that connects data-source variables to visualization concepts. Typical sections describe coordinate systems, cell sets or topologies, and fields. More advanced models can express partitions, blocks, time, selections, and multiple sources.

Declarative mapping has several operational advantages:

- schemas can be version controlled independently from reader code;
- a schema can be inspected without stepping through a parser;
- mappings can be reused across many timesteps;
- equivalent data layouts can share test fixtures; and
- source-specific backends can target the same logical model.

The schema remains code in the broader sense: it should be reviewed, tested against representative data, and updated when upstream layouts change.

## 3. Conduit as an in-memory source

Conduit's central abstraction is the `Node`, a hierarchical container that can own values or refer to external memory. Nodes can represent scalar metadata, nested objects, lists, and typed arrays. Conduit Blueprint defines conventions for common medical and scientific structures, including meshes, though a Fides data source can also use an application-specific hierarchy when the Fides schema describes it.

External-memory references are useful but conditional. A true no-copy path depends on:

- compatible scalar type and endianness;
- a layout that the consumer can use;
- suitable alignment and contiguity;
- the absence of transformations requiring new storage; and
- source memory that remains valid while Fides and VTK use it.

Documentation should therefore say that the integration *supports zero-copy or reduced-copy workflows where possible*, rather than claiming that every mapping is automatically zero copy.

## 4. Backend architecture

Fides began with ADIOS2 as its principal source. The original design naturally accumulated ADIOS2-specific assumptions in reader and data-source classes. Conduit integration required a more general backend boundary.

The backend layer is responsible for resolving named arrays, metadata, blocks, and selections from a source. The data-model layer should consume those arrays without knowing whether they came from an ADIOS2 variable, a Conduit path, or another future provider. Registries and factories contain source-specific implementations and avoid exposing Conduit or ADIOS2 types throughout the core API.

This separation preserves existing ADIOS2 workflows while adding in-memory sources. It also provides a testable contract: given equivalent arrays and metadata, different backends should construct equivalent visualization datasets.

## 5. VTK integration

The `vtkIOFides` module adapts Fides to VTK's pipeline. `vtkFidesReader` parses a data model, accepts source configuration, responds to pipeline information/update requests, and produces a VTK data object. For Conduit, the application associates a Node with a source name used by the schema.

Pipeline integration must handle more than the initial conversion. It needs to report output type and metadata, respect requested time or pieces where supported, propagate errors, and maintain object lifetimes across VTK update calls. Python wrapping must also preserve the relationship between NumPy/Conduit memory and the C++ reader.

[VTK !12641](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12641) established the initial Conduit-facing support. [VTK !13397](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13397) switched the reader/writer toward Fides's native VTK backend. This evolution matters for both capability and maintenance: a VTK-native target avoids converting first into another framework's dataset and then into VTK.

## 6. Testing strategy

Schema-driven systems need tests at several layers:

### Backend tests

These verify that a source resolves the correct values, shapes, selections, and metadata.

### Mapping tests

These verify coordinates, topology, fields, associations, blocks, and time independently of the original storage mechanism.

### VTK pipeline tests

These verify output dataset types, array values, update behavior, Python wrapping, and downstream filter compatibility.

### Cross-backend equivalence tests

These compare ADIOS2, Conduit, and other sources that represent the same logical dataset.

Fides's 2026 unstructured-grid testing is a useful example. Deterministic inputs cover homogeneous and mixed cells, scalar and vector point/cell fields, several schema-delivery modes, embedded metadata, multi-source data, block selection, and partition counts. Such tests make the backend abstraction credible because they verify meaning rather than merely checking that a read call completes.

## 7. Performance and memory behavior

Performance depends on the entire path:

- source-library read or generation cost;
- Node construction;
- copies or external references;
- schema evaluation;
- connectivity and field conversion;
- dataset construction; and
- downstream VTK operations.

The integration can remove temporary-file conversion and duplicate parsers, which is often the largest workflow improvement. Zero-copy access can further reduce memory traffic, but only when the target VTK representation can share the supplied storage safely. Benchmarks should report both elapsed time and peak memory for representative structured, unstructured, partitioned, and time-varying datasets.

## 8. Use cases

### Python prototyping

A researcher reads with h5py, netCDF4, xarray, pandas, or a proprietary package; converts selected arrays to a Node; and iterates on the Fides schema.

### In situ and streaming workflows

A simulation exposes live arrays through Conduit. Fides maps the current state without writing an intermediate visualization file.

### Proprietary engineering data

An existing vendor SDK remains responsible for decoding the format. The project adds only the Conduit/Fides bridge required to reach VTK.

### AI and experiment pipelines

Rapidly changing NumPy arrays and metadata can be visualized before the team standardizes a durable file format.

## 9. Risks and future work

The main adoption risk is shifting complexity from C++ into an undocumented schema. High-quality examples, validation messages, schema diagnostics, and inspection tools are therefore essential. Other priorities include:

- more complete Conduit hierarchy and mixed-topology coverage;
- time, partition, and selection behavior;
- Python lifetime documentation;
- comparative ADIOS2/Conduit/native-VTK testing;
- packaging and CI configurations that include compatible dependencies;
- performance measurements for shared-memory paths; and
- examples that start from common user tools such as h5py and xarray.

The native VTK backend should also be exercised with downstream filters that stress ghost arrays, field associations, composite data, and complex cell types.

## 10. Conclusion

Fides and Conduit provide a reusable mapping boundary between data acquisition and visualization. The user brings arrays and a schema; Fides interprets them; VTK receives native datasets. The 2026 backend and testing work makes this more than a Python convenience: it is an extensible I/O architecture for files, live memory, and future medical and scientific data providers.

## Primary sources

- [Fides repository](https://gitlab.kitware.com/vtk/fides)
- [VTK repository](https://gitlab.kitware.com/vtk/vtk)
- [Conduit documentation](https://llnl-conduit.readthedocs.io/)
- [VTK !12641: initial Fides/Conduit support](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12641)
- [VTK !13397: native VTK backend for the Fides reader/writer](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13397)
- [Fides !228: comprehensive unstructured-grid tests](https://gitlab.kitware.com/vtk/fides/-/merge_requests/228)
- [Fides !204: CI stability improvements](https://gitlab.kitware.com/vtk/fides/-/merge_requests/204)

