/**
 * ShaderGraph.js. Assemble GLSL shaders on the fly.
 */

// Check dependencies.
(function (deps) {
  for (i in deps) {
    if (!window[i]) throw "Error: ShaderGraph requires " + deps[i];
  }
})({
  'THREE': 'Three.js'//,
});

// Namespace.
window.ShaderGraph = {};
