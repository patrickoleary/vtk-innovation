# WebGPU in VTK: One Modern Rendering Path from the Desktop to the Browser

For most users, a rendering backend should be invisible. A VTK (see [repository](https://gitlab.kitware.com/vtk/vtk) and [website](https://vtk.org/)) pipeline creates geometry, assigns colors, sets a camera, and produces an image. Under that simple experience sits a growing amount of platform-specific engineering: OpenGL and OpenGL ES, native window systems, browser canvases, driver differences, shader languages, resource lifetimes, and an expanding list of modern APIs such as Vulkan, Metal, and Direct3D 12.

WebGPU offers VTK a different path. It is a modern, portable graphics API designed for both browsers and native applications. With Dawn translating WebGPU to the graphics implementation available on each machine, VTK can invest in one new rendering backend and use it across Windows, macOS, Linux, and WebAssembly. The 2025–2026 work has been about turning that promise into a maintainable VTK architecture and filling in the rendering capabilities needed by real medical and scientific applications.

## 1. The Challenge

The challenge is not simply replacing one API call with another. VTK's rendering system has accumulated decades of OpenGL knowledge: polygonal geometry, lighting, textures, image slices, transparency, skyboxes, picking, volume rendering, render passes, and specialized medical and scientific data types. A modern backend must reproduce those capabilities while respecting a very different GPU model.

Cross-platform window creation made the problem worse. Historically, VTK render-window classes mixed native window ownership with graphics-context creation. Adding WebGPU therefore threatened to require a separate combination for every operating system and window system. Linux alone includes X11, Wayland, EGL, headless configurations, and driver-specific behavior. Browser rendering introduces canvases and asynchronous device creation rather than native windows.

The project also had to balance ambition with compatibility. WebGPU deliberately exposes a common portable feature set. That improves sustainability, but it cannot surface every optimization from Vulkan, Metal, or Direct3D. The backend must therefore be measured against medical and scientific workloads instead of treated as an automatic performance win.

## 2. The Implementation

The first major step was architectural: separate window management from graphics rendering. `vtkHardwareWindow` owns the platform window lifecycle and exposes the native surface. Platform-specific subclasses handle Win32, Cocoa, X11, Wayland, and WebAssembly. `vtkWebGPURenderWindow` consumes that surface and manages adapters, devices, presentation, GPU resources, and rendering without duplicating the operating-system code. `QVTKWebGPUWidget` now demonstrates the same ownership boundary for Qt: Qt owns the visible window while VTK renders into its supplied native surface. The module is conditional on `VTK_ENABLE_WEBGPU` and has dedicated image-regression tests.

Dawn provides the WebGPU implementation for native targets and maps WebGPU operations to the platform's available backend. In the browser, the same VTK renderer can operate through the browser's WebGPU implementation when VTK is compiled to WebAssembly. This is the strategic advantage: the scene and mapper architecture does not need a desktop renderer and a separately maintained web renderer.

Feature work has proceeded mapper by mapper and pass by pass. The backend includes polygonal rendering and has added a 2D image mapper, all VTK light types, equirectangular and cubemap skyboxes, batched polydata, resize correctness, physically based shading, and safe resource finalization. A depth/stencil mismatch that caused rendering artifacts and early compute-shader exits was corrected by aligning attachment formats around `DEPTH_24_PLUS_8_STENCIL` across render and compute passes.

Medical and browser workloads still require explicit feature-status guidance. Signed and unsigned 16-bit textures on the GLES3/WASM path now support browser-side CT and MRI volume workflows. The WebGPU 2D image mapper establishes image and slice rendering, but the WebGPU volume mapper remained under active development in the August 3, 2026 snapshot, with trame-vtklocal WebGPU volume configurations recorded as expected failures.

The implementation has also completed its public-interface migration away from Dawn's C++ wrapper. VTK public headers now use the standardized WebGPU C API exclusively, remove implementation-specific types, and no longer impose a C++20 requirement on downstream consumers. Native builds can load compatible implementations through dlopen-based proc tables instead of compile-time linkage to one Dawn revision. A draft Slang prototype is separately exploring shader substitution, reflection, runtime inspection, and debugging while continuing to target WGSL.

## 3. The Example

The application-facing goal is to leave the VTK pipeline unchanged. The important new boundary is between the platform window and the graphics backend:

```cpp
#include <vtkActor.h>
#include <vtkHardwareWindow.h>
#include <vtkNew.h>
#include <vtkPolyDataMapper.h>
#include <vtkRenderer.h>
#include <vtkSphereSource.h>
#include <vtkWebGPURenderWindow.h>

vtkNew<vtkSphereSource> sphere;
sphere->SetThetaResolution(64);
sphere->SetPhiResolution(32);

vtkNew<vtkPolyDataMapper> mapper;
mapper->SetInputConnection(sphere->GetOutputPort());

vtkNew<vtkActor> actor;
actor->SetMapper(mapper);

vtkNew<vtkRenderer> renderer;
renderer->AddActor(actor);
renderer->SetBackground(0.10, 0.14, 0.20);

vtkNew<vtkHardwareWindow> hardwareWindow;
hardwareWindow->SetSize(1024, 768);
hardwareWindow->Create("VTK WebGPU");

vtkNew<vtkWebGPURenderWindow> renderWindow;
renderWindow->SetHardwareWindow(hardwareWindow);
renderWindow->AddRenderer(renderer);

renderer->ResetCamera();
renderWindow->Render();
```

The object factory resolves the appropriate hardware-window implementation for the platform. The WebGPU renderer receives a stable surface and owns the GPU side. In a VTK-WASM application, the hardware window is a browser canvas rather than a Win32, Cocoa, X11, or Wayland surface, but the pipeline remains source–mapper–actor–renderer–render window.

## 4. Why This Matters?

Maintaining graphics code is part of maintaining medical and scientific software. Every duplicate mapper, operating-system branch, and shader path increases the number of combinations that must be fixed and tested. A shared WebGPU backend can reduce that multiplication and make modern GPU features available without committing VTK to four independent native implementations.

The browser/desktop continuity is especially important. VTK-WASM can use WebGPU for client-side rendering, while native VTK and ParaView can exercise the same backend on workstations. Bugs found through a browser application can therefore improve the desktop renderer, and performance work on the desktop can benefit web deployment. The standardized C API strengthens that continuity by giving native and Emscripten integrations a common public boundary without making every downstream consumer adopt Dawn's C++ types.

For medical and scientific users, the value is not the name of the API. It is a sustainable route to local image, geometry, and eventually WebGPU volume rendering across more devices, while the validated WebGL/GLES3 path handles 16-bit browser volumes today. For VTK developers, it is an opportunity to modernize resource ownership, shader organization, window integration, and render passes at the same time.

## 5. Conclusion

WebGPU does not eliminate the complexity of graphics programming. It gives VTK a better place to contain that complexity.

The work to date has established the architectural boundary, Qt/native/browser surfaces, a standardized public API, dynamic backend loading, a growing set of mappers and rendering features, and cross-platform testing. Native WebGPU CI expanded to Windows and macOS on x86_64 and arm64, although flaky Windows jobs were later pruned to protect signal quality. The next phase is practical closure: WebGPU volume rendering, remaining passes and mappers, stable cross-platform CI, thread-safe resource access, and evidence-based comparisons with the established OpenGL backend. If that work succeeds, VTK users will gain a modern renderer without having to care which native graphics API is underneath it.
