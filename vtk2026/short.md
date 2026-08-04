# VTK 2026 Technical Report

## Scope and status

This report reviews VTK  (see [repository](https://gitlab.kitware.com/vtk/vtk) and [website](https://vtk.org/))  releases, selected Kitware VTK articles, the May 13 hackathon, and planning discussions for VTK Days from January 1 through August 3, 2026. Release and event status are point-in-time observations:

| Release | Project date/status | Significance |
|---|---|---|
| VTK 9.6.0 | Tagged February 9; PyPI artifacts February 11; public article February 18 | Main 2026 feature baseline |
| VTK 9.6.1 | March 24–26 release window | Corrective rendering, platform, and array work |
| VTK 9.6.2 | Tagged May 15; PyPI May 19; announcement May 20 | Serialization, correctness, performance, and event-loop fixes |
| VTK 9.7.0 RC1 | June 27 | First candidate after release-branch split |
| VTK 9.7.0 RC2 | Tagged by July 17 | Candidate with wheel generation/testing |
| VTK 9.7.0 RC3 | July 28 | Planned final candidate |
| VTK 9.7.0 final | Scheduled August 3 | Not yet independently confirmed on PyPI when checked |
| VTK 10.0.0 | Planned December 2026 | Proposed WebGPU default, with OpenGL opt-out |

The difference among a Git tag, documentation release date, PyPI artifact upload, announcement, and planned date is intentional. These events may occur on different days.

## Release themes

VTK 9.6.0 included changes across nearly every subsystem. High-level themes were:

- **Web deployment:** generated JavaScript bindings, standalone/remote WASM sessions, browser serialization fixes, and wasm exceptions.
- **Data and performance:** array abstractions, O(1) dispatch for known arrays, faster ranges, reduced `GetVoidPointer()` use, and major `vtkFieldData` copy improvements.
- **Modern workflows:** native ONNX inference, Python free-threading, Wayland support, restored Java packaging/testing, and stream-capable readers.
- **Data-model evolution:** AMR restructuring around partitioned datasets, a common Cartesian-grid abstraction, and improved cell/array representation.
- **Rendering and analysis:** WebGPU preparation, PBR and image improvements, new statistics structures, nonlinear mesh-quality support, and numerous correctness fixes.

VTK 9.6.1 stabilized PBR image-based lighting, WebGL/GLES render passes, EGL/OpenGL warnings, array conversion, image batching, and platform-specific behavior. VTK 9.6.2 accelerated unchanged-array serialization, reduced idle CPU use on Windows, corrected DICOM scientific notation, fixed null-point and HyperTreeGrid cases, and repaired scalar-range and multi-viewport rendering behavior.

## Blog program

The selected articles fall into four groups:

1. **Release and language access:** VTK 9.6.0; VTK the Polyglot; VTK + Tcl/Tk.
2. **Python and interactive workflows:** VTK + trame + Jupyter; VTK Pipelines in Python; modern visualization workflows.
3. **Web and graphics modernization:** VTK.js v35; WebGPU as a common API; the practitioner's WebGPU perspective.
4. **Core performance and maintainability:** polyhedron processing; measuring vertex pulling to consolidate polydata mappers.

The series moves from what shipped, to how people can use VTK, to how the toolkit's internals are changing. Its strongest posts include a concrete example or measurement rather than only a roadmap.

## Hackathon outcomes

The May 13 event emphasized technical debt and execution rather than a single showcase feature. Reported outcomes were:

- more than 50 issues closed;
- more than 40 classification labels applied;
- more than 25 issues assigned; and
- more than 15 merge requests opened.

Technical work covered `vtkSMPMergePoints`, `vtkFreeTypeTools`, `vtkStaticCellLocator`, `vtkSurfaceNets`, XML readers, polyhedron cutting, `vtkXYZMolReader2`, Exodus, XDMF2, the legacy VTK format, WebAssembly examples, Apple CMake configurations, scalar bars, cell gradients, 16-bit volume rendering, Mesa shader layouts, and Vulkan/X11 documentation.

The event's durable output was not only merged code. It converted an unstructured backlog into classified and owned work and gave longer-running concurrency problems named maintainers.

## VTK Days planning

VTK Days was discussed as a separate, broader community format. The planning evolved through the first half of 2026:

- **January:** the team agreed that planning needed an owner and should not depend on one contributor's availability.
- **March:** organizers defined goals beyond hackathon coding: recognize internal and external contributions, invite more participation, present major VTK work, and include collaborative programming. August or September was considered tentatively, with a four-month announcement lead time.
- **Format:** multiple shorter days or sessions were preferred over one eight-hour block so Europe and the U.S. West Coast could both participate. Presentations and programming could be separated.
- **Topics:** proposed talks included VTK simplification, website/documentation work, WebAssembly, WebGPU, serialization, and widgets.
- **May:** the hackathon attracted 15 participants, six external. Several external contributors indicated interest in attending a future physical event at Kitware's Clifton Park location.
- **June:** the team reaffirmed interest and called for a date, organizing group, talk list, and contributor-recognition plan.

No public final date, agenda, or completed VTK Days event was identified by August 3. The accurate status is **actively discussed and conceptually defined, but not publicly scheduled in the reviewed sources**.

## Interpretation

The releases, blogs, hackathon, and VTK Days concept form a healthy open-source loop:

```text
engineering work -> release candidate -> stable release
        |                                |
        v                                v
 technical explanation <- user feedback and examples
        |                                |
  VTK Days: talks, recognition, community invitations
        |                                |
        +-------- hackathon/triage -------+
```

Release engineering creates reproducibility. Articles create understanding and attract testing. Triage and concentrated maintenance remove friction discovered by users. VTK Days would add contributor recognition, structured presentations, and a recurring invitation to the broader community. That work and feedback then enter the next candidate cycle.

## Primary sources

### Releases and planning

- [VTK repository](https://gitlab.kitware.com/vtk/vtk)
- [VTK 9.6 release notes](https://docs.vtk.org/en/latest/release_details/9.6.html)
- [VTK on PyPI](https://pypi.org/project/vtk/)
- [VTK 9.7.0 and 10.0.0 release planning](https://discourse.vtk.org/t/vtk-9-7-0-and-10-0-0-release-planning/16371)
- [VTK announcements](https://discourse.vtk.org/c/announcements/5)

### Articles and event

- [VTK articles on Kitware's blog](https://www.kitware.com/tag/vtk/)
- [VTK Hackathon – May 13, 2026](https://www.kitware.com/vtk-hackathon-may-13-2026/)
- [VTK Hackathon event page](https://www.kitware.com/events/vtk-hackathon/)