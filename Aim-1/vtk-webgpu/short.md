# VTK WebGPU Technical Report

## Objective

The VTK WebGPU initiative (see [repository](https://gitlab.kitware.com/vtk/vtk) and [website](https://vtk.org/)) is creating a modern rendering backend that spans browser and native platforms. It aims to:

- reduce platform-specific graphics implementations;
- support VTK-WASM with the same renderer used on desktop;
- establish explicit GPU resource and render-pass management;
- retain VTK's source–mapper–actor–renderer application model; and
- provide a sustainable path beyond assumptions embedded in legacy OpenGL/windowing code.

## Architectural foundation

Legacy VTK render-window classes combined platform windows and graphics contexts. The new structure divides responsibilities:

1. **Platform layer:** a `vtkHardwareWindow` subclass creates or adopts the native window/canvas and handles native events.
2. **Surface boundary:** the hardware window exposes the platform handle needed to construct a graphics surface.
3. **WebGPU backend:** `vtkWebGPURenderWindow` creates and owns the WebGPU surface, adapter, device, queues, textures, and presentation resources.
4. **VTK scene:** renderers, actors, mappers, cameras, lights, and interactors continue to use VTK abstractions.

[VTK !12360](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12360) is the key native-window/WebGPU integration change. It established hardware-window implementations and extended the backend beyond the earlier SDL/browser experiments.

`QVTKWebGPUWidget` applies this structure to Qt-owned windows. It is conditional on `VTK_ENABLE_WEBGPU`, uses native-surface handling rather than transferring window ownership to VTK, and has dedicated image-baseline tests on supported platforms.

## 2026 Rendering progress

Selected implementation changes illustrate the 2026 direction:

| Change | Capability |
|---|---|
| [VTK !12851](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12851) | WebGPU 2D image mapping |
| [VTK !13100](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13100) | Signed and unsigned 16-bit textures on GLES3/WASM, important for medical data |
| [VTK !13111](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13111) | Skybox rendering and projection-specific shader work |
| [VTK !13117](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13117) | Batching of identical polydata |
| [VTK !13377](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13377) | WebGPU finalization coordinated with VTK-WASM lifecycle |

The broader work also includes all VTK light types, resize correctness, physically based rendering, image slices, render passes, and volume rendering. Skybox work covers equirectangular and cubemap projections in WGSL. Alignment around `DEPTH_24_PLUS_8_STENCIL` corrected depth/stencil mismatches that caused artifacts and premature compute-shader exits across render and compute passes. A draft Slang prototype is exploring shader substitution, reflection, runtime inspection, and debugging while continuing to target WGSL. The exact level of feature parity varies by mapper and platform.

## Portability and implementation boundary

On native systems, Dawn translates WebGPU operations to Vulkan, Metal, or Direct3D. In WebAssembly builds, browser WebGPU supplies the implementation. VTK's public headers have completed the transition from Dawn's `webgpu_cpp.h` wrapper to the standardized WebGPU C API. Dawn-specific and implementation-specific types are no longer exposed publicly, downstream consumers no longer require C++20 for these interfaces, and native builds can load implementations dynamically through dlopen-based proc tables.

This abstraction is a portability decision. Specialized software may still need direct access to native APIs for unique extensions or maximum platform-specific tuning. For the broad VTK community, the common API can reduce duplicated engineering and provide performance within the portable feature envelope.

## Validation and remaining work

WebGPU is tested through VTK image regression, native Dawn configurations, WASM/browser builds, and trame-vtklocal's end-to-end WebGPU cases. Native jobs expanded beyond Linux to macOS and Windows on x86_64 and arm64, although flaky Windows jobs were later pruned to preserve a reliable signal. Cross-platform GPU CI remains harder than CPU-only testing because runners need compatible hardware, drivers, and headless-browser configuration.

Signed and unsigned 16-bit textures now support medical volume workflows on the GLES3/WebGL WASM path. The WebGPU 2D image mapper supports image and slice workflows, but the WebGPU volume mapper remained under active development in the August 3, 2026 snapshot and trame-vtklocal marked those configurations as expected failures.

The main remaining work is completing WebGPU volume rendering and render passes, extending mapper coverage, stabilizing Windows/macOS/Linux CI, benchmarking representative workloads, defining safe multi-threaded WebGPU resource access, and publishing migration guidance for applications with OpenGL-specific overrides.

## Primary sources

- [WebGPU – One Graphics API To Rule Them All](https://www.kitware.com/webgpu-one-graphics-api-to-rule-them-all/)
- [What It Takes to Support Cross-Platform Graphics Today](https://www.kitware.com/what-it-takes-to-support-cross-platform-graphics-today-a-practitioners-perspective-on-webgpu/)
- [How VTK Is Evolving to Support Modern Visualization Workflows](https://www.kitware.com/how-vtk-is-evolving-to-support-modern-visualization-workflows/)
- [VTK repository](https://gitlab.kitware.com/vtk/vtk)
- [VTK documentation](https://docs.vtk.org/en/latest/)
- [VTK-WASM documentation](https://kitware.github.io/vtk-wasm/)
- [VTK WebGPU roadmap discussion](https://discourse.vtk.org/t/vtk-webgpu-roadmap/13749)
