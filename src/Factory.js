(function ($) {

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
