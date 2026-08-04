# WebGPU in VTK: One Modern Rendering Path from the Desktop to the Browser

For most users, a rendering backend should be invisible. A VTK (see [repository](https://gitlab.kitware.com/vtk/vtk) and [website](https://vtk.org/)) pipeline creates geometry, assigns colors, sets a camera, and produces an image. Under that simple experience sits a growing amount of platform-specific engineering: OpenGL and OpenGL ES, native window systems, browser canvases, driver differences, shader languages, resource lifetimes, and an expanding list of modern APIs such as Vulkan, Metal, and Direct3D 12.

WebGPU offers VTK a different path. It is a modern, portable graphics API designed for both browsers and native applications. With Dawn translating WebGPU to the graphics implementation available on each machine, VTK can invest in one new rendering backend and use it across Windows, macOS, Linux, and WebAssembly. The 2025–2026 work has been about turning that promise into a maintainable VTK architecture and filling in the rendering capabilities needed by real medical and scientific applications.

## 1. The Challenge

The challenge is not simply replacing one API call with another. VTK's rendering system has accumulated decades of OpenGL knowledge: polygonal geometry, lighting, textures, image slices, transparency, skyboxes, picking, volume rendering, render passes, and specialized medical and scientific data types. A modern backend must reproduce those capabilities while respecting a very different GPU model.

Cross-platform window creation made the problem worse. Historically, VTK render-window classes mixed native window ownership with graphics-context creation. Adding WebGPU therefore threatened to require a separate combination for every operating system and window system. Linux alone includes X11, Wayland, EGL, headless configurations, and driver-specific behavior. Browser rendering introduces canvases and asynchronous device creation rather than native windows.

The project also had to balance ambition with compatibility. WebGPU deliberately exposes a common portable feature set. That improves sustainability, but it cannot surface every optimization from Vulkan, Metal, or Direct3D. The backend must therefore be measured against medical and scientific workloads instead of treated as an automatic performance win.

## 2. The Implementation

The first major step was architectural: separate window management from graphics rendering. `vtkHardwareWindow` owns the platform window lifecycle and exposes the native surface. Platform-specific subclasses handle Win32, Cocoa, X11, Wayland, and WebAssembly. `vtkWebGPURenderWindow` consumes that surface and manages adapters, devices, swap chains, GPU resources, and rendering without duplicating the operating-system code.

Dawn provides the WebGPU implementation for native targets and maps WebGPU operations to the platform's available backend. In the browser, the same VTK renderer can operate through the browser's WebGPU implementation when VTK is compiled to WebAssembly. This is the strategic advantage: the scene and mapper architecture does not need a desktop renderer and a separately maintained web renderer.

Feature work has proceeded mapper by mapper and pass by pass. The backend includes polygonal rendering and has added 2D images, VTK light types, skyboxes, batched polydata, resizing and resource finalization, physically based rendering work, and support needed for WASM medical-image data. Volume rendering and the remaining render-pass architecture have been active 2026 priorities.

At the same time, the implementation is moving away from a tight dependency on Dawn's C++ wrapper toward the standardized WebGPU C API. That boundary should make VTK less sensitive to one Dawn revision and leave room for compatible implementations.

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

The browser/desktop continuity is especially important. VTK-WASM can use WebGPU for client-side rendering, while native VTK and ParaView can exercise the same backend on workstations. Bugs found through a browser application can therefore improve the desktop renderer, and performance work on the desktop can benefit web deployment.

For medical and scientific users, the value is not the name of the API. It is a sustainable route to local image, geometry, and eventually volume rendering across more devices. For VTK developers, it is an opportunity to modernize resource ownership, shader organization, window integration, and render passes at the same time.

## 5. Conclusion

WebGPU does not eliminate the complexity of graphics programming. It gives VTK a better place to contain that complexity.

The work to date has established the architectural boundary, native and browser surfaces, a growing set of mappers and rendering features, and cross-platform testing. The next phase is feature and performance closure: volume rendering, remaining passes and mappers, broader CI, and evidence-based comparisons with the established OpenGL backend. If that work succeeds, VTK users will gain a modern renderer without having to care which native graphics API is underneath it.