(function ($) {

/**
 * Model of a shader program as it's being built.
 *
 * Is passed around and accumulates data, after which .compile() is called to finalize.
 */
$.Program = function () {
  this.calls = { vertex: {}, fragment: {} };
  this.variables = { vertex: {}, fragment: {} };
  this.externals = {};

  this.compiled = false;
  this.attributes = {};
  this.uniforms = {};
  this.vertexShader = '';
  this.fragmentShader = '';

  this.includes = { vertex: [], fragment: [] };
}

// TODO Add support for array types.
$.Program.types = {
  'f':  'float',
  'v2': 'vec2',
  'v3': 'vec3',
  'v4': 'vec4',
  'm3': 'mat3',
  'm4': 'mat4',
  't':  'sampler2D'//,
};

$.Program.prototype = {

  include: function (object, phase) {
    if (this.includes[phase].indexOf(object) >= 0) {
      return true;
    }
    this.includes[phase].push(object);
    return false;
  },

  external: function (category, arg) {
    arg = _.extend({ category: category }, arg);
    this.externals[arg.name] = arg;
  },

  variable: function (phase, name, arg) {
    arg = _.extend({}, arg, { name: name });
    this.variables[phase][name] = arg;
  },

  add: function (phase, name, args, code, priority) {
    var call = this.calls[phase][name];
    if (call) {
      call.priority = Math.min(call.priority, priority);
    }
    else {
      this.calls[phase][name] = { name: name, args: args, code: code, priority: priority };
    }
  },

  compile: function () {
    // Prepare uniform/attribute definitions for Three.js
    _.each(this.externals, function (e) {
      if (e.category == 'uniform') {
        this.uniforms[e.name] = {
          type: e.type,
          value: e.value//,
        };
      }
      if (e.category == 'attribute') {
        this.attributes[e.name] = {
          type: e.type,
          value: []//,
        };
      }
    }.bind(this));

    // Prepare vertex and fragment bodies.
    _.each([ 'vertex', 'fragment' ], function (phase) {

      // Build combined header without redundant definitions.
      var header = [];
      _.each(this.externals, function (e) {
        // Exclude vertex attributes from fragment shader.
        if (e.category == 'attribute' && phase == 'fragment') return;

        // Add definition
        header.push([e.category, e.signature, ';'].join(' '));
      }.bind(this));
      header = header.join("\n");

      var sorted = _.toArray(this.calls[phase]);
      var library = [ header ];

      // Start main function.
      var main = [ 'void main() {'];

      // Add variable definitions.
      _.each(this.variables[phase], function (variable) {
        main.push([ $.Program.types[variable.type], variable.name, ';' ].join(' '));
      });

      // Add calls.
      sorted.sort(function (a, b) {
        return b.priority - a.priority;
      });
      _.each(sorted, function (call) {
        library.push(call.code);
        main.push([ call.name, '(', call.args.join(','), ');' ].join(''))
      });
      main.push('}');

      // Build shader body
      this[phase + 'Shader'] = [ library.join("\n"), main.join("\n") ].join("\n");
    }.bind(this));

    this.compiled = true;
  },

  material: function () {
    if (!this.compiled) throw "Fetching material from uncompiled program.";
    return new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.vertex,
      fragmentShader: this.fragment//,
    });
  }//,

};

})(ShaderGraph);