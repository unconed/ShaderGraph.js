(function ($) {

/**
 * Building block for effects, wraps a shader node.
 */
$.Block = function (node) {
  node = node || new $.Node();
  this.node(node);

  this.children = [];
  this.parent = null;

  this.refresh();
};

$.Block.prototype = {

  node: function (node) {
    if (node !== undefined) {
      this._node = node;
      return this;
    }
    return this._node;
  },

  refresh: function () {
    this._node.delegate(this);
    this._node.outlets(this.outlets());
  },

  //,
};

$.Block.makeOutlets = function (args) {
  var outlets = [];

  _.each(args.parameters, function (arg) {
    arg.meta = { parameter: arg.name };
    arg.name = arg.name.replace(/(In|Out)$/, '');
    arg.category = 'parameter';
    arg.inout = (arg.inout == 'out') ? $.OUT : $.IN; // inout not supported for now
    outlets.push(arg);
  });

  _.each(args.uniforms, function (arg) {
    arg.meta = { parameter: arg.name };
    arg.name = arg.name.replace(/(In|Out)$/, '');
    arg.category = 'uniform';
    arg.inout = $.IN;
    outlets.push(arg);
  });

  return outlets;
}

/**
 * Building block for a GLSL shader
 */
$.Block.Snippet = function (code) {
  this.snippet = new $.Snippet(code);

  $.Block.call(this);
};

$.Block.Snippet.prototype = _.extend({}, $.Block.prototype, {

  outlets: function () {
    return $.Block.makeOutlets(this.snippet.arguments());
  }//,

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

  outlets: function () {
    var vertex   = $.Block.makeOutlets(this.vertex.arguments());
    var fragment = $.Block.makeOutlets(this.fragment.arguments());

    return _.union(vertex, fragment);
  }//,

});

})(ShaderGraph);