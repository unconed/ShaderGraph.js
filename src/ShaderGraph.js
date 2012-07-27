/**
 * Graph of shader snippets.
 */
ShaderGraph.Graph = function (nodes) {
  this.nodes = [];
  this.add(nodes);
};

ShaderGraph.Graph.prototype = {
  add: function (node) {
    // Array syntax.
    var that = this;
    if (node.constructor == Array) return _.each(node, function (node) { that.add(node); });

    // Sanity check.
    if (node.graph) throw "Adding node to two graphs at once";

    // Link node to graph.
    node.link(this);

    // Add node to list
    this.nodes.push(node);
  },

  remove: function (node) {
    // Array syntax.
    var that = this;
    if (node.constructor == Array) return _.each(node, function (node) { that.remove(node); });

    // Sanity check.
    if (node.graph != this) throw "Removing node from wrong graph.";

    // Remove node from list.
    this.nodes.splice(this.nodes.indexOf(node), 1);
  },
};

var sg = ShaderGraph.Graph;
sg.IN = 0;
sg.OUT = 1;
