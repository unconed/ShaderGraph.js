/**
 * Parse a snippet of GLSL code so it can be composed into a shader.
 *
 * Must contain a single function with in/out parameters, returning void.
 */
ShaderGraph.Snippet = function (code) {
  this.code = code;

  this.attributes = {};
  this.uniforms   = {};
  this.varyings   = {};
  this.parameters = [];
  this.signature  = '';
  this.body       = '';

  this.parseCode(code);
}

ShaderGraph.Snippet.types = {
  'float':       'f',
  'vec2':        'v2',
  'vec3':        'v3',
  'vec4':        'v4',
  'mat3':        'm3',
  'mat4':        'm4',
  'sampler2D':   't',
  'samplerCube': 't',
};

ShaderGraph.Snippet.defaults = {
  'float':       0,
  'vec2':        new THREE.Vector3(),
  'vec3':        new THREE.Vector3(),
  'vec4':        new THREE.Vector4(),
  'mat4':        new THREE.Matrix4(),
  'sampler2D':   0,
  'samplerCube': 0,
};

ShaderGraph.Snippet.prototype = {

  type: function (type, array) {
    type = (ShaderGraph.Snippet.types[type] || 'f') + (array ? 'v' : '');
    type = type == 'fv' ? 'fv1' : type;
    return type;
  },

  parseAttribute: function (match) {
    var type = match[1],
        name = match[2],
        array = match[3];

    this.attributes[name] = {
      type: this.type(type, array),
    };
  },

  parseUniform: function (match) {
    var type = match[1],
        name = match[2],
        array = match[3];

    this.uniforms[name] = {
      type: this.type(type, array),
      value: ShaderGraph.Snippet.defaults[type] || 'f',
    };
  },

  parseVarying: function (match) {
    var type = match[1],
        name = match[2],
        array = match[3];

    this.varyings[name] = {
      type: this.type(type, array),
    };
  },

  parseSignature: function (match) {
    this.name = match[1];
    this.signature = match[2];

    var arguments = match[2].split(',');
    _.each(arguments, function (signature) {
      var match = /(in|out|inout)\s+([A-Za-z0-9]+)\s+([A-Za-z0-9_]+)\s*(?:\[([^\]]+)\])?(?:$|(?=;))/.exec(signature);

      var inout = match[1],
          type = match[2],
          name = match[3],
          array = match[4];

      this.parameters.push({
        inout: match[1],
        type: this.type(match[2], match[4]),
        name: match[3],
      });
    }.bind(this));
  },

  parseCode: function (code) {
    var regexp;

    function findAll(re) {
      var match, all = [];
      while (match = re.exec(code)) {
        all.push(match);
      };
      return all;
    }

    // Find all attributes/uniforms/varying + function signature
    var attributes = findAll(/(?:^|;)\s*attribute\s+([A-Za-z0-9]+)\s+([A-Za-z0-9_]+)\s*(?:\[([^\]]+)\])?(?:$|(?=;))/g);
    var uniforms = findAll(/(?:^|;)\s*uniform\s+([A-Za-z0-9]+)\s+([A-Za-z0-9_]+)\s*(?:\[([^\]]+)\])?(?:$|(?=;))/g);
    var varyings = findAll(/(?:^|;)\s*varying\s+([A-Za-z0-9]+)\s+([[A-Za-z0-9_]+)\s*(?:\[([^\]]+)\])?(?:$|(?=;))/g);
    var signature = findAll(/(?:^|;)\s*void\s+([A-Za-z0-9]+)\s*\(([^\)]+)\)\s*{/g);

    if (!signature[0]) throw "Could not parse shader snippet. Must contain a void-returning function with in/outs: " + code;

    // Process uniforms/varyings and remove from source.
    var matches = {
      parseAttribute: attributes,
      parseUniform:   uniforms,
      parseVarying:   varyings,
    };
    var body = code;
    _.each(matches, function (set, key) {
      _.each(set, function (item) {
        this[key](item);
        body = body.replace(item[0], '');
      }.bind(this));
    }.bind(this));

    // Process function signature.
    this.parseSignature(signature[0]);
    this.body = body;
  },

};
