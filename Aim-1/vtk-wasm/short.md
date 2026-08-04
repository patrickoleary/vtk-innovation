# VTK-WASM 2.X Technical Report

## Purpose

VTK-WASM 2.x makes VTK's compiled algorithms and rendering infrastructure available in the browser. It is designed for two primary application models:

1. **Standalone browser applications**, where JavaScript creates and controls the VTK pipeline.
2. **Mirrored applications**, where Python or C++ owns the authoritative scene and a browser-side VTK runtime reconstructs and renders it.

Both models avoid a JavaScript reimplementation of the underlying VTK algorithms.

## Architecture

The delivery stack consists of four main elements:

- **VTK core WebAssembly support:** Emscripten builds, JavaScript wrappers, browser-aware interactors, canvas render windows, serialization helpers, and WASM tests.
- **JavaScript runtime package:** `@kitware/vtk-wasm` loads bundles, caches compatible runtimes, creates sessions, and exposes JavaScript object proxies.
- **Object manager and serialization:** VTK object graphs are converted into JSON-like states plus hashed binary blobs. Modification times and hashes minimize repeated transfers.
- **Application integrations:** trame-vtklocal provides the Python-to-browser bridge, while standalone examples and viewers support JavaScript and exported scenes.

The loader selects `webgl` or `webgpu`, `sync` or `async`, and a wasm32 or wasm64 archive. WebGPU requires asynchronous execution. Runtimes are cached by configuration, and multiple distinct configurations can coexist within one JavaScript page.

## 2026 implementation progress

The central JavaScript change was [vtk-wasm PR #45](https://github.com/Kitware/vtk-wasm/pull/45), which established the 2.x runtime/session model and reorganized loading, asynchronous naming, packaging, examples, and documentation. Follow-on work registered canvases cleanly ([PR #46](https://github.com/Kitware/vtk-wasm/pull/46)), cleaned up remote event loops during disposal ([PR #52](https://github.com/Kitware/vtk-wasm/pull/52)), mirrored bundles for CDN deployment ([PR #54](https://github.com/Kitware/vtk-wasm/pull/54)), and supported VTK 9.7's unified WASM binaries ([PR #57](https://github.com/Kitware/vtk-wasm/pull/57)).

Core VTK changes complemented the package work:

- [VTK !13081](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13081) allowed multiple WASM interactor loops to coexist.
- [VTK !13377](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13377) fixed event-loop teardown, kept-alive ownership, wasm64 observation, and WebGPU finalization behavior.
- [VTK !13380](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13380) restored Linux-hosted WASM tests.
- [VTK !13431](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13431) generated JSON type manifests and async-suspension information.
- [VTK !13480](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13480) fixed remote-session corruption and enabled the newer asynchronous execution path.

## Benefits and limitations

VTK-WASM reduces installation barriers, supports local browser interaction, shares C++ behavior across native and web targets, and lets Python applications deliver local rendering through trame. It also creates a reproducible deployment unit: a versioned browser bundle can be associated with a matching VTK wheel and tested as a pair.

The primary limitations are coverage and cost. Only marshaled modules and classes are available to JavaScript or remote reconstruction. WebAssembly bundles remain large compared with ordinary web libraries. Browser support for newer execution features such as JSPI is not universal. WebGPU capabilities are still being completed. wasm64 expands addressability but has different compatibility and observer/ownership considerations. These constraints are explicit engineering boundaries rather than reasons to fork the implementation again.

## Primary sources

- [VTK.wasm repository](https://github.com/Kitware/vtk-wasm)
- [VTK.wasm documentation](https://kitware.github.io/vtk-wasm/)
- [Loading VTK.wasm](https://kitware.github.io/vtk-wasm/guide/js/loading.html)
- [JavaScript primer](https://kitware.github.io/vtk-wasm/guide/js/primer.html)
- [Module availability matrix](https://kitware.github.io/vtk-wasm/roadmap/modules.html)
- [VTK object serialization](https://docs.vtk.org/en/latest/advanced/object_serialization.html)
- [VTK.wasm and its trame integration](https://www.kitware.com/vtk-wasm-and-its-trame-integration/)