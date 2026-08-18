# VTK-WASM 2.x Technical Report

## 1. Background and motivation

VTK's native application model assumes compiled code, a platform-specific runtime, and direct access to graphics and windowing services. That model remains appropriate for workstations, HPC systems, and desktop applications, but it complicates dissemination. Collaborators may lack compatible drivers, package versions, or administrative access. Educational users may not be able to install a full stack. Cloud applications may require a server GPU for each active session.

WebAssembly provides a portable execution format for compiled C++ inside the browser. Emscripten supplies the compiler and runtime adaptations needed to map C++ memory, files, callbacks, and JavaScript integration onto that environment. VTK-WASM uses this foundation to make the VTK implementation itself available to web applications.

The design goal is not to replace vtk.js in every use case. vtk.js is a JavaScript-native toolkit with a web-oriented API and established application ecosystem. VTK-WASM addresses a different need: access to compiled C++ VTK behavior and a path for existing VTK pipelines to reach the browser with less divergence.

### 2026 implementation progress

The central JavaScript change was [vtk-wasm PR #45](https://github.com/Kitware/vtk-wasm/pull/45), which established the 2.x runtime/session model and reorganized loading, asynchronous naming, packaging, examples, and documentation. Follow-on work registered canvases cleanly ([PR #46](https://github.com/Kitware/vtk-wasm/pull/46)), cleaned up remote event loops during disposal ([PR #52](https://github.com/Kitware/vtk-wasm/pull/52)), mirrored bundles for CDN deployment ([PR #54](https://github.com/Kitware/vtk-wasm/pull/54)), and supported VTK 9.7's unified WASM binaries ([PR #57](https://github.com/Kitware/vtk-wasm/pull/57)).

Core VTK changes complemented the package work:

- [VTK !13081](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13081) allowed multiple WASM interactor loops to coexist.
- [VTK !13377](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13377) fixed event-loop teardown, kept-alive ownership, wasm64 observation, and WebGPU finalization behavior.
- [VTK !13380](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13380) restored Linux-hosted WASM tests.
- [VTK !13431](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13431) generated JSON type manifests and async-suspension information.
- [VTK !13480](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13480) fixed remote-session corruption and enabled the newer asynchronous execution path.
- 16-bit texture support in the GLES3/WASM rendering path enabled full volume rendering of medical imaging data (CT, MRI) that is typically stored as 16-bit integers, removing a key limitation for browser-based volume visualization.

## 2. Execution and rendering configurations

The runtime loader treats deployment choices as an explicit configuration:

| Dimension | Options | Engineering effect |
|---|---|---|
| Addressing | wasm32 / wasm64 | Balances browser compatibility and bundle size against access to larger memories |
| Graphics | WebGL / WebGPU | Selects the established or modern VTK rendering backend |
| Calls | synchronous / asynchronous | Chooses direct calls or a suspension-capable execution path; WebGPU uses async |
| Ownership | standalone / remote | Determines whether JavaScript or a server owns object creation and lifecycle |

`loadAsync()` returns a `VtkWasmRuntime`. The loader caches runtimes by URL, base name, rendering backend, and execution mode. A caller requesting the same configuration receives the shared runtime, while a caller requesting another configuration receives a compatible second runtime. This replaced earlier assumptions that one page would contain one global VTK module.

The wasm32 and wasm64 packages serve different workloads. wasm32 is smaller and more broadly compatible, while wasm64 supports larger address spaces. Both still operate within browser and Emscripten constraints. Runtime selection lets an application make that tradeoff without changing its VTK pipeline.

## 3. Session model

### Standalone sessions

A standalone session owns a C++ `vtkStandaloneSession` and exposes a `vtk` namespace. JavaScript calls constructors such as `vtk.vtkActor()` and receives proxy objects that represent C++ instances. Properties can be read or assigned with JavaScript notation, methods can be invoked, VTK objects can be passed as arguments, and observers can connect browser callbacks to VTK events.

The session also owns object-proxy caches and canvas registrations. `registerCanvas()` allows a framework-managed canvas to be supplied directly, avoiding fragile global DOM IDs. `dispose()` frees the session's C++ objects and revokes its proxy caches.

### Remote sessions

A remote session mirrors a server-owned scene. The browser does not create authoritative VTK objects. Instead, it receives:

- serialized state for each reachable object;
- binary arrays addressed by content hash; and
- a status manifest describing object modification times, hashes, cameras, and interaction state.

The session reconstructs the scene, binds a render window to an application-owned canvas, and issues local renders. JavaScript can control existing objects, but additions and deletions originate on the server. That constraint prevents the browser and server from silently developing incompatible scene graphs.

This model supports trame-vtklocal, exported scene viewers, and applications that need server-side data preparation with client-side rendering.

## 4. Marshaling and object serialization

VTK object graphs contain object references, scalar properties, collections, data arrays, and ownership relationships. A browser mirror must preserve all of those without treating the scene as one monolithic payload.

The object manager divides synchronization into state and data. Object states contain class names, identifiers, properties, references, and modification times. Arrays become binary blobs identified by hashes. If an array has not changed, the browser can reuse its cached blob. If an object's modification time is older than the previously serialized state, work can be skipped. These mechanisms reduce transfer and reconstruction costs during interactive updates.

Serialization coverage is generated and extended with per-class helpers. The public [module availability matrix](https://kitware.github.io/vtk-wasm/roadmap/modules.html) makes the boundary visible. VTK !13431 adds a machine-readable JSON manifest of marshaled classes and calls that may suspend, creating a basis for generated TypeScript declarations and safer tooling.

Ownership is particularly important. A C++ object may be referenced by a renderer, mapper, interactor, JavaScript proxy, or remote-scene marker. Fixes in VTK !13377 preserved kept-alive markers during targeted serialization and made finalization safe when browser components are removed. These are production concerns: without them, repeated mounting and disposal can leak memory or leave callbacks targeting destroyed objects.

## 5. Browser integration and lifecycle

Native VTK interactors often start a blocking loop. In a browser, input and rendering must cooperate with the page's shared event loop. VTK's WebAssembly interactor adapts `Start()` to browser callbacks, and VTK !13081 allows multiple event loops to coexist. This is required for dashboards, comparison views, and notebook pages containing more than one visualization.

The 2.x package makes lifecycle operations explicit:

1. load or reuse a runtime;
2. create a standalone or remote session;
3. register or bind one or more canvases;
4. create or hydrate the scene;
5. update and interact; and
6. dispose the session when its view is removed.

`runtime.dispose()` removes a runtime from the shared cache, although Emscripten cannot necessarily return the entire module heap to the browser before page reload. Session disposal is therefore the critical operation for freeing VTK objects and listeners.

## 6. Build, packaging, and documentation

VTK produces the underlying WASM archives. The `Kitware/vtk-wasm` repository provides the npm package, loader, documentation site, API generation, examples, and distribution mechanism. Versioned VTK wheels and corresponding WASM bundles make it possible to test matched server and client artifacts.

The documentation site now separates several paths:

- C++ developers building applications with Emscripten;
- JavaScript developers loading a runtime and using standalone sessions;
- trame users mirroring server scenes;
- data-viewer users opening exported scene packages; and
- contributors checking module availability and the roadmap.

That separation is necessary because "VTK in the browser" no longer refers to a single workflow.

## 7. Validation strategy

Validation occurs at multiple levels. VTK core tests check wrapping, serialization, browser execution, and image results. The vtk-wasm package tests loading and API behavior. trame-vtklocal exercises the combined contract as a user would: create a Python scene, serialize it, load a chosen WASM runtime, reconstruct the scene, bind a canvas, update data, render, remove the component, and mount it again.

The current end-to-end matrix includes:

- WebGL with wasm32 and wasm64;
- synchronous and asynchronous execution;
- WebGPU with asynchronous wasm32 and wasm64;
- geometry changes after initial rendering;
- mount, unmount, and remount behavior;
- multiple views and shared sessions;
- volume-rendering paths, including 16-bit GLES volume rendering for medical imaging data; and
- Linux, macOS, and Windows browser runners.

This downstream validation has already found core ownership, mapper serialization, interactor mapping, and finalization problems. It is increasingly useful as a contract test for nightly VTK wheels and WASM archives.

## 8. Status, risks, and future work

VTK-WASM is now usable as a product layer, but its maturity is uneven across modules. Core rendering and common scene types are the strongest paths. Volume rendering with 16-bit textures on the GLES3/WASM path now supports CT and MRI data in desktop and mobile browsers. Specialized filters, widgets, custom modules, and less frequently serialized classes may require additional marshaling work.

Near-term priorities include:

- expanding class and module coverage;
- completing TypeScript declaration generation from VTK manifests;
- reducing bundle size and improving shared-library/module-loading strategies;
- strengthening VTK-to-trame nightly contract tests;
- improving volume, widget, text, scalar-bar, and multi-view coverage;
- tracking browser support for asynchronous WebAssembly features; and
- documenting when to choose VTK-WASM, vtk.js, server rendering, or a hybrid.

The long-term success criterion is not merely that examples render. It is that applications can treat the browser as a supported VTK platform with explicit compatibility, test coverage, lifecycle semantics, and release artifacts.

## 9. Conclusion

VTK-WASM is the browser delivery architecture for compiled VTK. It combines Emscripten builds, JavaScript proxies, runtime and session management, object serialization, canvas integration, and cross-project testing. The 2026 work transformed it from a collection of WebAssembly capabilities into a clearer application model that supports standalone JavaScript and server-driven Python workflows.

## Primary sources

- [VTK.wasm repository](https://github.com/Kitware/vtk-wasm)
- [VTK.wasm documentation](https://kitware.github.io/vtk-wasm/)
- [Loading VTK.wasm](https://kitware.github.io/vtk-wasm/guide/js/loading.html)
- [JavaScript primer](https://kitware.github.io/vtk-wasm/guide/js/primer.html)
- [Remote session guide](https://kitware.github.io/vtk-wasm/guide/js/remote-session.html)
- [Module availability matrix](https://kitware.github.io/vtk-wasm/roadmap/modules.html)
- [VTK object serialization](https://docs.vtk.org/en/latest/advanced/object_serialization.html)
- [VTK WebAssembly test-suite architecture](https://docs.vtk.org/en/latest/design_documents/WebAssemblyTestSuiteArchitecture.html)
- [VTK 9.6.0](https://www.kitware.com/vtk-9-6-0/)
- [VTK.wasm and its trame integration](https://www.kitware.com/vtk-wasm-and-its-trame-integration/)

