# trame-vtklocal Technical Report

## Purpose

trame-vtklocal (see [repository](https://github.com/Kitware/trame-vtklocal)) enables local browser rendering for Python-created VTK scenes. It combines:

- a Python `LocalView` widget;
- VTK's `vtkObjectManager` and serialization helpers;
- a trame protocol for state and blob access;
- the `@kitware/vtk-wasm` remote-session API; and
- WebGL or WebGPU rendering in an HTML canvas.

The server remains authoritative for scene structure and data. The client owns browser presentation and local interaction with the reconstructed scene.

## Synchronization path

1. The application passes a `vtkRenderWindow` to `LocalView`.
2. `vtkObjectManager` registers the render window and traverses reachable objects.
3. Object properties and references are serialized into states.
4. arrays are hashed and exposed as binary blobs.
5. The client loads a compatible VTK-WASM runtime and creates a remote session.
6. The session requests a status manifest, missing states, and missing blobs.
7. It reconstructs the scene, binds a canvas, and renders.
8. `view.update()` repeats the process for modified objects and arrays.

This differs from image streaming: geometry and state cross the network when they change, while camera movement and drawing can occur locally.

## Development progression

Important stages include:

- [PR #23](https://github.com/Kitware/trame-vtklocal/pull/23): client-side VTK method calls from Python/JavaScript, enabling later picking and selection.
- [PRs #25–#28](https://github.com/Kitware/trame-vtklocal/pulls?q=is%3Apr+25+26+27+28): shared runtimes, concurrent loading, state patching, viewer/export, picking, and compatibility improvements.
- [PR #32](https://github.com/Kitware/trame-vtklocal/pull/32): serialization for custom/add-on VTK modules.
- [PR #36](https://github.com/Kitware/trame-vtklocal/pull/36): removal of duplicate client code in favor of the shared `@kitware/vtk-wasm` package.
- [PRs #53, #30, and #67](https://github.com/Kitware/trame-vtklocal/pulls): progress UI, memory/WebXR and compatibility work.
- [PR #72](https://github.com/Kitware/trame-vtklocal/pull/72): central VTK-WASM 2 and 1.x transition.
- [PRs #73, #74, #80, and #81](https://github.com/Kitware/trame-vtklocal/pulls): broader runtime, geometry, lifecycle, volume, multi-view, and headless-WebGPU testing.
- [PRs #83 and #84](https://github.com/Kitware/trame-vtklocal/pulls): VTK 9.7 unified archives and direct compressed-archive serving.

## Runtime and widget capabilities

`LocalView` accepts runtime configuration for WebGL/WebGPU and synchronous/asynchronous execution. Current package logic supports 32- and 64-bit archives. It can automatically resize the render window with the canvas, emit update/progress/memory events, register external VTK objects, evaluate client-side object state into trame state, perform camera reset, save or export scenes, start WebXR, and explicitly dispose the remote session or shared runtime.

## Testing and limitations

Playwright and headless Chromium render deterministic scenes and compare images using VTK utilities. The matrix covers initial rendering, updates, component lifecycle, multiple views, and multiple volume mappers on supported configurations. Platform-specific GPU configuration is required for WebGPU.

The limiting factors are VTK serialization coverage and renderer feature coverage. A VTK class absent from the marshaling helpers cannot be reconstructed faithfully. WebGPU volume rendering was still in development at the reporting date. Open issues also include individual deserialization cases, listener/state synchronization, large-scene progress, and some multi-view/widget behavior.


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