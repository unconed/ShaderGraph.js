Test.Tests.Factory = function (done) {

  var code1 = [
    '// Read from texture',
    'uniform sampler2D texture;',
    'varying vec2 vUV;',
    'void main(out vec3 color) {',
    '  color = texture2D(texture, vUV);',
    '}',
  ].join("\n");

  var code2 = [
    '// Fade out color',
    'uniform vec3 colorIn;',
    'void main(out vec3 colorOut) {',
    '  colorOut = colorIn - vec3(1.0/255.0, 1.0/255.0, 1.0/255.0);',
    '}',
  ].join("\n");

  var vertex = [
    '// Project position into view',
    'void main() {',
    '  gl_Position = projectionMatrix *',
    '                modelViewMatrix *',
    '                vec4(position, 1.0);',
    '}',
  ].join("\n");

  var fragment = [
    '// Output color',
    'uniform vec3 color;',
    'void main() {',
    '  gl_FragColor = color;',
    '}',
  ].join("\n");

  // Test static creation methods
  var node1 = new ShaderGraph.Block.Snippet(code1).node();
  var node2 = new ShaderGraph.Block.Snippet(code2).node();
  var node3 = new ShaderGraph.Block.Snippet(fragment).node();

  assert(node1 instanceof ShaderGraph.Node, 'Node 1 created from snippet code');
  assert(node2 instanceof ShaderGraph.Node, 'Node 2 created from snippet code');
  assert(node3 instanceof ShaderGraph.Node, 'Node 3 created from snippet code');

  assert(node1.in.length == 1, 'Node 1 has one input');
  assert(node2.in.length == 1, 'Node 2 has one input');
  assert(node3.in.length == 1, 'Node 3 has one input');

  assert(node1.out.length == 1, 'Node 1 has one output');
  assert(node2.out.length == 1, 'Node 2 has one output');
  assert(node3.out.length == 0, 'Node 3 has no outputs');

  // Test chainable creation methods
  var factory = new ShaderGraph.Factory();
  var graph = factory.snippet(code1).snippet(code2).material(vertex, fragment).end();
  assert(graph.nodes.length == 3, 'Chainable creation of 3 nodes');

  // Check graph inputs
  var inputs = graph.inputs();
  assert(inputs.length == 1, 'Graph has 1 input');
  assert(inputs[0].name == 'texture' &&
         inputs[0].type == 't' &&
         inputs[0].category == 'uniform', 'Input is texture uniform');

  // Check graph outputs
  var outputs = graph.outputs();
  assert(outputs.length == 0, 'Graph has 0 outputs');

  // Compile material from node3
  var end = graph.nodes[2];
  var material = end.delegate();

  material.compile();

  done();
};