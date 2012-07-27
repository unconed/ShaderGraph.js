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

// Simple array/object iterator.
// (can be replaced with underscore.js)
window._ = window._ || {};
_.each = _.each || function (object, callback) {
  if (object.forEach) {
    return object.forEach(callback);
  }
  for (key in object) {
    callback(object[key], key, object);
  }
};

