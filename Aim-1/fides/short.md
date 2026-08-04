# Fides-Conduit Technical Report

## Purpose and scope

Fides (see [repository](https://fides.readthedocs.io/en/latest/?badge=latest) and [documentation](https://fides.readthedocs.io/en/latest/?badge=latest)) is a data-model mapping layer for medical and scientific visualization. It describes how source arrays become coordinate systems, cell topologies, and associated fields. Conduit is a hierarchical in-memory data representation. Their integration allows memory-resident medical and scientific data to be mapped into VTK without implementing a complete file reader.

The workflow is:

1. acquire arrays with an existing application, simulation API, or Python reader;
2. place or reference those arrays in a Conduit Node;
3. provide a Fides JSON data model;
4. pass both through `vtkFidesReader`; and
5. use the resulting VTK data object in normal filters and rendering.

## Separation of responsibilities

| Layer | Responsibility |
|---|---|
| Source library | Opens HDF5, NetCDF, ADIOS2, a proprietary format, or live simulation memory |
| Conduit | Represents hierarchical metadata and arrays in memory |
| Fides | Maps named arrays to visualization concepts |
| VTK | Filters, analyzes, and renders the resulting dataset |

This boundary lets a project change its I/O library without redesigning VTK's visualization model, or update a mapping without changing the parser.

## Implementation

Fides historically coupled its data-model interpretation to ADIOS2. Conduit support required:

- a backend factory or registry;
- a Conduit-specific data-source implementation;
- isolation of Conduit types from unrelated public interfaces;
- reader APIs for assigning named in-memory sources;
- build and CI integration; and
- tests showing that different backends produce equivalent visualization structures.

[VTK !12641](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12641) introduced the `vtkIOFides` Conduit path. [VTK !13397](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13397) subsequently switched the Fides reader and writer toward Fides's native VTK backend. The latter is important because it reduces conversion through a separate intermediate data model and makes VTK's own dataset types the direct target.

## Data-model capabilities

A useful Fides mapping describes:

- uniform, rectilinear, or explicit coordinates;
- structured or unstructured topology;
- cell shapes and connectivity;
- point-, cell-, or whole-dataset fields;
- scalar and vector values;
- blocks and partitions;
- timesteps and selections; and
- one or more named data sources.

Recent Fides tests exercise both single-shape and explicit mixed unstructured cells, including vertices, lines, triangles, quads, tetrahedra, hexahedra, wedges, and pyramids. They verify coordinates, cell shapes, connectivity, fields, associations, partitions, embedded metadata, and multi-source configurations.

## Benefits and constraints

The integration reduces custom reader code, supports fast schema iteration, reuses mature Python/domain readers, and can avoid intermediate files. External Conduit arrays can reduce copying when their memory is contiguous, correctly typed, and kept alive long enough. The caller must still manage ownership and validate that the Fides schema matches the supplied data.

The approach is less appropriate when a standardized file format already has a mature VTK reader, when the data requires complex procedural interpretation that cannot be expressed cleanly in a schema, or when the deployment cannot include Conduit/Fides dependencies. Error reporting and user examples remain important adoption areas because schema mistakes can otherwise appear as downstream mesh problems.

## Primary sources

- [Fides repository](https://gitlab.kitware.com/vtk/fides)
- [VTK repository](https://gitlab.kitware.com/vtk/vtk)
- [Conduit documentation](https://llnl-conduit.readthedocs.io/)
- [VTK !12641: initial Fides/Conduit support](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12641)
- [VTK !13397: native VTK backend for the Fides reader/writer](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13397)
- [Fides !228: comprehensive unstructured-grid tests](https://gitlab.kitware.com/vtk/fides/-/merge_requests/228)
- [Fides !204: CI stability improvements](https://gitlab.kitware.com/vtk/fides/-/merge_requests/204)