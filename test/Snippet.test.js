Test.Tests.Snippet = function (assert, done) {

  var code = [
'  // Comment ',
'  uniform float uf;',
'  uniform float ufv1[3];',
'  uniform vec2 uv2;',
'  // Comment ',
'  uniform vec2 uv2v[3];',
'  uniform vec3 uv3;',
'  uniform vec3 uv3v[3];',
'  uniform vec4 uv4;',
'  uniform /*',
'   Comment ',
'  */vec4 uv4v[3];',
'  uniform sampler2D ut;',
'  uniform sampler2D utv[3];',
'  varying float vf;',
'  varying float vfv1[3];',
'  varying mat3 vm3;',
'  varying mat3 vm3v[3];',
'  varying mat4 vm4;',
'  varying mat4 vm4v[3];',
'  attribute float af;',
'  attribute float afv1[3];',
'  attribute vec3 av3;',
'  attribute vec3 av3v[3];',
'  attribute mat4 am4;',
'  attribute mat4 am4v[3];',
'  void snippetTest(',
'    in vec4 v4in, mat3 m3vin[3],',
'    out vec4 v4out, out vec4 v4vout[3], out mat4 m4out, out mat4 m4vout[3],',
'    inout vec3 v3inout) {',
'       gl_FragColor = v4in.xyz;',
'  }'].join("\n");

  var snippet = new ShaderGraph.Snippet(code);

  var counts = {
    uniforms: 10,
    varyings: 6,
    attributes: 6,
    parameters: 7,
  };

  function verifyTypes(category) {
    var total = counts[category],
        prefix = category.substring(0, 1);
    _.each(snippet[category], function (parameter, key) {
      counts[category]--;
      assert(parameter.name == (prefix + parameter.type), category + ' type ' + parameter.name);
    });
    assert(counts[category] == 0, 'Found all '+ total + ' ' + category);
  }

  function verifyParameters() {
    var total = counts.parameters;
    var inouts = [ 'in', 'out', 'inout' ];
    _.each(snippet.parameters, function (parameter, key) {
      counts.parameters--;
      assert(parameter.name == parameter.type + inouts[parameter.inout], ' Parameter type ' + parameter.name);
    });
    assert(counts.parameters == 0, 'Found all '+ total + ' parameters');
  }

  verifyTypes('uniforms');
  verifyTypes('varyings');
  verifyTypes('attributes');
  verifyParameters();

  assert(snippet.body.match(/^\s*void snippetTest/), 'All parameters separated from body.');

  var call = snippet.compile('snippetRename', ['uf', 'ufv1']);
  assert(call.match(/void\s*snippetRename\s*\(/), 'Function renamed');
  assert(call.match(/gl_FragColor\s*=\s*v4in.xyz\s*;/), 'Shader body preserved');
  assert(!call.match(/uniform\s*float\s*uf\s*;/), 'Float uniform removed');
  assert(!call.match(/uniform\s*float\s*ufv1\[3\]\s*;/), 'Float array uniform removed');
  assert(!call.match(/,\s*(in?)\s*float\s*uf/), 'Float argument added');
  assert(!call.match(/,\s*(in?)\s*float\s*ufv1\[3\]/), 'Float array argument added');

  var call = snippet.compile('snippetRename', ['uf', 'ufv1'], true);
  assert(call.match(/gl_FragColor\s*=\s*v4in.xyz\s*;/), 'Shader body preserved (body only)');
  assert(!call.match(/uniform/), 'All uniforms removed');
  assert(!call.match(/attribute/), 'All attributes removed');
  assert(!call.match(/varying/), 'All varyings removed');

  done();
};