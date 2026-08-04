# trame-vtklocal Technical Report

## 1. Background and application model

trame lets Python applications expose medical and scientific processing and visualization through a web interface. Historically, its VTK views have used two broad delivery modes.

### Remote image rendering

VTK renders on the server. The browser receives compressed images and forwards interaction events. This provides full server capability but needs server graphics resources and remains sensitive to latency.

### vtk.js local rendering

The server sends scene geometry and properties to vtk.js. The browser renders and interacts locally. This scales interaction well, but the browser scene is limited to features reimplemented in the JavaScript toolkit.

### VTK-WASM local rendering

trame-vtklocal (see [repository](https://github.com/Kitware/trame-vtklocal)) sends a serialized VTK object graph to compiled C++ VTK in WebAssembly. This retains local rendering while moving feature semantics closer to the server's VTK implementation. The application can often switch delivery approaches without reconstructing its source-side pipeline.

### Development progression

Important stages include:

- [PR #23](https://github.com/Kitware/trame-vtklocal/pull/23): client-side VTK method calls from Python/JavaScript, enabling later picking and selection.
- [PRs #25–#28](https://github.com/Kitware/trame-vtklocal/pulls?q=is%3Apr+25+26+27+28): shared runtimes, concurrent loading, state patching, viewer/export, picking, and compatibility improvements.
- [PR #32](https://github.com/Kitware/trame-vtklocal/pull/32): serialization for custom/add-on VTK modules.
- [PR #36](https://github.com/Kitware/trame-vtklocal/pull/36): removal of duplicate client code in favor of the shared `@kitware/vtk-wasm` package.
- [PRs #53, #30, and #67](https://github.com/Kitware/trame-vtklocal/pulls): progress UI, memory/WebXR and compatibility work.
- [PR #72](https://github.com/Kitware/trame-vtklocal/pull/72): central VTK-WASM 2 and 1.x transition.
- [PRs #73, #74, #80, and #81](https://github.com/Kitware/trame-vtklocal/pulls): broader runtime, geometry, lifecycle, volume, multi-view, and headless-WebGPU testing.
- [PRs #83 and #84](https://github.com/Kitware/trame-vtklocal/pulls): VTK 9.7 unified archives and direct compressed-archive serving.

## 2. Server-side object management

The server starts from a `vtkRenderWindow`. `vtkObjectManager` assigns stable identifiers and traverses the reachable graph: renderers, cameras, props, mappers, properties, lookup tables, datasets, arrays, interactors, and registered external objects.

Per-class serialization helpers extract properties and references. The resulting state includes the C++ class, identifier, modification time, superclass information, scalar/vector properties, and references to other objects. Binary arrays are separated from state and indexed by content hash.

This representation supports incremental synchronization. The server can report the identifiers and modification times in the current scene, the hashes available for binary data, active cameras, and other control information. The client then requests only states or blobs it does not already hold.

MTime-based skipping reduces repeated work for unchanged arrays. Hash caching avoids retransmitting identical content. Correctness still depends on serializers marking every property and relationship that affects rendering.

## 3. Client-side remote session

The browser loads a VTK-WASM runtime through `@kitware/vtk-wasm` and creates a remote session. trame-vtklocal binds three logical data functions:

- fetch an object state by VTK identifier;
- fetch a binary blob by content hash; and
- fetch the scene status for a render window.

The session reconstructs the graph in C++, associates the reconstructed render window with an HTML canvas, and performs a local render. It keeps object proxies and array caches for later updates.

Server ownership is deliberate. The remote client can manipulate permitted properties and call methods on existing objects, but authoritative creation and deletion occur in Python. This prevents client-only objects from silently disappearing during the next server synchronization.

## 4. Interaction and bidirectional state

Local camera interaction should remain local for responsiveness. The client can report camera changes or other listener values back into trame state when the application needs them. `LocalView.eval()` maps paths in the client-side VTK object state into named trame variables. Registered widgets and external objects extend the managed graph beyond what is directly reachable from the render window.

Method invocation and selection support let Python trigger client-side VTK operations without streaming a new rendered image. Picking can use the browser renderer and return results through application state. These capabilities narrow the difference between a locally rendered application and a traditional native interactor.

## 5. Runtime configuration

The 1.x API exposes the choices introduced by VTK-WASM 2:

| Choice | Values | Notes |
|---|---|---|
| Renderer | `webgl`, `webgpu` | WebGPU uses the newer VTK backend and browser support |
| Execution | `sync`, `async` | WebGPU requires async; browser JSPI support may apply |
| Addressing | wasm32, wasm64 archive | Selected by bundle/base-name configuration and package compatibility |
| Session use | one or multiple views | Runtimes may be shared; views retain independent canvas mappings |

Runtime caching avoids loading the same large WebAssembly module repeatedly. Distinct runtime configurations can coexist. This is important during migration and testing, where one page may compare WebGL and WebGPU or 32- and 64-bit behavior.

## 6. Component and resource lifecycle

Web frameworks create and destroy views routinely. A correct integration must handle:

- canvas creation and binding;
- resize observation;
- interactor listener attachment;
- repeated updates;
- view unmounting;
- listener and canvas removal;
- C++ object finalization;
- remounting; and
- shared runtime ownership.

trame-vtklocal now exposes `dispose_remote_session()` and `dispose_wasm_runtime()` and performs cleanup during component lifecycle operations. Its automated mount/unmount/remount tests were added because a page that renders once can still leak or fail when used as an actual application component.

## 7. Loading, progress, and operational experience

Large scenes can require many object states and blobs. The widget emits progress payloads that distinguish state and binary transfers and supports a built-in or customized loading presentation. Memory events can report the approximate client use attributable to VTK object structures and arrays.

Versioned web assets and compressed-archive serving improve deployment reproducibility. Scene `save()` and `export()` functions produce packages for a standalone WASM viewer. These features make the bridge useful beyond a live trame server: an application can capture a scene for testing, sharing, or offline inspection.

## 8. Development timeline, August 2025–August 2026

### July–November 2025: consolidation and browser testing

The project added custom-module serialization, snapshots, PyVista examples, camera events, explicit rendering/resizing, and Playwright testing. PR #36 removed a duplicate JavaScript implementation and made `@kitware/vtk-wasm` the shared product layer.

### January–April 2026: user experience and compatibility

Progress UI, customizable loaders, memory reporting, VTK 9.4–9.6 compatibility, canvas and resize fixes, versioned assets, and WebXR improved application integration.

### June–July 2026: 1.x and VTK-WASM 2

PR #72 adopted the runtime/session model and exposed renderer, execution, address-width, selection, lifecycle, and multi-runtime capabilities. Follow-on PRs expanded visual regression across geometry, volume, multiple views, operating systems, and unified VTK 9.7 packages. Versions 1.0.0 and 1.1.0 marked this product transition.

## 9. End-to-end validation

Unit tests inside VTK can verify a serializer or WASM class in isolation. trame-vtklocal validates the combined release contract:

1. install a VTK wheel;
2. load a matching WASM archive;
3. create a Python scene;
4. serialize through `vtkObjectManager`;
5. transfer through the trame protocol;
6. reconstruct through a remote session;
7. render in a real browser;
8. compare the image;
9. mutate the scene and render again; and
10. remove and recreate the component.

The matrix includes WebGL wasm32/wasm64, synchronous/asynchronous execution, WebGPU async wasm32/wasm64, data updates, lifecycle operations, multiple views, and supported volume configurations. Browser and GPU differences require platform-specific flags and expected-failure policies.

This role is strategically significant. The project catches incompatibilities between independently released VTK Python wheels, VTK WASM archives, the npm runtime, and the trame widget.

## 10. Adoption and community reach

The direct audience includes VTK Python and trame developers. The broader opportunity is PyVista, whose higher-level plotting API exposes more applications and more diverse scene combinations. PyVista examples and an active integration effort have already identified issues such as interactor-class mapping and empty `vtkDataSetMapper` inputs caused by serialization helper behavior.

Other user groups include:

- developers of custom VTK modules;
- JavaScript teams using the trame protocol with their own UI layer;
- deployment teams needing Docker, PyPI, npm, and versioned web assets;
- educators embedding interactive VTK in notebooks or courses; and
- WebGPU adopters who want to switch the browser backend without rewriting Python.

## 11. Remaining gaps and recommendations

Priorities after August 3, 2026 include:

- run trame-vtklocal nightly against newly generated VTK wheels and WASM archives;
- complete WebGPU volume rendering before removing expected failures;
- expand scalar-bar, text, widget, selection, and less-common mapper cases;
- reconcile the README's VTK-version statement with package metadata and current 9.7 support;
- document runtime sharing and disposal patterns for application authors;
- improve progress behavior for very large models;
- track serialization/module coverage publicly; and
- finish the PyVista delivery and feedback loop.

The project should retain both roles: a simple adoption API for Python users and a demanding integration test for the VTK browser stack.

## 12. Conclusion

trame-vtklocal converts VTK-WASM from a runtime technology into an accessible Python workflow. Its core abstraction is simple—a `LocalView` receives a `vtkRenderWindow`—but the implementation coordinates object graphs, data blobs, canvases, runtime configurations, interaction, progress, cleanup, and browser testing.

The last 19 months established that bridge and hardened it through real application scenarios. Continued serialization and renderer coverage, especially through PyVista, can make it the primary route by which Python users adopt local VTK rendering on the web.

## Primary sources

- [trame-vtklocal repository](https://github.com/Kitware/trame-vtklocal)
- [trame-vtklocal releases](https://github.com/Kitware/trame-vtklocal/releases)
- [trame-vtklocal on PyPI](https://pypi.org/project/trame-vtklocal/)
- [LocalView API documentation](https://trame.readthedocs.io/en/latest/trame.widgets.vtklocal.html)
- [VTK.wasm documentation](https://kitware.github.io/vtk-wasm/)
- [VTK.wasm remote-session guide](https://kitware.github.io/vtk-wasm/guide/js/remote-session.html)
- [VTK.wasm and its trame integration](https://www.kitware.com/vtk-wasm-and-its-trame-integration/)
- [Bring Powerful 3D Visualization to the Browser with VTK.wasm](https://www.kitware.com/bring-powerful-3d-visualization-to-the-browser-with-vtk-wasm/)
- [VTK + trame + Jupyter = magic](https://www.kitware.com/vtk-trame-jupyter-magic/)

