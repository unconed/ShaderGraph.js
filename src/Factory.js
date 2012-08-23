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
    this.graph.add(node);

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
    this.stack.unshift({ start: [], end: [] });

    return this;
  },

  next: function () {
    this.combine().group();

    return this;
  },

  combine: function () {
    if (this.stack.length <= 1) throw "Popping factory stack too far.";

    var sub = this.stack.shift();
    var main = this.stack[0];

    main.start = main.start.concat(sub.start);
    main.end   = main.end.concat(sub.end);
  },

  end: function () {
    var graph = this.graph;

    this.graph = new $.Graph();
    this.stack = [];
    this.group();

    return graph;
  }//,
};


})(ShaderGraph);
