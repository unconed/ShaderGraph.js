(function ($) {

/**
 * Building block for effects, wraps a shader node, guides compilation.
 */
$.Block = function (node) {
  node = node || new $.Node();
  this.node(node);

  this.children = [];
  this.parent = null;
  this.properties = {};
  this.index = ++$.Block.index;

  this.refresh();
};

$.Block.index = 0;

$.Block.prototype = {

  node: function (node) {
    if (node !== undefined) {
      this._node = node;
      return this;
    }
    return this._node;
  },

  refresh: function () {
    this._node.owner(this);
    this._node.outlets(this.outlets());
  },

  fetch: function (program, phase, outlet, priority) {
    // Add outlet output code to program
  },

  id: function (program, phase, outlet, priority) {
    // Lookup inouts further up the chain
    if (outlet.meta.inout) {
      var input = outlet.node.get(outlet.name, $.IN).input;
      if (input) {
        return input.node.owner().fetch(program, phase, input, priority + 1);
      }
    }

    // Use this outlet's ID as intermediate variable name
    return outlet.id();
  },

};

/**
 * Building block for a GLSL shader
 */
$.Block.Snippet = function (code) {
  this.snippet = new $.Snippet(code);

  $.Block.call(this);
};

$.Block.Snippet.prototype = _.extend({}, $.Block.prototype, {

  insert: function (program, phase, priority) {
    // Compile code into program.
    $.Block.Snippet.compileCall(program, phase, this.node(), this.snippet, priority);
  },

  fetch: function (program, phase, outlet, priority) {
    // Ensure code is included in program.
    if (!program.include(this, phase)) {
      this.insert(program, phase, priority);
    }

    // Use this outlet's ID as intermediate variable name.
    return this.id(program, phase, outlet, priority);
  },

  outlets: function () {
    return $.Block.Snippet.makeOutlets(this.snippet);
  },

});

/**
 * Building block for a renderable material
 */
$.Block.Material = function (vertex, fragment) {
  this.vertex = new $.Snippet(vertex);
  this.fragment = new $.Snippet(fragment);

  $.Block.call(this);
};

$.Block.Material.prototype = _.extend({}, $.Block.prototype, {

  compile: function () {
    if (this.node().outputs.length > 0) throw "Can't compile material with outputs";

    var node = this.node();
    var program = new $.Program();

    this.insert(program, 'vertex', 0);
    this.insert(program, 'fragment', 0);

    program.compile();

    return program;
  },

  insert: function (program, phase, priority) {
    $.Block.Snippet.compileCall(program, phase, this.node(), this[phase], priority);
  },

  fetch: function (program, phase, outlet, priority) {
    // Ensure code is included only once in program.
    if (!program.include(this, phase)) {
      this.insert(program, phase, priority);
    }

    // Ensure vertex shader is added to program even if vertex outputs are not used.
    if (phase == 'fragment') {
      if (!program.include(this, 'vertex')) {
        this.insert(program, 'vertex', 0);
      }
    }

    // Use this outlet's ID as intermediate variable name.
    return this.id(program, phase, outlet, priority);
  },

  outlets: function () {
    var vertex   = $.Block.Snippet.makeOutlets(this.vertex);
    var fragment = $.Block.Snippet.makeOutlets(this.fragment);

    return _.union(vertex, fragment);
  },

});

/**
 * Make outlets based on a given signature.
 */
$.Block.Snippet.makeOutlets = function (snippet) {
  var outlets = [];

  // Since snippets are cached, cache outlets too.
  if (snippet.outlets) {
    return snippet.outlets;
  }

  var args = snippet.arguments();

  _.each(args.parameters, function (arg) {
    // Strip in/out suffix and set meta data
    arg = _.extend({}, arg);
    arg.meta = { required: true };
    arg.hint = arg.name.replace(/(In|Out)$/, '');
    arg.category = 'parameter';

    // Split inout args into two separate outlets
    if (arg.inout == $.INOUT) {
      arg.meta.inout = true;

      var input = _.extend({}, arg);
      input.inout = $.IN;
      outlets.push(input);

      arg.inout = $.OUT;
    }
    outlets.push(arg);
  });

  _.each(args.uniforms, function (arg) {
    // Strip in/out suffix and set meta data
    arg.meta = { };
    arg.hint = arg.name.replace(/(In|Out)$/, '');
    arg.category = 'uniform';
    arg.inout = $.IN;
    outlets.push(arg);
  });

  snippet.outlets = outlets;

  return outlets;
}

/**
 * Compile a GLSL snippet call by tracing inputs across the graph.
 */
$.Block.Snippet.compileCall = function (program, phase, node, snippet, priority) {
  var signature = snippet.arguments();
  var args = [];

  // Assign intermediate variables.
  _.each(signature.parameters, function (arg) {

    var fetch = arg.inout == $.INOUT ? $.IN : arg.inout;
    var outlet = node.get(arg.name, fetch);

    // Fetch code to calculate this input
    if (arg.inout == $.IN || arg.inout == $.INOUT) {
      if (outlet.input) {
        var owner = outlet.input.node.owner();

        var variable = owner.fetch(program, phase, outlet.input, priority + 1);
        program.variable(phase, variable, arg);
        args.push(variable);
      }
      else {
        console.log('Outlet', arg, input);
        throw ["Missing connection on outlet for " + arg.name];
      }
    }

    // Add output to call arguments
    else if (arg.inout == $.OUT) {
      var variable = outlet.id();
      program.variable(phase, variable, arg);
      args.push(variable);
    }
  });

  // Add uniforms
  var replaced = [];
  _.each(signature.uniforms, function (arg) {
    var outlet = node.get(arg.name);

    // Replace uniform with argument
    if (outlet.input) {
      var owner = outlet.input.node.owner();

      var variable = owner.fetch(program, phase, outlet.input, priority + 1);
      program.variable(phase, variable, arg);
      args.push(variable);
      replaced.push(arg.name);
    }
    // Pass through uniform
    else {
      program.external('uniform', arg);
    }
  });

  // Add attributes
  _.each(signature.attributes, function (arg) {
    program.external('attribute', arg);
  });

  // Add varyings
  _.each(signature.varyings, function (arg) {
    program.external('varying', arg);
  });

  // Compile snippet and add to program.
  var name = ['', 'sg', phase, snippet.name, node.owner().index ].join('_');
  var code = snippet.compile(name, replaced, true);
  program.add(phase, name, args, code, priority);
};


})(ShaderGraph);