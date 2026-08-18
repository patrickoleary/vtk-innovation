# VTK-WASM 2.x: Taking the Visualization Toolkit Wherever the Browser Goes

VTK has spent decades growing into one of the most capable medical and scientific visualization libraries available. That history is an advantage: applications can draw on mature algorithms, data models, interaction styles, and rendering techniques. It is also a deployment challenge. The traditional VTK application assumes a native executable, a local graphics stack, and software that must be installed and maintained on every machine.

VTK-WASM (see vtk-wasm [website](https://kitware.github.io/vtk-wasm/)) changes that relationship. By compiling VTK's C++ implementation to WebAssembly, it brings the toolkit into a browser while preserving the pipeline and object model that VTK users already understand. During 2025 and 2026, the work moved beyond proving that VTK could run on the web. It introduced standalone and remote sessions, a usable JavaScript package, WebGL and WebGPU selection, 32- and 64-bit runtimes, generated API documentation, lifecycle management, 16-bit medical textures on the GLES3/WebGL path, and end-to-end validation through trame-vtklocal (see the vtk-wasm [repository](https://github.com/Kitware/vtk-wasm)).

## 1. The Challenge

Medical and scientific visualization on the web has often required a choice. A team could keep its full C++ or Python pipeline and render on a server, sending images to the browser, or it could rebuild part of the application in JavaScript (perhaps using [vtk.js](https://kitware.github.io/vtk-js/)) and render locally. Server rendering preserves capability, but it consumes remote GPU resources and makes every interaction dependent on a network round trip. A JavaScript rewrite can deliver responsive local interaction, but it creates a second implementation with different feature coverage and its own maintenance burden.

The browser also has a different execution model. Native VTK applications commonly own a blocking event loop, operate on platform windows, and rely on C++ object lifetimes. Browser applications share an event loop, render into HTML canvases, and expect resources to be mounted and removed repeatedly as user-interface components change. WebAssembly adds another set of decisions: 32- or 64-bit addressing, synchronous or asynchronous calls, WebGL or WebGPU, bundle loading, typed-array transfer, and explicit cleanup.

Compiling VTK was only the first step. The larger challenge was making compiled VTK behave like a well-designed web library.

## 2. The Implementation

The implementation now has three cooperating layers.

First, VTK is built with Emscripten into a WebAssembly binary and JavaScript glue. Core changes adapted canvas handling, interaction, object marshaling, serialization, and testing to browser execution. The VTK 9.6 line established generated JavaScript wrappers, standalone and remote sessions, WebGL/WebGPU runtime selection, and wasm64 packages. The VTK 9.7-era work unified asynchronous invocation, improved ownership and finalization, restored Linux WASM testing, emitted machine-readable type information, and added signed and unsigned 16-bit textures for medical data on GLES3/WASM.

Second, [`@kitware/vtk-wasm`](https://github.com/Kitware/vtk-wasm) provides the JavaScript-facing product layer. Its 2.x API starts with `loadAsync()`, which loads and caches a runtime for a selected bundle, graphics backend, and execution mode. That runtime creates either:

- a **standalone session**, where JavaScript creates and controls VTK objects entirely in the browser; or
- a **remote session**, where a server owns a VTK scene and the browser reconstructs and renders its serialized state.

The package provides natural JavaScript proxies, canvas registration, generated API pages, distribution bundles, and explicit `dispose()` methods. Multiple configurations can coexist on one page, so an application can use different WebGL/WebGPU, wasm32/wasm64, or synchronous/asynchronous runtimes without collisions.

Third, the object manager and serialization system connect server-created pipelines to browser-side VTK objects. State is represented separately from binary arrays. Content hashes allow arrays to be cached and reused, while modification times prevent unchanged objects from being resent. This infrastructure is what lets trame-vtklocal mirror a Python `vtkRenderWindow` into a local WebAssembly scene.

## 3. The Example

The current JavaScript API makes the runtime and session boundaries explicit. 

```html
index.html
<script
  src="https://unpkg.com/@kitware/vtk-wasm/vtk-umd.js"
  id="vtk-wasm"
  data-url="https://raw.githack.com/Kitware/vtk-wasm/dist/latest/vtk-wasm32-emscripten.tar.gz"
></script>

<canvas id="vtk-wasm-window" tabindex="-1"></canvas>

<script>
  vtkwasm.ready.then((vtk) => buildScene(vtk, "#vtk-wasm-window"));
</script>
```

This shortened example loads a WebGL runtime, creates a standalone session, registers a canvas, and constructs a familiar VTK rendering pipeline:

```javascript
import { loadAsync } from "@kitware/vtk-wasm";

const runtime = await loadAsync({
  url: "https://raw.githack.com/Kitware/vtk-wasm/dist/latest/vtk-wasm32-emscripten.tar.gz",
  rendering: "webgl",
  exec: "sync",
});

const session = runtime.createStandaloneSession();
const vtk = session.vtk;

const canvas = document.querySelector("canvas");
const canvasSelector = session.registerCanvas("!vtk-canvas", canvas);

const source = vtk.vtkPartitionedDataSetCollectionSource({
  numberOfShapes: 1,
});
const mapper = vtk.vtkCompositePolyDataMapper();
await mapper.setInputConnection(await source.getOutputPort());

const actor = vtk.vtkActor({ mapper });
const renderer = vtk.vtkRenderer({ background: [0.12, 0.16, 0.24] });
renderer.addViewProp(actor);

const renderWindow = vtk.vtkRenderWindow({ canvasSelector });
await renderWindow.addRenderer(renderer);

const interactor = vtk.vtkRenderWindowInteractor({
  canvasSelector,
  renderWindow,
});

await renderer.resetCamera();
await interactor.interactorStyle.setCurrentStyleToTrackballCamera();
await interactor.start();

// When the application removes this view:
// session.dispose();
// runtime.dispose();
```

Changing the load options to `rendering: "webgpu"` selects the modern renderer and automatically requires asynchronous execution in supported browsers. VTK-WASM then exercises the same WebGPU backend used by native VTK, including its explicit surface, device, texture, render-pass, and finalization lifecycle. Recent backend work added 2D image mapping, skybox projections, repeated-geometry batching, physically based shading, all VTK light types, and a corrected depth/stencil attachment format. Moving VTK's public WebGPU interfaces from Dawn's C++ wrapper to the WebGPU C API also reduces implementation coupling and better aligns native and Emscripten builds.

Feature status still matters. Signed and unsigned 16-bit textures now enable CT and MRI volume rendering through the GLES3/WebGL WASM path. The WebGPU volume mapper, however, remained under active development in the August 3, 2026 project snapshot, and trame-vtklocal treated WebGPU volume configurations as expected failures. Applications should select a backend according to the mapper coverage they require rather than assuming that `webgl` and `webgpu` are interchangeable. For a Python-driven application, either supported runtime can create a remote session and hydrate the scene from object states and binary blobs supplied by trame.

## 4. Why This Matters?

VTK-WASM makes the browser a first-class VTK deployment target. A visualization can be distributed as web assets, opened without a native installer, embedded in documentation or a notebook, and used on machines where compiling a desktop application would be unrealistic. Local rendering also moves camera interaction and drawing off the server, improving responsiveness and reducing the need for a dedicated rendering service.

The architectural value is just as important. VTK-WASM reuses VTK's C++ algorithms instead of creating another partial port. Fixes and new capabilities in the core can flow into browser builds. JavaScript developers gain direct access to those capabilities, while Python and trame users can keep their existing pipelines and use trame-vtklocal as the delivery layer.

This work also provides a real proving ground for VTK's modernization. Multi-view browser applications expose ownership errors, serialization gaps, event-loop assumptions, depth-format mismatches, and resource leaks quickly. The resulting fixes improve the underlying toolkit, not only its web packaging. The same is true in the other direction: improvements to WebGPU mappers, shaders, and render passes become available to browser applications as soon as their WASM builds and validation matrix support them.

## 5. Conclusion

VTK-WASM began as a way to compile VTK for a browser. It has become a runtime, session, serialization, packaging, and testing architecture for using VTK on the web.

The important outcome is continuity. A developer can move from native C++, to JavaScript in a browser, to a Python-controlled trame application without abandoning the VTK pipeline model. The browser becomes another place where VTK runs, not a separate visualization ecosystem that must be rebuilt feature by feature. That continuity now includes a clearer contract: WebGL remains the stronger path for 16-bit volume rendering today, while WebGPU is the modern shared backend whose feature coverage is being completed and tested incrementally.
