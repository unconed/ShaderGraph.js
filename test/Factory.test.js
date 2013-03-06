Test.Tests.Factory = function (assert, done) {
  function findAll(re, string) {
    if (!re.global) throw "Can't findAll non-global regexp";
    var match, all = [];
    while (match = re.exec(string)) {
      all.push(match);
    };
    return all;
  }

  var vertex1 = [
    '// Provide varying UV coordinates',
    'attribute float magic;',
    'varying vec2 vUV;',
    'void main() {',
    '  vUV = uv;',
    '}',
  ].join("\n");

  var vertex3 = [
    '// Project position into view',
    'void main() {',
    '  gl_Position = projectionMatrix *',
    '                modelViewMatrix *',
    '                vec4(position, 1.0);',
    '}',
  ].join("\n");

  var fragment1 = [
    '// Read from texture',
    'uniform sampler2D texture;',
    'varying vec2 vUV;',
    'void main(out vec3 color) {',
    '  color = texture2D(texture, vUV);',
    '}',
  ].join("\n");

  var fragment2 = [
    '// Fade out color',
    'uniform vec3 colorIn;',
    'void main(out vec3 colorOut) {',
    '  colorOut = colorIn - vec3(1.0/255.0, 1.0/255.0, 1.0/255.0);',
    '}',
  ].join("\n");

  var fragment3 = [
    '// Output color',
    'uniform vec3 color;',
    'void main() {',
    '  gl_FragColor = color;',
    '}',
  ].join("\n");


  var fragment4 = [
    '// Pass through inout',
    'void main(inout vec3 color) {',
    '}',
  ].join("\n");

  var concatSplit = [
    '// Split',
    'void main(out vec3 positionA, out vec3 positionB) {',
    '  positionA = position;',
    '  positionB = position;',
    '}',
  ].join("\n");

  var concatDummy = [
    '// Split',
    'void main(in vec3 positionIn, out vec3 positionOut) {',
    '  positionOut = positionIn;',
    '}',
  ].join("\n");

  var concatJoin = [
    '// Join',
    'void main(in vec3 positionA, in vec3 positionB) {',
    '}',
  ].join("\n");

  var orderSplit = [
    '// Split',
    'void main(out vec3 positionOut, out vec3 positionDUOut, out vec3 positionDVOut) { }',
  ].join("\n");

  var orderJoin = [
    '// Join',
    'void projectToView(in vec3 positionIn, in vec3 positionDUIn, in vec3 positionDVIn, out vec4 positionOut, out vec3 viewPositionOut) { }',
  ].join("\n");

  // Test static creation methods
  var node1 = new ShaderGraph.Block.Snippet(fragment1).node();
  var node2 = new ShaderGraph.Block.Snippet(fragment2).node();
  var node3 = new ShaderGraph.Block.Snippet(fragment3).node();

  assert(node1 instanceof ShaderGraph.Node, 'Node 1 created from snippet code');
  assert(node2 instanceof ShaderGraph.Node, 'Node 2 created from snippet code');
  assert(node3 instanceof ShaderGraph.Node, 'Node 3 created from snippet code');

  assert(node1.inputs.length == 1, 'Node 1 has one input');
  assert(node2.inputs.length == 1, 'Node 2 has one input');
  assert(node3.inputs.length == 1, 'Node 3 has one input');

  assert(node1.outputs.length == 1, 'Node 1 has one output');
  assert(node2.outputs.length == 1, 'Node 2 has one output');
  assert(node3.outputs.length == 0, 'Node 3 has no outputs');

  // Test chainable creation methods
  // frag1 -> frag2 --> frag3/vertex2
  //        vertex1 -/
  var factory = new ShaderGraph.Factory();
  var graph = factory
    .material(vertex1, fragment1)
    .snippet(fragment2)
    .material(vertex3, fragment3).end();
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

  // Compile material from final node
  var program = graph.compile();
  var main, matches;
  assert(program.uniforms, "Compiled uniforms");
  assert(program.vertexShader != '', "Compiled vertexShader");
  assert(program.fragmentShader != '', "Compiled fragmentShader");

  // Test uniforms
  assert(program.uniforms, "Uniforms exported");
  assert(program.uniforms.texture, "Texture uniform exported");
  assert(!program.uniforms.color, "Color uniform removed");
  assert(!program.uniforms.colorIn, "ColorIn uniform removed");

  // Test attributes
  assert(program.attributes, "Attributes exported");
  assert(program.attributes.magic, "Magic attribute exported");

  // Test vertex shader
  main = program.vertexShader.split(/void\s+main\(\s*\)/)[1];
  if (main) matches = findAll(/[_A-Za-z0-9]+\s*\([^\)]*\)\s*;/g, main);
  assert(program.vertexShader.match(/varying\s+vec2\s+vUV\s*;/), "Vertex has vUV varying");
  assert(program.vertexShader.match(/vUV\s*=\s*uv\s*;/), "Vertex assigns vUV varying");
  assert(program.vertexShader.match(/gl_Position\s*=\s*/), "Vertex assigns gl_Position register");
  assert(main, "Vertex has main() function");
  assert(matches && matches.length == 2, "Vertex main has 2 calls");

  // Test fragment shader
  main = program.fragmentShader.split(/void\s+main\(\s*\)/)[1];
  if (main) matches = findAll(/[_A-Za-z0-9]+\s*\([^\)]*\)\s*;/g, main);
  assert(program.fragmentShader.match(/varying\s+vec2\s+vUV\s*;/), "Fragment has vUV varying");
  assert(program.fragmentShader.match(/uniform\s*sampler2D\s*texture\s*;/), "Fragment has texture uniform");
  assert(program.fragmentShader.match(/gl_FragColor\s*=\s*/), "Fragment assigns gl_FragColor register");
  assert(main, "Fragment has main() function");
  assert(matches && matches.length == 3, "Fragment main has 3 calls");


  // Test concat creation methods
  // split -> pass -> join
  //       \- pass -/
  var factory = new ShaderGraph.Factory();
  var graph = factory
    .snippet(concatSplit)
    .group()
      .snippet(concatDummy)
    .next()
      .snippet(concatDummy)
    .combine()
    .snippet(concatJoin)
    .end();
  assert(graph.nodes.length == 4, 'Split/join creation of 4 nodes');
  assert(graph.inputs().length == 0, 'Graph has no open inputs');
  assert(graph.outputs().length == 0, 'Graph has no open outputs');
  assert(graph.nodes[0].getOut('positionA').output[0].node !== graph.nodes[0].getOut('positionB').output[0].node, 'Split node connects to two different nodes');


  // Test order preservation of parallel linking
  var factory = new ShaderGraph.Factory();
  var graph = factory
    .snippet(orderSplit)
    .group()
      .snippet(concatDummy)
    .next()
      .snippet(concatDummy)
    .next()
      .snippet(concatDummy)
    .combine()
    .snippet(orderJoin)
    .end();

  assert(graph.nodes.length == 5, 'Split/join creation of 5 nodes');
  assert(graph.inputs().length == 0, 'Graph has no open inputs');
  assert(graph.outputs().length == 2, 'Graph has two open outputs');
  assert(graph.tail().inputs[0].input.node.inputs[0].input.name == 'positionOut', 'positionOut is first');
  assert(graph.tail().inputs[1].input.node.inputs[0].input.name == 'positionDUOut', 'positionDUOut is second');
  assert(graph.tail().inputs[2].input.node.inputs[0].input.name == 'positionDVOut', 'positionDVOut is third');

  // Test concat creation methods w/ passthrough
  // split -> pass -> join
  //       \- ---- -/
  factory = new ShaderGraph.Factory();
  graph = factory
    .snippet(concatSplit)
    .group()
      .snippet(concatDummy)
    .pass()
    .snippet(concatJoin)
    .end();

  assert(graph.nodes.length == 3, 'Split/join creation of 3 nodes w/ 1 passthrough');
  assert(graph.inputs().length == 0, 'Graph has no open inputs');
  assert(graph.outputs().length == 0, 'Graph has no open outputs');
  assert(graph.nodes[0].getOut('positionA').output[0].node !== graph.nodes[0].getOut('positionB').output[0].node, 'Split node connects to two different nodes');

  // Test inouts
  factory = new ShaderGraph.Factory();
  graph = factory
    .material(vertex1, fragment1)
    .snippet(fragment4)
    .snippet(fragment4)
    .snippet(fragment4)
    .material(vertex3, fragment3).end();
  assert(graph.nodes.length == 5, 'Chainable creation of 5 nodes');

  program = graph.compile();
  assert(program.fragmentShader.match(
    /_sg_fragment_main_[0-9]+\(([^)]+)\);\s*(_sg_fragment_main_[0-9]+\(\1\);\s*){4}/g),
    'Inout argument chain re-uses the same single variable.');


    /*
    program = graph.compile();
    console.log(program.uniforms);
    console.log(program.attributes);
    console.log(program.vertexShader);
    console.log(program.fragmentShader);
    //*/


  done();
};