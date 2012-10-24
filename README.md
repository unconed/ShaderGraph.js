ShaderGraph.js
==========

![ShaderGraph.js](https://raw.github.com/unconed/ShaderGraph.js/master/misc/nodes.png)

ShaderGraph is an experimental library for building GLSL shaders (aimed at, but not dependent on, Three.js). It lets you build shaders with lego-like blocks of GLSL code, exposed as nodes in a graph. Nodes are wired up via outlets in a typical data-flow style.

ShaderGraph is a prototype and was written to solve a problem I had in several projects: I needed to combine shader-based effects in various combinations on the fly, and couldn't get away with simply concatenating static pieces of code.

This is really just a proof of concept rather than anything robust. Expect it to change and break.

---

Overview
--------

ShaderGraph is deliberately simple in its understanding of GLSL code. It partially parses snippets of GLSL, separating the inputs/outputs from the code. Snippets are typically short and involve only few variables, e.g. transforming a vertex, shifting a color, combining samples, generating textures, etc.

Each snippet becomes a node, each input/output becomes an outlet. Outlets are connected in a directed graph, with each output feeding into one or more inputs. Additionally, there are material nodes which combine a fragment and vertex shader snippet into one.

The graph is terminated by a material node with no outputs. The final shaders are compiled by traversing the graph backwards and assembling the code, assigning intermediate variables along the way.

ShaderGraph provides a simple factory API for quick usage:
```
// Build serial graph of two snippets + material
var graph = factory
            .snippet(code1)
            .snippet(code2)
            .material(vertex, fragment)
            .end();

// Compile material
var material = graph.compile();
```

Graphs do not have to be linear and can include parallel tracks and branches:

```
// Split ->  Top   -> Join
//       -> Bottom ->

var graph = factory
            .snippet('split')
            .group()
              .snippet('top')
            .next()
              .snippet('bottom')
            .combine()
            .snippet('join')
            ...
            .end();
```

This graph has one snippet 'split' connecting to two in parallel ('top', 'bottom'), which each connect back to one ('join').

Chains of snippets are built with the `.snippet()` call. Chains are built in parallel using `.group()` to start, then `.next()` to begin a new parallel chain inside that group, and `.combine()` to append the entire group to the parent chain.

Finally, note that ShaderGraph provides a clean internal separation between the data structure (the graph and its nodes) and the shader/compilation logic (the logical building blocks, i.e. snippets and materials). This means ShaderGraph can in theory be extended to include more than just raw GLSL nodes, and could be part of a bigger 'data flow programming' style framework in the future.

How it works
-------
Here we'll build a shader for sampling a texture, changing the sample color, and writing it to the screen.

We'll have two vertex snippets and three fragment snippets:

```
<script type="application/x-glsl" id="vertex1">
// Provide varying UV coordinates
varying vec2 vUV;
void main() {
  vUV = uv;
}
</script>

<script type="application/x-glsl" id="fragment1">
// Read from texture
uniform sampler2D texture;
varying vec2 vUV;
void main(out vec3 color) {
  color = texture2D(texture, vUV);
}
</script>

<script type="application/x-glsl" id="fragment2">
// Fade out color
uniform vec3 colorIn
void main(out vec3 colorOut) {
  colorOut = colorIn - vec3(1.0/255.0, 1.0/255.0, 1.0/255.0);
}
</script>

<script type="application/x-glsl" id="vertex3">
// Project position into view',
void main() {
  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(position, 1.0);
}
</script>

<script type="application/x-glsl" id="fragment3">
// Output color
uniform vec3 color;
void main() {
  gl_FragColor = color;
}
</script>
```

ShaderGraph auto-loads the scripts from the DOM into variables. We build the graph using the provided factory, passing in the pieces of GLSL code:

![Example nodes](https://raw.github.com/unconed/ShaderGraph.js/master/misc/nodes.png)

```
var factory = new ShaderGraph.Factory();
var graph = factory
  .material('vertex1', 'fragment1')
  .snippet('fragment2')
  .material('vertex3', 'fragment3')
  .end();
```

The factory auto-chains the nodes together, matching up inputs and outputs for you, by name and type.

As a result, the graph actually looks like this:

![Example outlets](https://raw.github.com/unconed/ShaderGraph.js/master/misc/outlets.png)

Nodes can have any number of outlets, and they can be manually connected as well, using `node.get('outlet')` to access an individual outlet, and `outlet1.connect(outlet2)` to make connections. The graph is designed to be 'live': connections can be added/removed at will, and nodes can even change their set of outlets with minimal disruption.

We compile the final material by finding the last node in the graph, looking up its attached material and invoking `.compile()`.

```
// Shorthand
var program = graph.compile();

// Long way, graph traversal
var end = graph.tail();
var material = end.owner();
var program = material.compile();
```

The returned program object has `uniforms`, `attributes`, `vertexShader` and `fragmentShader` properties and can be used as e.g. a Three.js ShaderMaterial.

The shaders for the example above look like this when compiled:
```
// Vertex Shader
void _sg_vertex_main_6(  ) {
  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(position, 1.0);
}
varying vec2 vUV;
void _sg_vertex_main_4(  ) {
  vUV = uv;
}
void main() {
_sg_vertex_main_6();
_sg_vertex_main_4();
}
```

```
// Fragment Shader
uniform sampler2D texture;
varying vec2 vUV;
void _sg_fragment_main_4( out vec3 color ) {
  color = texture2D(texture, vUV);
}
void _sg_fragment_main_5( out vec3 colorOut, vec3 colorIn ) {
  colorOut = colorIn - vec3(1.0/255.0, 1.0/255.0, 1.0/255.0);
}
void _sg_fragment_main_6( vec3 color ) {
  gl_FragColor = color;
}
void main() {
vec3 _sg_colorOut_23 ;
vec3 _sg_color_21 ;
__fragmentmain4(_sg_color_21);
__fragmentmain5(_sg_colorOut_23,_sg_color_21);
__fragmentmain6(_sg_colorOut_23);
}
```

The snippets are included as library functions with altered signatures, and a main() function has been created to call the snippets in the right order and pass values around.

While this example might seem like a lot of handwaving to do very little, it can be a powerful approach if you have a decent standard library of snippets to re-use. ShaderGraph is more flexible than simply concatenating strings together, and lets you write your building blocks in vanilla GLSL with only a few minor restrictions (*).

(*) Currently, array arguments are not reliably supported, and `inout` arguments do not work. All of these are partially supported, but some pieces are missing.

* * *

Steven Wittens - http://acko.net/
