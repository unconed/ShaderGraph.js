Test.Tests.ShaderSnippet = function (done) {

  var code = [
'  uniform float f;',
'  uniform float fv1[3];',
'  uniform vec2 v2;',
'  uniform vec2 v2v[3];',
'  uniform vec3 v3;',
'  uniform vec3 v3v[3];',
'  uniform vec4 v4;',
'  uniform vec4 v4v[3];',
'  uniform sampler2D t;',
'  uniform sampler2D tv[3];',
'  varying float f;',
'  varying float fv1[3];',
'  varying mat3 m3;',
'  varying mat3 m3v[3];',
'  varying mat4 m4;',
'  varying mat4 m4v[3];',
'  attribute float f;',
'  attribute float fv1[3];',
'  attribute vec3 v3;',
'  attribute vec3 v3v[3];',
'  attribute mat4 m4;',
'  attribute mat4 m4v[3];',
'  void main(',
'    in vec4 v4in, in mat3 m3vin[3],',
'    out vec4 v4out, out vec4 v4vout[3], out mat4 m4out, out mat4 m4vout[3]) {',
'    //',
'  }'].join("\n");

  var snippet = new ShaderGraph.Snippet(code);

  var counts = {
    uniforms: 10,
    varyings: 6,
    attributes: 6,
    parameters: 6,
  };

  function verifyTypes(category) {
    var total = counts[category];
    _.each(snippet[category], function (parameter, key) {
      counts[category]--;
      assert(parameter.type == key, category + ' type ' + key);
    });
    assert(counts[category] == 0, 'Found all '+ total + ' ' + category);
  }

  function verifyParameters() {
    var total = counts.parameters;
    _.each(snippet.parameters, function (parameter, key) {
      counts.parameters--;
      assertEqual(parameter.name, parameter.type + parameter.inout, parameter.name +' Parameter type ' + key);
    });
    assert(counts.parameters == 0, 'Found all '+ total + ' parameters');
  }

  verifyTypes('uniforms');
  verifyTypes('varyings');
  verifyTypes('attributes');
  verifyParameters();

  assert(snippet.body.match(/^[\s;]+void main/), 'All parameters separated from body.');

  done();
};