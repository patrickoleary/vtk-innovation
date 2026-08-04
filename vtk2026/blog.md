# VTK 2026: Release, Explain, Improve, Repeat

An open source project does not move forward through code alone. New capabilities have to be assembled into releases, explained to the people who might use them, and maintained by a community willing to work through the less glamorous problems that accumulate over time. VTK's 2026 activity shows all three parts of that cycle.

The VTK 9.6 release line delivered a broad set of changes in February, followed by patch releases in March and May. A focused series of Kitware articles translated those changes into practical stories about Python, WebAssembly, WebGPU, polyglot development, notebooks, and faster polyhedron processing. Then, on May 13, the VTK community paused feature work long enough to close issues, stabilize builds, address thread safety, and open new merge requests. In parallel, the team discussed a broader “VTK Days” event that would combine contributor recognition, technical presentations, community participation, and hands-on work. By late July, three VTK 9.7 release candidates were carrying that momentum toward the next release and the planned WebGPU transition in VTK 10.

## 1. The Challenge

VTK  (see [repository](https://gitlab.kitware.com/vtk/vtk) and [website](https://vtk.org/)) is a mature toolkit with a large and varied audience. It supports C++, Python, JavaScript, Java, C#, Julia, and other languages; native desktops and browsers; structured, unstructured, image, volume, and composite data; and a wide range of operating systems, compilers, graphics drivers, and downstream applications. A change that looks small in one module may affect packaging, wrappers, examples, continuous integration, or a platform that the original developer does not use.

That breadth creates several communication and maintenance problems.

First, release notes alone are too dense to explain why a new capability matters. Second, blog posts can make progress visible but may hide the release engineering and testing that make the examples reliable. Third, feature development can crowd out issue triage, flaky-test repair, concurrency fixes, and old portability assumptions. Finally, a geographically distributed community needs deliberate opportunities to recognize contributors, present work in progress, invite new participation, and work together across time zones.

The challenge is to connect these activities so that releases are understandable, communication is technically grounded, and maintenance work changes the trajectory of the next release.

## 2. The Implementation

The 2026 release cycle established the foundation. VTK 9.6.0 was tagged in February and delivered generated JavaScript wrappers, WebAssembly standalone and remote sessions, ONNX support, Wayland improvements, an AMR data-model refactor, Python free-threading support, array and dispatch performance work, and a large collection of rendering, I/O, and filter improvements. VTK 9.6.1 and 9.6.2 followed with focused corrections, including PBR energy compensation, WebGL render-pass fixes, safer array and filter behavior, faster serialization of unchanged arrays, DICOM metadata fixes, and a lower-CPU Win32 event loop.

The blog series made that engineering legible. Some articles taught productive interfaces: concise Python pipeline syntax, trame applications inside Jupyter, and familiar Tcl/Tk-style experimentation through Python. Others explained architecture: compiled C++ VTK in WebAssembly, WebGPU as a common graphics layer, and the relationship between VTK, VTK.js, trame, and modern workflows. Performance articles documented the algorithms and measurements behind polyhedron processing and a possible consolidation of two polydata mappers.

The May 13 hackathon supplied a concentrated maintenance pass. Contributors closed more than 50 issues, applied more than 40 classification labels, assigned more than 25 issues, and opened more than 15 merge requests. The work covered thread safety, crashes, WASM examples, Apple builds, Exodus/XDMF/XML I/O, legacy type assumptions, C++20 preparation, scalar bars, cell gradients, volume data, shaders, and documentation.

VTK Days was discussed as a broader follow-on event rather than a replacement name for the hackathon. Planning notes proposed presentations on major VTK developments, recognition of internal and external contributors, invitations for wider community participation, and dedicated coding time. A multi-day or split-session format was favored so European and West Coast contributors could participate without one region carrying the full scheduling burden. August or September was discussed tentatively, with an emphasis on announcing the event months in advance. As of August 3, those discussions had not produced a publicly confirmed date or completed event.

The next release branch then absorbed and tested the year's work. VTK 9.7 RC1, RC2, and RC3 were tagged between late June and July 28. The final release was scheduled for August 3, 2026. At the time this report was verified, the official PyPI page still identified 9.6.2 as the latest stable package, so this document treats 9.7.0 as scheduled but not yet independently confirmed as published.

## 3. The Example

The WebGPU work illustrates how the cycle fits together.

Development began with architectural changes that separated native window ownership from graphics rendering and expanded WebGPU mappers, lighting, images, skyboxes, and resource handling. The VTK 9.6 release made parts of the WebAssembly and rendering foundation broadly available. Two April and May articles then explained both the ambition and the tradeoff: WebGPU could provide one portable path across desktop and browser, but it would not expose every platform-specific optimization.

The hackathon addressed surrounding friction—WASM build behavior, Apple configuration, 16-bit volume data, shader layouts, and noisy tests—that could prevent users from reaching the new renderer. It also acted as a small-scale proof point for VTK Days: 15 people participated, including six external contributors, and several indicated interest in joining a future physical gathering in Clifton Park. The planned VTK Days format would add talks, contributor recognition, and broader community invitations to that hands-on model. The 9.7 release candidates provided the next integration point, with WebGPU available for opt-in testing before the proposed change of default backend in VTK 10.

This is more useful than a simple feature announcement. Architecture creates the capability, releases create a reproducible baseline, articles teach users how to evaluate it, focused maintenance removes adoption barriers, and release candidates collect feedback before a larger transition.

## 4. Why This Matters?

Medical and scientific software earns trust differently from a short-lived application. Users need to know not only that a feature exists, but that its data model, performance, packaging, and platform behavior have been considered. A release cadence provides stable checkpoints. Technical blogs reveal the reasoning and measurements behind changes. Hackathons create room for community maintenance that might otherwise remain perpetually behind the next feature.

VTK Days would address another part of trust: recognition and sustained relationships. Presentations let contributors explain work before it is reduced to release-note bullets. Awards or acknowledgments make external and internal labor visible. Shared coding sessions turn talks into follow-up work, while advance scheduling and split sessions give a global community a realistic chance to join.

The 2026 activity also broadens who can participate. Python syntax and Jupyter examples reach domain researchers. JavaScript wrappers, VTK-WASM, and WebGPU reach web developers. Polyglot examples show that the C++ core can support different interface languages without fragmenting the implementation. Detailed performance articles give expert users enough evidence to evaluate design decisions. Public issue triage and assigned ownership make the maintenance queue more approachable for contributors.

Together, these activities turn modernization into a community process rather than a one-time rewrite.

## 5. Conclusion

VTK's 2026 story is not one release, one blog post, or one day of hacking. It is a reinforcing loop.

VTK 9.6 established a substantial technical baseline. The blog series connected that work to real workflows and made the project's direction visible. The May hackathon reduced technical debt and gave difficult issues owners. The VTK Days discussions outlined how that one-day momentum could become a more inclusive program of talks, recognition, and collaborative development. The VTK 9.7 candidates then prepared the next checkpoint and invited testing ahead of the more consequential VTK 10 and WebGPU plans.

Release, explain, improve, and repeat: that is how a mature toolkit continues to evolve without leaving its users or its accumulated engineering knowledge behind.