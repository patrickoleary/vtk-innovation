# VTK 2026 Technical Report

## 1. Purpose and methodology

This document analyzes four kinds of VTK activity during 2026  (see [repository](https://gitlab.kitware.com/vtk/vtk) and [website](https://vtk.org/)):

- core VTK releases and candidates;
- selected official Kitware articles about VTK technology and use; and
- the May 13 VTK developer hackathon; and
- internal project discussions about a proposed VTK Days community event.

The report compares official release notes, release-planning posts, PyPI package history, Kitware articles, the public hackathon summary, VTK merge requests, project meeting transcripts, and the existing 2026 activity report. It does not treat publication as proof that every roadmap item is complete, distinguishes release tags from package uploads and announcements, and separates a discussed event from a publicly scheduled or completed event.

## 2. Release chronology

### VTK 9.6.0

The VTK documentation records February 9, 2026 as the release date. Python wheels appeared on PyPI on February 11, and Kitware published its feature overview on February 18. These dates describe different parts of the release process rather than a contradiction.

VTK 9.6 was a broad platform release. The generated JavaScript wrapper frontend and standalone/remote WebAssembly sessions made compiled VTK available through a new browser-facing object model. Runtime selection between WebGL and WebGPU and the availability of 64-bit WASM packages advanced the web deployment path.

Outside WASM, the release added native ONNX inference, improved Wayland and Java support, Python free-threading compatibility, stream support in readers, and extensive array/data-model work. `vtkUniformGridAMR` moved onto partitioned-dataset infrastructure; `vtkCartesianGrid` created a common abstraction for image and rectilinear data; array dispatch and range computation improved; observer operations became logarithmic; and many implicit-array, cell-array, statistics, validation, and filtering paths changed.

This breadth explains why the release article was followed by several narrower posts. No single release summary could teach language wrappers, Python notation, notebook integration, WASM, WebGPU, and data-model changes at useful depth.

### VTK 9.6.1

The first patch release focused on corrections and stabilization. PBR image-based lighting gained multiple-scattering energy compensation so rough metals did not appear artificially dark. WebGL/GLES framebuffer behavior was corrected. EGL and OpenGL initialization messages became more accurate. Array conversions, image batching, renderer changes, Qt key mappings, big-endian math text, and post-processing passes received fixes.

The patch demonstrates why release communication should distinguish architectural milestones from adoption work. A user may notice the release primarily because a renderer no longer crashes or emits an incorrect warning, even though those changes are less likely to headline a blog post.

### VTK 9.6.2

The May patch release improved incremental serialization by skipping arrays whose modification time was older than the recorded state. This directly supported VTK-WASM and trame-vtklocal scenes containing many unchanged arrays.

Other fixes covered null `vtkPoints` in point-cloud conversion, HyperTreeGrid concurrency and performance, DICOM scientific notation, low-CPU Win32 idle behavior, floating-point boundary colors, and SSAA across multiple viewports. The collection reinforces the cross-project character of modern VTK releases: browser synchronization, desktop interaction, medical metadata, parallel processing, and rendering can all be present in one patch line.

### VTK 9.7 candidates

The 9.7 branch split on June 27. RC1 followed immediately, RC2 was tagged by July 17, and RC3 on July 28. The published schedule moved several times as candidates and wheels required more testing, eventually targeting August 3 for the final release.

The planning post positioned VTK 9.7 as the opt-in WebGPU evaluation release ahead of a possible VTK 10 default-backend change. That makes candidate feedback especially important. Applications with custom OpenGL behavior, advanced render passes, volumes, or unusual platform configurations need a stable checkpoint in which to test the new backend without losing the established default.

At the time of verification on August 3, the official PyPI package page still listed 9.6.2 as the latest stable version. This report therefore does not claim that the final 9.7.0 artifacts had been published, even though the final date was scheduled for that day.

## 3. Article summaries

### [VTK 9.6.0](https://www.kitware.com/vtk-9-6-0/) — February 18

The release overview connects a large technical changelog to recognizable themes: JavaScript/WASM access, ONNX, Python and Java improvements, Wayland, AMR, arrays, I/O, rendering, and performance. It serves as the index for the year's more focused explanations.

### [VTK the Polyglot](https://www.kitware.com/vtk-the-polyglot/) — February 20

The article shows a common cone pipeline in multiple languages. Its architectural point is that wrapper languages reuse the C++ toolkit's algorithms and pipeline rather than developing independent implementations. Language choice becomes an interface decision rather than a different visualization engine.

### [VTK + Tcl/Tk: The Return](https://www.kitware.com/vtk-tcl-tk-the-return/) — February 25

This experimental work preserves the concise interactive style associated with early Tcl/Tk VTK development without reviving the retired native wrapper. `libtclpy` routes Tcl-like scripting through the maintained Python bindings, showing how productive interaction patterns can survive even when their original implementation is no longer sustainable.

### [VTK + trame + Jupyter = magic](https://www.kitware.com/vtk-trame-jupyter-magic/) — March 2

The post embeds a trame application in a notebook so users can remain in Python while interacting with a browser-delivered VTK view. It avoids a blocking native interactor loop and places visualization alongside exploratory analysis, which is increasingly where users expect it.

### [VTK.js v35 Release](https://www.kitware.com/vtk-js-v35-release/) — March 2

VTK.js v35 expanded web-native filters, readers, writers, volume capabilities, text, controls, and labelmap rendering while modernizing its documentation and example gallery. It is important to the broader narrative because VTK.js and VTK-WASM are complementary: one is JavaScript-native, while the other exposes compiled C++ VTK in the browser.

### [VTK Pipelines in Python](https://www.kitware.com/vtk-pipelines-in-python/) — March 14

This article explains the `>>` connection syntax for expressing VTK pipelines in readable Python. It covers branching, multiple ports, multiple inputs, and callable pipeline objects. The change does not replace VTK's execution model; it makes dataflow more visible in user code.

### [How VTK Is Evolving to Support Modern Visualization Workflows](https://www.kitware.com/how-vtk-is-evolving-to-support-modern-visualization-workflows/) — April 1

The overview links simulation data, AMR, language access, WASM, trame/Jupyter, and AI-assisted workflows. It frames visualization as part of an ongoing analysis and collaboration process instead of the last offline step after a computation.

### [WebGPU – One Graphics API To Rule Them All](https://www.kitware.com/webgpu-one-graphics-api-to-rule-them-all/) — April 2

This article presents the sustainability case for WebGPU and Dawn: one modern rendering layer can span native graphics APIs and browsers. Its roadmap organizes the transition from foundational desktop/mapping work through images, passes, volumes, and a VTK 10 target.

### [What It Takes to Support Cross-Platform Graphics Today](https://www.kitware.com/what-it-takes-to-support-cross-platform-graphics-today-a-practitioners-perspective-on-webgpu/) — May 5

The companion article adds engineering caution. A portable API cannot expose every native optimization, and specialized software may still need direct APIs. The argument for WebGPU is reduced duplicated maintenance and a competitive common feature set, not universal superiority.

### [Polyhedron Processing Improvements in VTK](https://www.kitware.com/polyhedron-processing-improvements-in-vtk/) — June 4

The article explains how general polyhedra forced important filters onto slow serial fallbacks. Deterministic geometric methods and an O(E) polygon-tracing approach moved polyhedral contouring, cutting, clipping, and surface extraction into faster threaded paths. Reported improvements ranged from roughly sixfold for surface extraction to tens of times faster for contouring and clipping, depending on the workload.

### [One PolyData Mapper Instead of Two](https://www.kitware.com/one-polydata-mapper-instead-of-two-measuring-vertex-pulling-on-the-desktop/) — June 11

This post tests whether the low-memory mapper's vertex-pulling strategy is inherently slower on desktop GPUs. Measurements using indexed drawing showed that pulling could match or outperform the classic path on the reported hardware. The result supports consolidating duplicate mapper implementations when evidence permits, while retaining specialization for measured cases.

## 4. What the blog series communicates

The series has a deliberate progression:

| Layer | Representative articles | Message |
|---|---|---|
| Availability | VTK 9.6.0, VTK.js v35 | What users can obtain now |
| Access | Polyglot, Tcl/Tk, Python pipelines | How different developers reach the same core |
| Workflow | trame/Jupyter, modern workflows | Where visualization fits in current analysis environments |
| Architecture | WebGPU articles | Why internals are changing and what tradeoffs apply |
| Evidence | Polyhedron, vertex pulling | Which performance and maintenance claims are supported by measurements |

This combination is stronger than a sequence of release announcements. It gives newcomers entry points while preserving technical depth for maintainers and advanced users.

## 5. Hackathon design and outcomes

The event ran from 9:00 a.m. to 4:00 p.m. EDT on May 13. Its stated goals were to shrink the issue tracker, clean up noisy or flaky dashboards, and review merge requests. Contributors could participate through coding, review, pairing, or triage.

### Issue triage

More than 50 issues were closed. More than 40 labels were applied to distinguish confirmed issues, requests for information, reproducible examples, and other categories. More than 25 issues were assigned. These actions reduce the cost of future contribution because an issue with a status, reproducer, and owner is more actionable than an unclassified report.

### Thread safety and concurrency

The group investigated data races and assigned longer-term work in `vtkFreeTypeTools`, `vtkSMPMergePoints`, `vtkStaticCellLocator`, and `vtkSurfaceNets`. ThreadSanitizer findings are rarely resolved by one-day patches alone, so named ownership is a meaningful outcome.

### Correctness

Work included thread safety in `vtkSMPMergePoints::Merge`, trame-vtk unhashable regressions, duplicate-array crashes in XML readers, polyhedron cutter failures, and `vtkXYZMolReader2` behavior for files without timesteps.

### Platforms, I/O, and builds

WASM examples and Apple CMake configurations received attention. Exodus, XDMF2, XML, and legacy VTK format paths were improved, including double-precision handling and assumptions around `sizeof(long)`. C++20/GCC compatibility work helped prepare the toolchain transition.

### Rendering

Tasks involved scalar-bar labels, quadratic-triangle gradients, 16-bit WASM volume data, Mesa shader layouts, and Vulkan/X11 documentation. These items connect maintenance directly to the WebGPU/WASM modernization themes described in the articles.

### Follow-through

More than 15 merge requests were opened during the event. The published next step was explicit: review and merge them. This matters because hackathon output should be judged by later integration and test stability, not only by the number of branches created during the day.

## 6. Proposed VTK Days

### Purpose

The planning discussions defined VTK Days as more than a larger hackathon. Its intended purpose was to strengthen the VTK community through four activities:

1. **Recognize contributions.** Make internal and external work visible and consider awards or formal acknowledgment.
2. **Present current work.** Give contributors room to explain architectural changes, experiments, and roadmaps in more depth than a release-note entry.
3. **Invite participation.** Use the event and repeated advance announcements to bring more users and external developers into the project.
4. **Work together.** Preserve coding, review, and collaborative problem-solving alongside the presentations.

This makes VTK Days complementary to the other mechanisms in the report. A release is a software checkpoint. A blog is an asynchronous explanation. A hackathon is a concentrated work session. VTK Days was conceived as a community program combining explanation, recognition, recruitment, and implementation.

### Planning chronology

In the January 26 project meeting, participants noted that the year was already advancing and that the event needed active ownership and continued planning. They explicitly did not want the event blocked by one person's limited availability.

By March 23, a planning document existed. Discussion emphasized that the event should recognize both Kitware and external contributors and grow community participation. Potential presentation subjects included VTK simplification, the website and documentation, WASM, WebGPU, serialization, and new widgets. Organizers discussed August or September rather than the middle of summer and wanted an announcement roughly four months in advance with recurring reminders.

The proposed format changed from one eight-hour day to multiple shorter sessions. Two four-hour days were discussed, potentially with two hours of presentations and two hours of coding each. Another option was to separate programming and presentation days. The time-zone goal was explicit: distribute inconvenience between Europe and the U.S. West Coast rather than exclude one group with a single fixed block.

After the May 13 hackathon, the planning had new evidence. The hackathon drew 15 attendees, six from outside Kitware, and several external contributors expressed interest in joining a future physical event at Clifton Park. The hackathon was still described as distinct from VTK Days, but it validated interest in synchronous community work.

On June 15, the team reaffirmed that it wanted to hold VTK Days and identified the next practical needs: choose a date, form an organizing group, identify talks and speakers, and decide whom to recognize. The notes do not show those actions reaching a public announcement by August 3.

### Status and interpretation

The source record supports the following status:

- VTK Days was an active 2026 planning topic.
- Its intended scope and possible format were substantially defined.
- The May hackathon informed the plan but was not itself VTK Days.
- August or September was tentative, not a confirmed schedule.
- No reviewed public Kitware event page or VTK Discourse announcement supplied a final date or agenda by August 3.

This distinction matters in an external report. VTK Days is evidence of deliberate community-building work and a developed event concept, but it should not be counted as a completed 2026 dissemination event until a date, agenda, or post-event record is available.

## 7. Cross-cutting analysis

### Modernization is occurring at several layers

WebGPU changes rendering architecture. VTK-WASM changes deployment. Python notation and notebooks change interaction. ONNX and AI-assisted tools change analysis. AMR and polyhedron work change the data-processing foundation. The release and blog program presents these as related adaptations to modern scientific workflows rather than unrelated features.

### Performance and maintainability reinforce each other

The polyhedron work removes serial fallbacks. The vertex-pulling study questions the need for two mappers. MTime serialization avoids unnecessary work. Each can improve performance while also reducing special cases, duplicate code, or repeated transfers.

### Patch releases are part of adoption

Features become usable through corrections to event loops, memory ownership, metadata parsing, render passes, packaging, and platform behavior. The 9.6.1 and 9.6.2 lines should be part of the public story, even when feature articles naturally emphasize 9.6.0.

### Hackathons can restructure maintenance queues

Closing an issue is useful; labeling, assigning, and reproducing unresolved issues can be equally valuable. The May event combined immediate fixes with an ownership model for work that could not be completed in one day.

### VTK Days would connect recognition to contribution

The proposed event adds something releases, blogs, and hackathons do not provide alone: a place to recognize contributors publicly, explain ongoing work interactively, recruit participants, and then translate discussion into shared implementation. The multi-session time-zone planning also treats global access as part of community infrastructure.

## 8. Risks and communication gaps

Several areas deserve continued attention:

- release pages, Git tags, PyPI uploads, wheels, and announcements can appear on different dates; user-facing reports should state which event they mean;
- roadmaps should distinguish merged capabilities from work in progress, particularly WebGPU volume rendering and render passes;
- VTK.js and VTK-WASM need clear selection guidance;
- performance articles should continue publishing hardware, dataset, settings, and comparison limitations;
- hackathon merge requests need later status tracking; and
- VTK Days should not be described as scheduled or completed until a public date, agenda, or event record exists;
- the move toward VTK 10 needs migration guidance for custom OpenGL code and downstream projects.

## 9. Items to watch after August 3, 2026

1. Confirmation and package publication of VTK 9.7.0.
2. User feedback from opt-in WebGPU testing.
3. Completion of WebGPU volume rendering, image slices, and render-pass coverage.
4. VTK 10 timing and the decision on the default rendering backend.
5. Follow-through on hackathon merge requests and assigned concurrency work.
6. Whether VTK Days receives a confirmed date, organizing group, public agenda, speaker list, and contributor-recognition plan.
7. Additional blog posts that show complete applications, migration paths, and measured comparisons.
8. Continued coordination among VTK releases, corresponding WASM bundles, Python wheels, and trame-vtklocal contract tests.

## 10. Conclusion

VTK's 2026 releases, technical articles, hackathon, and VTK Days planning form a coherent project and community strategy. VTK 9.6 delivered a wide technical baseline and two corrective releases. The blog series taught users how that work affects languages, notebooks, browsers, rendering, and performance. The hackathon reduced backlog and platform friction while assigning longer-running reliability work. The VTK Days concept extended that momentum toward recognition, presentations, recruitment, and collaborative development. The 9.7 candidates prepared the next technical evaluation point ahead of VTK 10.

The most important result is the cycle itself: stable releases, honest technical explanation, concentrated maintenance, and feedback-driven candidates. That cycle allows a mature open-source toolkit to modernize while preserving the reliability and community knowledge that made it valuable.

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

## Point-in-time note

Release, package, and event status was checked on August 3, 2026. The final VTK 9.7.0 release was scheduled for that date, but VTK 9.6.2 remained the latest stable version shown on the official PyPI page at the time of verification. VTK Days had been actively discussed, but no reviewed public event page or announcement provided a confirmed date or agenda. Counts and status should be refreshed before external publication if this document is used after that date.
