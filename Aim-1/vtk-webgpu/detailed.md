# VTK WebGPU Technical Report

## 1. Background

VTK's OpenGL backend has delivered high-quality medical and scientific rendering for many years. Its maturity includes both user-visible capabilities and a large body of engineering knowledge about drivers, platforms, data types, and performance. The cost of that maturity is that the implementation is strongly shaped by OpenGL's state model and by historical platform-window assumptions.

The graphics ecosystem has changed. Apple favors Metal, Windows has Direct3D 12, Linux and high-performance applications use Vulkan, browsers expose WebGL and WebGPU, and Linux desktops are moving from X11 to Wayland. Implementing a full VTK renderer directly for every API would spread limited development and testing resources across several stacks.

WebGPU was designed as a modern portable layer over these systems. Its object model uses explicit buffers, textures, bind groups, pipelines, command encoders, and render passes. Dawn makes that model available as a native library and implements it through platform graphics APIs. Browsers expose a closely aligned API and shader language. This gives VTK (see [repository](https://gitlab.kitware.com/vtk/vtk) and [website](https://vtk.org/)) the possibility of sharing backend concepts and shader work across desktop and web.

### Architectural foundation

Legacy VTK render-window classes combined platform windows and graphics contexts. The new structure divides responsibilities:

1. **Platform layer:** a `vtkHardwareWindow` subclass creates or adopts the native window/canvas and handles native events.
2. **Surface boundary:** the hardware window exposes the platform handle needed to construct a graphics surface.
3. **WebGPU backend:** `vtkWebGPURenderWindow` creates and owns the WebGPU surface, adapter, device, queues, textures, and presentation resources.
4. **VTK scene:** renderers, actors, mappers, cameras, lights, and interactors continue to use VTK abstractions.

[VTK !12360](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12360) is the key native-window/WebGPU integration change. It established hardware-window implementations and extended the backend beyond the earlier SDL/browser experiments.

### 2026 Rendering progress

Selected implementation changes illustrate the 2026 direction:

| Change | Capability |
|---|---|
| [VTK !12851](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12851) | WebGPU 2D image mapping |
| [VTK !13100](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13100) | Signed and unsigned 16-bit textures on GLES3/WASM, important for medical data |
| [VTK !13111](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13111) | Skybox rendering and projection-specific shader work |
| [VTK !13117](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13117) | Batching of identical polydata |
| [VTK !13377](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13377) | WebGPU finalization coordinated with VTK-WASM lifecycle |

The broader work also includes VTK light types, resize correctness, physically based rendering, image slices, render passes, and volume rendering. The exact level of feature parity varies by mapper and platform.

## 2. Windowing and rendering decoupling

The WebGPU effort revealed that VTK's old render-window hierarchy did too much. A class might create an X11 or Win32 window, process native events, create an OpenGL context, manage presentation, and serve as the public VTK render window. For a new backend, every platform combination would have repeated those responsibilities.

`vtkHardwareWindow` makes the native surface an explicit abstraction. Its implementations include:

- `vtkWin32HardwareWindow` for Windows handles;
- `vtkCocoaHardwareWindow` for macOS windows and views;
- `vtkXlibHardwareWindow` for X11;
- `vtkWaylandHardwareWindow` for compositor-managed Wayland surfaces; and
- a WebAssembly hardware window for browser canvases.

The VTK object factory selects the suitable implementation. The renderer sees a stable VTK object and retrieves the native information needed to create a WebGPU surface. Application pipelines do not branch on operating system.

This design also changes ownership in a productive way. `QVTKWebGPUWidget` demonstrates the pattern for Qt integration: Qt owns the visible window while VTK renders into the supplied surface through native-surface handling for Qt-owned windows. The module is conditional on `VTK_ENABLE_WEBGPU` so builds without WebGPU are unaffected, and dedicated tests with image baselines validate the widget on supported platforms. The same ownership model applies to other frameworks: Wayland can allow the compositor to control surface creation, headless configurations can substitute an offscreen target, and graphics backends can be tested or changed without rewriting the native event layer.

## 3. WebGPU render-window responsibilities

`vtkWebGPURenderWindow` is responsible for the graphics lifecycle rather than the operating-system lifecycle. Its work includes:

- selecting an adapter and creating a device;
- creating a WebGPU surface from a hardware-window handle;
- selecting the surface format and presentation mode;
- configuring or reconfiguring the surface on resize;
- allocating color, depth, and multisample textures;
- creating command encoders and render passes;
- submitting commands to the device queue;
- reading pixels for regression tests and application use; and
- finalizing resources when the view or runtime is disposed.

Correct attachment formats are critical at this layer. The backend adopted `DEPTH_24_PLUS_8_STENCIL` to resolve format-mismatch issues that previously caused rendering artifacts when depth/stencil configurations did not align with pipeline expectations.

WebAssembly adds asynchronous initialization and browser ownership concerns. The VTK-WASM runtime/session model coordinates canvas binding, interactor loops, and finalization. The WebGPU `Finalize` work in [VTK !13377](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13377) was necessary so removing a browser view releases the corresponding renderer resources safely.

## 4. Mapper and shader architecture

Medical and scientific rendering is organized above the render window. Mappers translate VTK data into GPU buffers, textures, bindings, and draw commands. The WebGPU backend has to support the same variety of scene content as OpenGL while using explicit WebGPU pipelines.

Polygonal rendering established the base path. Subsequent work has expanded:

- vertex, index, and attribute buffers;
- topology and primitive selection;
- actor transforms and camera matrices;
- material properties and lighting;
- scalar coloring and textures;
- translucent and opaque passes;
- image actors and 2D image mappers;
- skybox projections;
- repeated-geometry batching; and
- physically based shading.

WGSL shaders replace OpenGL's GLSL programs. The backend must define stable bind-group layouts, buffer structures, and shader specializations. This explicit organization can improve clarity, but it requires carefully managing pipeline variants. Feature additions have deliberately exercised those abstractions rather than creating isolated one-off shaders. Skybox rendering in [VTK !13111](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13111) required projection-specific shader work to handle equirectangular and cubemap projections within the WGSL pipeline. Light support was expanded to cover all VTK light types—headlight, camera light, scene light, and ambient—each demanding its own bind-group entries and shader branches.

A Slang prototype (currently in draft) explores better shader substitutions, runtime inspection, reflection, and debugging capabilities for the WebGPU backend. If viable, Slang could provide a higher-level shader authoring model while still targeting WGSL, reducing the maintenance burden of hand-written pipeline variants.

## 5. Medical and Scientific images and volumes

Medical and scientific applications often use 16-bit scalar data rather than browser-friendly 8-bit color images. [VTK !13100](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13100) added signed and unsigned 16-bit texture support on GLES3/WASM paths, enabling medical-imaging workflows directly in the browser and removing a practical obstacle for browser-side volume rendering and complementing WebGPU development.

The WebGPU 2D image mapper in [VTK !12851](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12851) provides a foundation for slice and image-display workflows. Volume rendering is more demanding: it combines 3D textures, transfer functions, ray integration, clipping, sampling, lighting, and interaction-quality controls. As of the August 3, 2026 project snapshot, the WebGPU volume mapper is still under active development and trame-vtklocal marked WebGPU volume configurations as expected failures. This distinction will remain explicit in user-facing documentation until the full path is merged and validated.

## 6. Render passes and advanced effects

VTK supports rendering sequences that include shadows, depth peeling, order-independent transparency, anti-aliasing, selection, and post-processing. WebGPU's explicit render-pass model is well suited to these operations, but the OpenGL implementation cannot simply be copied line for line.

The new backend needs a pass architecture that defines attachment ownership, load/store operations, depth and multisample targets, resource transitions, and intermediate textures. Practical issues have already surfaced: a critical depth-buffer format mismatch in WebGPU caused compute shaders to exit early, and its resolution required careful alignment of depth/stencil attachment formats across the render-pass and compute-pass boundaries, restoring proper depth-buffer functionality. Work discussed through the 2026 project meetings included making existing serialization tests run in CI and bringing WebGPU render passes online. This is one of the areas where backend maturity depends on architecture, not just a growing feature checklist.

## 7. Dawn and the WebGPU C API

Early VTK WebGPU development used Dawn's C++ API. That provided a productive implementation route but tied VTK to specific C++ types and versions. Dawn evolves rapidly, and a hard dependency on one revision makes downstream packaging and long-lived release branches difficult.

The standardized WebGPU C API offers a narrower and more portable boundary. Moving VTK toward it can:

- reduce wrapper-version coupling;
- allow compatible implementations beyond one Dawn build;
- make ABI and package management clearer; and
- align native and Emscripten integrations around a standard interface.

This migration has been carried out concretely. VTK public headers have been converted off `webgpu_cpp.h` to the WebGPU C API, so downstream consumers no longer require a C++20 toolchain. All Dawn-specific and implementation-specific types have been removed from VTK public headers, and the public interfaces now use the C API exclusively.

To further decouple VTK from any single WebGPU implementation, dlopen-based proc tables have been implemented for WebGPU runtime loading. This enables dynamic dispatch without compile-time linkage to a specific implementation, allowing applications to select or swap WebGPU backends at runtime. Multiple Dawn version bumps in both the VTK repository and ci-utilities have been required to keep pace with upstream API evolution.

The transition still requires careful resource ownership and callback handling. It is an architectural investment, not a mechanical rename.

## 8. Testing and performance evaluation

Image-based regression remains essential. A successful render must be compared with baselines across drivers, backends, and platforms. Tests also need to exercise resizing, repeated rendering, window teardown, offscreen paths, screenshots, and multiple render windows.

Native CI has been expanded beyond Linux to include WebGPU jobs on Windows and macOS (both x86_64 and arm64). Flaky Windows WebGPU jobs were later pruned to maintain pipeline reliability, illustrating the tension between broad coverage and stable signal. Headless WebGPU tests may require a real GPU, special Chromium flags, the correct Dawn backend, and platform-specific environment setup. trame-vtklocal's browser matrix provides valuable end-to-end cases, but expected failures must distinguish missing VTK features from infrastructure instability.

Performance evaluation should use representative VTK workloads:

- large and small polydata;
- repeated actors and batching;
- scalar-colored geometry;
- image slices;
- translucent scenes;
- volume rendering;
- multiple views; and
- repeated updates that stress resource reuse.

WebGPU should be judged on frame time, upload cost, memory use, pipeline creation, startup, and consistency—not only one peak frame-rate number.

## 9. Risks and adoption considerations

The main technical risk is a prolonged period in which users must understand two backends with different feature coverage. Clear status tables, fallback behavior, and migration guidance are therefore important. Applications with custom OpenGL shader replacements or direct OpenGL calls will require redesign rather than automatic conversion.

Multi-threaded rendering introduces additional risk. Thread-safety work—such as per-thread `vtkFreeTypeTools` instances to eliminate contention in multi-threaded rendering pipelines—addresses specific bottlenecks, but the broader concurrency model for WebGPU resource access remains an area of active design.

Other risks include browser feature availability, GPU-driver differences, Dawn versioning, baseline variability in CI, and the possibility that a portable feature set cannot meet specialized native requirements. Community engagement through the [VTK WebGPU Roadmap](https://discourse.vtk.org/t/vtk-webgpu-roadmap/13749) Discourse thread, the DepthBuffer issue thread, and the published 2026 WebGPU Roadmap provides transparency on status and direction. These risks support a staged transition with measurable milestones rather than an abrupt removal of OpenGL.

## 10. Conclusion

The VTK WebGPU work is both a renderer and an architectural modernization. `vtkHardwareWindow` separates native surfaces from graphics APIs and enables framework integrations such as `QVTKWebGPUWidget`. The migration to the WebGPU C API and dlopen-based runtime loading decouples VTK from any single GPU implementation. New mappers and render passes—including expanded light types, skybox projections, 16-bit medical textures, and depth-format corrections—bring scientific features onto that foundation. VTK-WASM exercises the same backend in the browser, and exploratory work on Slang shader authoring points toward further maintainability improvements.

The project has established the difficult structural pieces and expanded CI coverage across Windows, macOS, and Linux. Its next measure of success is practical completeness: feature coverage, cross-platform reliability, documented limitations, and performance that supports real visualization applications.

## Primary sources

- [WebGPU – One Graphics API To Rule Them All](https://www.kitware.com/webgpu-one-graphics-api-to-rule-them-all/)
- [What It Takes to Support Cross-Platform Graphics Today](https://www.kitware.com/what-it-takes-to-support-cross-platform-graphics-today-a-practitioners-perspective-on-webgpu/)
- [How VTK Is Evolving to Support Modern Visualization Workflows](https://www.kitware.com/how-vtk-is-evolving-to-support-modern-visualization-workflows/)
- [VTK repository](https://gitlab.kitware.com/vtk/vtk)
- [VTK documentation](https://docs.vtk.org/en/latest/)
- [VTK-WASM documentation](https://kitware.github.io/vtk-wasm/)
- [VTK WebGPU roadmap discussion](https://discourse.vtk.org/t/vtk-webgpu-roadmap/13749)

