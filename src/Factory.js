(function ($) {

/**
 * Helps build graphs of blocks/nodes with chainable API.
 */
$.Factory = function () {
  this.end();
};

$.Factory.prototype = {

  snippet: function (code) {
    var block = new $.Block.Snippet(code);
    this.append(block.node());

    return this;
  },

  material: function (vertex, fragment) {
    var block = new $.Block.Material(vertex, fragment);
    this.append(block.node());

    return this;
  },

  append: function (node) {
    this.graph.add(node);

    if (this._end) {
      this._end.connect(node);
    }
    if (!this._start) {
      this._start = node;
    }
    this._end = node;

    return this;
  },

  prepend: function (node) {
    this.graph.add(node);

    if (this._start) {
      node.connect(this._start);
    }
    if (!this._end) {
      this._end = node;
    }
    this._start = node;

    return this;
  },

  end: function () {
    var graph = this.graph;

    this.graph = new $.Graph();
    this._start = null;
    this._end = null;

    return graph;
  }//,
};


})(ShaderGraph);
