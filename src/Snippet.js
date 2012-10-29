(function ($) {

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
