# trame-vtklocal: Bringing Python's VTK Pipeline into the Browser

VTK-WASM can run compiled VTK in a browser, but most VTK users do not begin their work in JavaScript. They begin with Python, PyVista, a simulation, or a trame application. They already have a `vtkRenderWindow`, a pipeline that produces the right scene, and application logic built around familiar Python objects. Asking those users to reconstruct everything in JavaScript would make browser rendering possible while putting it out of reach for much of the community.

trame-vtklocal (see [repository](https://github.com/Kitware/trame-vtklocal)) is the bridge. It takes a server-side VTK scene, describes that scene through VTK's object manager, reconstructs it with VTK-WASM, and renders it locally in the browser through WebGL or WebGPU. Over the last 12 months, the project has grown from an experimental mirroring component into the adoption and end-to-end testing layer for VTK's browser stack.

## 1. The Challenge

Traditional trame applications have two well-understood rendering choices. Remote rendering keeps VTK on the server and sends images to the browser. It supports the full server pipeline, but interaction depends on network latency and the server needs rendering resources. vtk.js-based local rendering moves geometry to the browser and provides responsive interaction, but only for scenes and features implemented separately in vtk.js.

VTK-WASM introduces a third choice: run compiled C++ VTK on the client. The hard part is synchronizing a real Python-created scene into that runtime. A `vtkRenderWindow` is not one object. It is a graph of renderers, cameras, actors, mappers, properties, textures, lookup tables, interactors, widgets, and data arrays, each with ownership and modification state.

A production widget must also survive ordinary web-application behavior: loading large scenes, showing progress, changing arrays, resizing, mounting and unmounting components, displaying multiple views, selecting objects, switching rendering backends, and disposing resources. The Python API must hide most of that machinery without hiding the configuration users need.

## 2. The Implementation

On the server, `vtkObjectManager` walks the scene reachable from a `vtkRenderWindow`. It serializes object properties and references into states, while data arrays become binary blobs addressed by content hash. Modification times let the system identify what changed. The trame protocol exposes status, state, and blob requests to the browser.

On the client, trame-vtklocal loads `@kitware/vtk-wasm`, creates a remote session, binds an HTML canvas, reconstructs the object graph, and renders locally. Camera and supported widget interaction can remain in the browser. When Python changes the pipeline, `LocalView.update()` synchronizes the changed state rather than streaming a new image for every frame.

The 2026 1.x transition adopted the VTK-WASM 2 runtime/session model. A `LocalView` can select WebGL or WebGPU, synchronous or asynchronous execution, and wasm32 or wasm64. It exposes progress and memory events, supports selection and state evaluation, and provides explicit methods to dispose the remote session or the shared WASM runtime. Multiple configurations and multiple views can coexist.

The project also became an integration test. Playwright browser tests now exercise geometry updates, mount/unmount/remount, multiple views, and volume rendering across a matrix of VTK-WASM configurations and operating systems. Those tests have found bugs in VTK serialization, object ownership, mapper helpers, and interactor mappings that unit tests alone did not reveal.

## 3. The Example

The Python application still constructs an ordinary VTK pipeline. The browser configuration is attached when `LocalView` is created:

```python
from trame.app import get_server
from trame.ui.vuetify3 import SinglePageLayout
from trame.widgets import vtklocal

from vtkmodules.vtkFiltersSources import vtkConeSource
from vtkmodules.vtkRenderingCore import (
    vtkActor,
    vtkPolyDataMapper,
    vtkRenderer,
    vtkRenderWindow,
)

server = get_server()

source = vtkConeSource()
source.SetResolution(64)

mapper = vtkPolyDataMapper()
mapper.SetInputConnection(source.GetOutputPort())

actor = vtkActor()
actor.SetMapper(mapper)

renderer = vtkRenderer()
renderer.AddActor(actor)
renderer.SetBackground(0.10, 0.14, 0.22)

render_window = vtkRenderWindow()
render_window.AddRenderer(renderer)
renderer.ResetCamera()

with SinglePageLayout(server) as layout:
    with layout.content:
        view = vtklocal.LocalView(
            render_window,
            config={
                "rendering": "webgpu",
                "exec": "async",
            },
            progress_enabled=True,
            auto_resize=True,
        )


def increase_resolution():
    source.SetResolution(source.GetResolution() + 8)
    view.update()


server.start()
```

The application continues to own the source, mapper, actor, renderer, and render window in Python. The widget owns delivery: it serializes the scene, selects and loads a compatible WASM runtime, binds the canvas, and keeps the browser copy synchronized. Switching to WebGL changes the widget configuration rather than the visualization pipeline.

## 4. Why This Matters?

trame-vtklocal puts VTK-WASM and WebGPU in the hands of Python users. That is the central adoption contribution. A researcher can keep using VTK or PyVista, an application team can keep using trame, and the browser can still perform local rendering with compiled VTK.

Local rendering changes deployment economics. Camera motion does not require a server image for every frame. The server can focus on data, computation, and shared application state. A scene can also be exported for a standalone viewer, supporting reproducible examples and disconnected review.

The bridge benefits developers as well as users. Real PyVista and trame scenes are more varied than isolated unit tests. By pushing those scenes through serialization and multiple browser runtimes, trame-vtklocal identifies the gaps that matter to actual applications. Its growing CI suite is therefore part of VTK-WASM's quality system.

## 5. Conclusion

VTK-WASM supplies the browser runtime. WebGPU supplies a modern renderer. trame-vtklocal supplies the path from the Python application to both.

That path has matured considerably: shared runtimes, remote sessions, 32- and 64-bit builds, WebGL and WebGPU, progress reporting, selection, multiple views, export, lifecycle cleanup, and browser regression testing. The remaining work is to broaden serialization and rendering coverage and to expose the integration through larger communities such as PyVista. The key user experience is already clear: keep writing the VTK pipeline you know, and let the browser become another place it can run.