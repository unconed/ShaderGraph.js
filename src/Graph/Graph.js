(function ($) {

/**
 * Graph of shader nodes.
 */
$.Graph = function (nodes, parent) {
  this.parent = parent || null;
  this.nodes = [];
  nodes && this.add(nodes);
};

$.Graph.prototype = {

  iterate: function (callback) {
    _.each(this.nodes, function (node) {
      callback(node, node._delegate);
    });
  },

  exposed: function () {
    var exposed = [];
    this.iterate(function (node) {
      _.each(node.outlets(), function (outlet) {
        if (outlet.exposed) {
          exposed.push(outlet);
        }
      });
    });
    return exposed;
  },

  inputs: function () {
    var inputs = [];
    this.iterate(function (node) {
      _.each(node.in, function (outlet) {
        if (outlet.in == null) {
          inputs.push(outlet);
        }
      });
    });
    return inputs;
  },

  outputs: function () {
    var outputs = [];
    this.iterate(function (node) {
      _.each(node.out, function (outlet) {
        if (outlet.out.length == 0) {
          outputs.push(outlet);
        }
      });
    });
    return outputs;
  },

  add: function (node) {

    // Array syntax.
    if (node.constructor == Array) return _.each(node, function (node) { this.add(node); }.bind(this));

    // Sanity check.
    if (node.graph) throw "Adding node to two graphs at once";

    // Link node to graph.
    node.link(this);

    // Add node to list
    this.nodes.push(node);
  },

  remove: function (node, ignore) {
    // Array syntax.
    var that = this;
    if (node.constructor == Array) return _.each(node, function (node) { that.remove(node); });

    // Sanity check.
    if (node.graph != this) throw "Removing node from wrong graph.";

    // Disconnect all outlets
    ignore || node.disconnect();

    // Remove node from list.
    this.nodes.splice(this.nodes.indexOf(node), 1);
  },
};

$.IN = 0;
$.OUT = 1;
$.INOUT = 2;

})(ShaderGraph);
