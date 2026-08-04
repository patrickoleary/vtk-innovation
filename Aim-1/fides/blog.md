# Fides and Conduit: A Shorter Path from Medical and Scientific Data to VTK

The moment a visualization project turns into a reader project is usually the moment progress slows down. The data already exists. Python, the simulation, or a domain library can already read it. Yet getting that data into VTK may still mean designing a new C++ reader, translating metadata, constructing meshes by hand, and maintaining that code as the upstream format evolves.

Fides (see [repository](https://fides.readthedocs.io/en/latest/?badge=latest) and [documentation](https://fides.readthedocs.io/en/latest/?badge=latest)) and Conduit offer a different division of labor. Conduit provides a structured in-memory representation for medical and scientific arrays and meshes. Fides provides a declarative description of how those arrays become coordinates, cells, and fields. VTK then receives a real data object that can enter its normal filtering, analysis, and rendering pipeline. The result is a reusable data-mapping layer instead of another format-specific reader.

## 1. The Challenge

Merdical and scientific data does not arrive in one clean format. Simulations write ADIOS2, HDF5, NetCDF, custom binary records, or application-specific databases. Experiments and instruments add their own metadata and conventions. AI workflows may produce arrays whose structure changes quickly during research. Even when two projects use the same container format, their variable names, dimensions, coordinate conventions, and mesh connectivity can be completely different.

Traditional VTK readers combine several responsibilities: open the source, parse its layout, interpret domain metadata, construct a VTK mesh, attach fields, and expose time or partition information. That approach is appropriate for stable community formats, but it is expensive for local, evolving, or proprietary data. It also encourages repeated translations and temporary files when the data is already available in memory.

The underlying problem is a missing boundary. Data access and visualization mapping are related, but they do not have to be implemented in the same class.

## 2. The Implementation

Fides makes the mapping explicit. A JSON data model describes coordinate systems, topologies, fields, associations, partitions, and other metadata. The schema does not need to know how a particular Python library opened the original file; it identifies the arrays that should become the VTK data model.

Conduit supplies the in-memory source. Its `Node` type represents hierarchical data and can refer to existing arrays when their type, layout, and lifetime permit. A user can load a proprietary or standard format with the most appropriate library, organize the needed arrays in a Conduit Node, and pass that node to Fides.

The integration required more than adding an overload. Fides had to separate its core data-model interpretation from assumptions about ADIOS2. A pluggable backend and registry isolate source-specific types. VTK's `vtkFidesReader` then accepts a data-model description and a named Conduit data source.

The work continued in 2026. The initial VTK integration arrived in [VTK !12641](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12641). Later work in [VTK !13397](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/13397) moved the reader and writer toward Fides's native VTK backend, reducing adapter overhead and aligning the path directly with VTK data objects. Fides itself also expanded deterministic tests for structured and unstructured grids, mixed cell types, fields, blocks, embedded schemas, and multiple data-model input modes.

## 3. The Example

Suppose a Python library already gives us point coordinates, connectivity, and a temperature array. We can organize those arrays in a Conduit Node, provide a Fides schema, and let `vtkFidesReader` construct the VTK dataset:

```python
import json
import numpy as np
import conduit
from vtkmodules.vtkIOFides import vtkFidesReader

# These arrays could come from h5py, netCDF4, xarray,
# a simulation API, or a proprietary reader.
x = np.array([0.0, 1.0, 0.0], dtype=np.float64)
y = np.array([0.0, 0.0, 1.0], dtype=np.float64)
connectivity = np.array([0, 1, 2], dtype=np.int32)
temperature = np.array([292.0, 294.5, 293.2], dtype=np.float32)

node = conduit.Node()
node["coordsets/coords/type"] = "explicit"
node["coordsets/coords/values/x"].set_external(x)
node["coordsets/coords/values/y"].set_external(y)
node["topologies/mesh/type"] = "unstructured"
node["topologies/mesh/coordset"] = "coords"
node["topologies/mesh/elements/shape"] = "tri"
node["topologies/mesh/elements/connectivity"].set_external(connectivity)
node["fields/temperature/association"] = "vertex"
node["fields/temperature/topology"] = "mesh"
node["fields/temperature/values"].set_external(temperature)

schema = json.dumps({
    # The full Fides model identifies the source arrays and maps
    # them to coordinates, topology, and fields.
})

reader = vtkFidesReader()
reader.ParseDataModel(schema)
reader.SetDataSourceNode("source", node)
reader.Update()

dataset = reader.GetOutputDataObject(0)
```

The schema is intentionally shown as the application-specific part. Once written, it can be versioned, tested, and reused across timesteps or related datasets. The Python reader remains responsible for opening the original source; Fides remains responsible for mapping; and VTK remains responsible for visualization.

## 4. Why This Matters?

This approach lowers the cost of getting new data into visualization. A domain expert can use the library that already understands the source, describe the visualization mapping in JSON, and avoid reimplementing file parsing in VTK. If a variable name or path changes, the schema can often change without recompiling a reader.

The in-memory path also supports more than post-processing. Simulations, experiments, and AI pipelines can publish arrays directly to Conduit. When array layout and lifetime permit external references, unnecessary copies can be avoided. That makes the same architecture relevant to in situ analysis, interactive steering, and rapid Python prototyping.

For VTK and Fides maintainers, separating backends from data-model interpretation is a sustainability improvement. ADIOS2, Conduit, and future sources can share the mapping logic and test cases. The native VTK backend further reduces the distance between mapped arrays and the toolkit users ultimately want to run.

## 5. Conclusion

Not every dataset needs a new reader class. Many datasets need a clear description of the arrays they already contain.

Fides and Conduit turn that description into an interface. Conduit carries the data, Fides maps its meaning, and VTK provides the visualization pipeline. The result is less custom I/O plumbing, a more direct in-memory workflow, and a practical route for fast-changing scientific data to become useful sooner.