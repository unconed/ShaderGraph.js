/**
 * ShaderGraph.js. Assemble GLSL shaders on the fly.
 */

// Check dependencies.
;(function (deps) {
  for (var i in deps) {
    if (!window[i]) throw "Error: ShaderGraph requires " + deps[i];
  }
})({
  'THREE': 'Three.js'//,
});

// Namespace.
window.ShaderGraph = {};

// Fetch shader from <script> tag by id
ShaderGraph.getShader = function (id) {
  var elem = document.getElementById(id);
  return elem && (elem.innerText || elem.textContent) || id;
};(function ($) {

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


})(ShaderGraph);(function ($) {

/**
 * Helps build graphs of blocks/nodes with chainable API.
 */
$.Factory = function () {
  this.end();
};

$.Factory.prototype = {

  snippet: function (code, op) {
    op = op || 'append';

    var block = new $.Block.Snippet(ShaderGraph.getShader(code));
    this[op](block.node());

    return this;
  },

  material: function (vertex, fragment, op) {
    op = op || 'append';

    var block = new $.Block.Material(ShaderGraph.getShader(vertex), ShaderGraph.getShader(fragment));
    this[op](block.node());

    return this;
  },

  snippetBefore: function (code) {
    this.snippet(code, 'prepend');
    return this;
  },


  materialBefore: function (vertex, fragment) {
    this.material(code, 'prepend');
    return this;
  },

  append: function (node) {
    if (!node.graph) this.graph.add(node);

    var context = this.stack[0];

    _.each(context.end, function (end) {
      end.connect(node);
    });
    if (!context.start.length) {
      context.start = [node];
    }
    context.end = [node];

    return this;
  },

  prepend: function (node) {
    if (!node.graph) this.graph.add(node);

    var context = this.stack[0];

    _.each(context.start, function (start) {
      node.connect(start);
    });
    if (!context.end.length) {
      context.end = [node];
    }
    context.start = [node];

    return this;
  },

  group: function () {
    // Inner var holds working state, outer var holds accumulated state.
    this.stack.unshift({ start: [], end: [] });
    this.stack.unshift({ start: [], end: [] });

    return this;
  },

  pass: function () {
    this.next();

    var sub = this.stack[0];
    sub.start.push(null);

    return this.combine();
  },

  next: function () {
    var sub = this.stack.shift();
    var main = this.stack[0];

    main.start = main.start.concat(sub.start);
    main.end   = main.end.concat(sub.end);

    this.stack.unshift({ start: [], end: [] });

    return this;
  },

  combine: function () {
    if (this.stack.length <= 2) throw "Popping factory stack too far.";

    this.next();
    this.stack.shift();

    var sub = this.stack.shift(),
        main = this.stack[0];

    if (sub.start.length) {
      _.each(sub.start, function (to) {
        // Passthrough all outlets to other side
        if (!to) {
          sub.end = sub.end.concat(main.end);
        }
        // Normal destination
        else _.each(main.end, function (from) {
          from.connect(to, true);
        });
      });
      main.end = sub.end;
    }

    return this;
  },

  end: function () {
    var graph = this.graph;

    this.graph = new $.Graph();
    this.stack = [];
    this.group();

    // Add compile shortcut.
    if (graph) {
      graph.compile = function () {
        return graph.tail().owner().compile();
      };
    }

    return graph;
  }//,
};


})(ShaderGraph);
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

})(ShaderGraph);(function ($) {

/**
 * Parse a snippet of GLSL code so it can be composed into a shader.
 *
 * Must contain a single function with in/out parameters, returning void.
 */
$.Snippet = function (code) {

  // Only need to parse each snippet once.
  if ($.Snippet.cache[code]) {
    return $.Snippet.cache[code];
  }
  else {
    $.Snippet.cache[code] = this;
  }

  this.code = code;

  this.attributes = [];
  this.uniforms   = [];
  this.varyings   = [];
  this.parameters = [];
  this.signature  = '';
  this.body       = '';

  this.parseCode(code);
}

$.Snippet.cache = {};

$.Snippet.types = {
  'float':       'f',
  'vec2':        'v2',
  'vec3':        'v3',
  'vec4':        'v4',
  'mat3':        'm3',
  'mat4':        'm4',
  'sampler2D':   't',
  'samplerCube': 't'//,
};

$.Snippet.defaults = {
  'float':       0,
  'vec2':        new THREE.Vector3(),
  'vec3':        new THREE.Vector3(),
  'vec4':        new THREE.Vector4(),
  'mat4':        new THREE.Matrix4(),
  'sampler2D':   0,
  'samplerCube': 0//,
};

$.Snippet.prototype = {

  compile: function (name, replaced, bodyOnly) {
    // Build updated function signature.
    var signature = this.signature.slice();
    var header = [];
    replaced = replaced || [];

    // Prepare uniforms
    _.each(this.uniforms, function (item) {
      if (replaced.indexOf(item.name) >= 0) {
        signature.push(item.signature);
      }
      else if (!bodyOnly) {
        header.push(['uniform', item.signature].join(' '));
      }
    });

    // Prepare attributes
    !bodyOnly && _.each(this.attributes, function (item) {
      header.push(['attribute', item.signature].join(' '));
    });

    // Prepare varyings
    !bodyOnly && _.each(this.varyings, function (item) {
      header.push(['varying', item.signature].join(' '));
    });

    // Insert new signature into body
    var body = this.body.replace(/\s*void\s+([A-Za-z0-9]+)\s*\([^\)]*\)/g, ['void', name + '(', signature.join(', '), ')'].join(' '));

    // Assemble code
    header.push(body);
    return header.join(';\n')
  },

  arguments: function () {
    return {
      uniforms: this.uniforms,
      varyings: this.varyings,
      attributes: this.attributes,
      parameters: this.parameters//,
    };
  },

  type: function (type, array) {
    type = ($.Snippet.types[type] || 'f') + (array ? 'v' : '');
    type = type == 'fv' ? 'fv1' : type;
    return type;
  },

  parseAttribute: function (match) {
    var signature = match[1],
        type = match[2],
        name = match[3],
        array = match[4];

    this.attributes.push({
      name: name,
      type: this.type(type, array),
      signature: signature//,
    });
  },

  parseUniform: function (match) {
    var signature = match[1],
        type = match[2],
        name = match[3],
        array = match[4];

    this.uniforms.push({
      name: name,
      type: this.type(type, array),
      value: $.Snippet.defaults[type] || 0,
      signature: signature//,
    });
  },

  parseVarying: function (match) {
    var signature = match[1],
        type = match[2],
        name = match[3],
        array = match[4];

    this.varyings.push({
      name: name,
      type: this.type(type, array),
      signature: signature//,
    });
  },

  parseSignature: function (match) {
    this.name = match[1];

    // Ignore empty signature
    var signature = match[2].replace(/^\s*$/g, '');
    if (signature.length == 0) {
      this.signature = [];
      return;
    }

    // Parse out arguments.
    var arguments = this.signature = signature.split(',');
    _.each(arguments, function (definition) {
      var match = /((?:(in|out|inout)\s+)?([A-Za-z0-9]+)\s+([A-Za-z0-9_]+)\s*(?:\[([^\]]+)\])?)(?:$|(?=;))/.exec(definition);

      var signature = match[1],
          inout = match[2],
          type = match[3],
          name = match[4],
          array = match[5];

      var inouts = {
        'in': $.IN,
        'out': $.OUT,
        'inout': $.INOUT//,
      };

      this.parameters.push({
        inout: inouts[inout || 'in'],
        name: name,
        type: this.type(type, array),
        signature: signature//,
      });
    }.bind(this));
  },

  parseCode: function (code) {
    function findAll(re, string) {
      if (!re.global) throw "Can't findAll non-global regexp";
      var match, all = [];
      while (match = re.exec(string)) {
        all.push(match);
      };
      return all;
    }

    // Remove all comments and normalize newlines
    code = code.replace(/\r\n?/g, '\n').replace(/\/\/[^\n]*\n/g, ' ').replace(/\/\*(.|\n)*?\*\//g, ' ');

    // Find all attributes/uniforms/varying + function signature
    var attributes = findAll(/(?:^|;)\s*attribute\s+(([A-Za-z0-9]+)\s+([A-Za-z0-9_]+)\s*(?:\[([^\]]+)\])?)(?:$|(?=;))/g, code);
    var uniforms = findAll(/(?:^|;)\s*uniform\s+(([A-Za-z0-9]+)\s+([A-Za-z0-9_]+)\s*(?:\[([^\]]+)\])?)(?:$|(?=;))/g, code);
    var varyings = findAll(/(?:^|;)\s*varying\s+(([A-Za-z0-9]+)\s+([[A-Za-z0-9_]+)\s*(?:\[([^\]]+)\])?)(?:$|(?=;))/g, code);
    var signature = findAll(/(?:^|;)\s*void\s+([A-Za-z0-9]+)\s*\(([^\)]*)\)\s*{/g, code);

    if (!signature[0]) throw "Could not parse shader snippet. Must contain a void-returning function with in/outs: " + code;

    // Process uniforms/varyings and remove from source.
    var matches = {
      parseAttribute: attributes,
      parseUniform:   uniforms,
      parseVarying:   varyings//,
    };
    var body = code;
    _.each(matches, function (set, key) {
      _.each(set, function (item) {
        this[key](item);
        body = body.replace(item[0], '');
      }.bind(this));
    }.bind(this));
    body = body.replace(/^\s*;/, '');

    // Process function signature.
    this.parseSignature(signature[0]);
    this.body = body;
  }//,

};

})(ShaderGraph);
(function ($) {

/**
 * Graph of shader nodes.
 */
$.Graph = function (nodes, parent) {
  this.parent = parent || null;
  this.nodes = [];
  nodes && this.add(nodes);
};

$.Graph.prototype = {

  iterate: function (callback) {
    _.each(this.nodes, function (node) {
      callback(node, node._owner);
    });
  },

  exposed: function () {
    var exposed = [];
    this.iterate(function (node) {
      _.each(node.outlets(), function (outlet) {
        if (outlet.exposed) {
          exposed.push(outlet);
        }
      });
    });
    return exposed;
  },

  inputs: function () {
    var inputs = [];
    this.iterate(function (node) {
      _.each(node.inputs, function (outlet) {
        if (outlet.input == null) {
          inputs.push(outlet);
        }
      });
    });
    return inputs;
  },

  outputs: function () {
    var outputs = [];
    this.iterate(function (node) {
      _.each(node.outputs, function (outlet) {
        if (outlet.output.length == 0) {
          outputs.push(outlet);
        }
      });
    });
    return outputs;
  },

  tail: function () {
    return this.nodes[this.nodes.length - 1];
  },

  add: function (node) {

    // Array syntax.
    if (node.constructor == Array) return _.each(node, function (node) { this.add(node); }.bind(this));

    // Sanity check.
    if (node.graph) throw "Adding node to two graphs at once";

    // Link node to graph.
    node.link(this);

    // Add node to list
    this.nodes.push(node);
  },

  remove: function (node, ignore) {
    // Array syntax.
    var that = this;
    if (node.constructor == Array) return _.each(node, function (node) { that.remove(node); });

    // Sanity check.
    if (node.graph != this) throw "Removing node from wrong graph.";

    // Disconnect all outlets
    ignore || node.disconnect();

    // Remove node from list.
    this.nodes.splice(this.nodes.indexOf(node), 1);
  }//,
};

$.IN = 0;
$.OUT = 1;
$.INOUT = 2;

})(ShaderGraph);
(function ($) {

/**
 * Node in shader graph.
 */
$.Node = function (owner, outlets) {
  this.graph = null;
  this.inputs = [];
  this.outputs = [];
  this._outlets = {};

  this.owner(owner);
  this.outlets(outlets);
};

$.Node.prototype = {

  // Set/get object represented by the node.
  owner: function (owner) {
    if (owner !== undefined) {
      // Setter
      this._owner = owner;

      // Chain
      return this;
    }
    // Getter
    return this._owner;
  },

  // Notify: become part of the given graph
  link: function (graph) {
    this.graph = graph;
  },

  // Retrieve input
  getIn: function (name) {
    return this.get(name, $.IN);
  },

  // Retrieve output
  getOut: function (name) {
    return this.get(name, $.OUT);
  },

  // Find outlet by name.
  get: function (name, inout) {
    if (inout === undefined) {
      return this.get(name, $.IN) || this.get(name, $.OUT);
    }
    return this._outlets[[name, inout].join('-')];
  },

  // Return hash key for outlet
  key: function (outlet) {
    return [outlet.name, outlet.inout].join('-');
  },

  // Set new outlet definition
  outlets: function (outlets) {
    if (outlets !== undefined) {
      // Return new/old outlet matching hash key
      function hash(outlet) {
        // Match by name, direction and type.
        return [outlet.name, outlet.inout, outlet.type].join('-');
      };

      // Build hash of new outlets
      var keys = {};
      _.each(outlets, function (outlet) {
        keys[hash(outlet)] = true;
      }.bind(this));

      // Remove missing outlets
      _.each(this._outlets, function (outlet) {
        if (!keys[hash(outlet)]) this.remove(outlet);
      }.bind(this));

      // Insert new outlets.
      _.each(outlets, function (outlet) {
        // Find match by type/name/direction
        var existing = this.get(outlet.name, outlet.inout);
        if (!existing) {
          // Spawn new outlet
          outlet = new $.Outlet(outlet);
          this.add(outlet);
        }
        else {
          // Update existing outlets in place to retain connections.
          existing.morph(outlet);
        }
      }.bind(this));

      // Chain
      return this;
    }
    return this._outlets;
  },

  // Add outlet object to node.
  add: function (outlet) {
    var key = this.key(outlet);
        outlets = this._outlets,
        _in = this.inputs,
        _out = this.outputs;

    // Sanity checks.
    if (outlet.node) throw "Adding outlet to two nodes at once.";
    if (outlets[key]) throw "Adding two identical outlets to same node.";

    // Link back outlet.
    outlet.link(this);

    // Add to name list and inout list.
    outlets[key] = outlet;
    (outlet.inout == $.IN ? _in : _out).push(outlet);

    // Chain
    return this;
  },

  // Remove outlet object from node.
  remove: function (outlet) {
    var outlets = this._outlets,
        key = this.key(outlet),
        inout = outlet.inout,
        set = outlet.inout == $.IN ? this.inputs : this.outputs;

    // Sanity checks
    if (outlet.node != this) throw "Removing outlet from wrong node.";

    // Disconnect outlet.
    outlet.disconnect();

    // Unlink outlet.
    outlet.link(null);

    // Remove from name list and inout list.
    delete outlets[key];
    set.splice(set.indexOf(outlet), 1);

    // Chain
    return this;
  },

  // Connect to the target node by matching up inputs and outputs.
  connect: function (node, empty, force) {
    var outlets = {},
        hints = {},
        counters;

    // Keep track of how often a particular type has been encountered.
    function track(match) {
      return counters[match] = (counters[match] || 0) + 1;
    }
    function reset() {
      counters = {};
    }

    // Build hash keys of target outlets.
    reset();
    _.each(node.inputs, function (outlet) {
      // Only autoconnect if not already connected.
      if (!force && outlet.input) {
        return;
      }

      // Match outlets by type/name hint, then type/position key.
      var type = outlet.type,
          hint = [type, outlet.hint].join('-');

      if (!hints[hint]) hints[hint] = outlet;
      outlets[type] = outlets[type] || [];
      outlets[type].push(outlet);
    });

    // Build hash keys of source outlets.
    reset();
    _.each(this.outputs, function (outlet) {
      // Ignore this outlet if only matching empties.
      if (empty && outlet.output.length) return;

      // Match outlets by type and name.
      var type = outlet.type,
          hint = [type, outlet.hint].join('-');

      // Connect if found.
      if (hints[hint]) {
        hints[hint].connect(outlet);

        delete hints[hint];
        outlets[type].splice(outlets[type].indexOf(outlet), 1);
        return;
      }

      // Match outlets by type and order.
      // Link up corresponding outlets.
      if (outlets[type] && outlets[type].length) {
        outlets[type].shift().connect(outlet);
      }
    });

    // Chain
    return this;
  },

  // Disconnect entire node
  disconnect: function (node) {
    _.each(this.inputs, function (outlet) {
      outlet.disconnect();
    });

    _.each(this.outputs, function (outlet) {
      outlet.disconnect();
    });

    // Chain
    return this;
  }//,

};

})(ShaderGraph);
(function ($) {
$.Outlets = 0;

$.Outlet = function (inout, name, hint, type, category, exposed, meta) {

  // Object constructor syntax
  if (typeof inout == 'object') {
    var object = inout;
    return new $.Outlet(object.inout, object.name, object.hint, object.type, object.category, object.exposed, object.meta);
  }

  this.node     = null;
  this.inout    = inout;
  this.name     = name;
  this.hint     = hint || name;
  this.type     = type;
  this.category = category;
  this.exposed  = !!exposed;
  this.meta     = meta || {};
  this.index    = ++$.Outlets;
  this.key      = null;

  this.input = null;
  this.output = [];
};

$.Outlet.prototype = {
  // Unique ID for this outlet.
  id: function () {
    return ['', 'sg', this.name, this.index].join('_');
  },

  // Set exposed flag
  expose: function (exposed) {
    this.exposed = exposed;
  },

  // Change into given outlet without touching connections.
  morph: function (outlet) {
    this.inout    = outlet.inout;
    this.name     = outlet.name;
    this.type     = outlet.type;
    this.category = outlet.category;
    this.exposed  = outlet.exposed;
    this.meta     = outlet.meta || {};
  },

  // Connect to given outlet.
  connect: function (outlet) {
    // Connect input from the other side.
    if (this.inout == $.IN && outlet.inout == $.OUT) {
      return outlet.connect(this);
    }

    // Disallow bad combinations.
    if (this.inout != $.OUT || outlet.inout != $.IN) {
      console.log(this, outlet)
      throw "Can't connect out/out or in/in outlets.";
    }

    // Check for existing connection.
    if (outlet.input == this) return;

    // Disconnect existing connections.
    outlet.disconnect();

    // Add new connection.
    outlet.input = this;
    this.output.push(outlet);
  },

  // Disconnect given outlet (or all).
  disconnect: function (outlet) {
    if (this.inout == $.IN) {
      // Disconnect input from the other side.
      if (this.input) {
        this.input.disconnect(this);
      }
    }
    else {
      if (outlet) {
        // Remove one outgoing connection.
        var index = this.output.indexOf(outlet);
        if (index >= 0) {
          this.output.splice(index, 1);
          outlet.input = null
        }
      }
      else {
        // Remove all outgoing connections.
        _.each(this.output, function (outlet) {
          outlet.input = null
        });
        this.output = [];
      }
    }
  },

  // Link to given node.
  link: function (node) {
    this.node = node;
  }//,
};

})(ShaderGraph);