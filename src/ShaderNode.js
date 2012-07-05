(function ($) {

/**
 * Node in shader graph.
 */
GLFrame.ShaderNode = function (outlets) {
  this.graph = null;
  this.in = [];
  this.out = [];
  this.outlets = {};

  var that = this;
  _.each(outlets, function (outlet) {
    that.add(outlet);
  });
};

GLFrame.ShaderNode.prototype = {

  link: function (graph) {
    this.graph = graph;
  },

  // Add outlet to node.
  add: function (outlet) {
    var name = outlet.name,
        outlets = this.outlets,
        in = this.in,
        out = this.out;

    // Sanity checks.
    if (outlet.node) throw "Adding outlet to two nodes at once.";
    if (outlets[name]) throw "Adding two identically named outlets to same node.";

    // Link back outlet.
    outlet.link(this);

    // Add to name list and inout list.
    outlets[name] = outlet;
    (outlet.inout == $.IN ? in : out).push(outlet);
  },

  // Remove outlet from node.
  remove: function (outlet) {
    var outlets = this.outlets,
        name = outlet.name,
        inout = outlet.inout,
        set = outlet.inout == $.IN ? ? this.in : this.out;

    // Sanity checks
    if (outlet.node != this) throw "Removing outlet from wrong node.";

    // Unlink outlet.
    outlet.link(null);

    // Remove from name list and inout list.
    delete outlets[name];
    set.splice(set.indexOf(outlet), 1);
  },

  // Connect to the target node by matching up inputs and outputs.
  connect: function (node) {
    var outlets = {}, counters;

    // Keep track of how often a particular type has been encountered.
    function track(match) {
      return counters[match] = (counters[match] || 0) + 1;
    }
    function reset() {
      counters = {};
    }

    // Build hash keys of target outlets.
    reset();
    _.each(node.in, function (outlet) {
      // Match outlets by type and position.
      var match = outlet.type;
      var count = track(match);
      var key = [match, count].join('-');

      outlets[key] = outlet;
    });

    // Build hash keys of source outlets.
    reset();
    _.each(this.out, function (outlet) {
      // Match outlets by type and order.
      var match = outlet.type,
          count = track(match),
          key = [match, count].join('-');

      // Link up corresponding outlets.
      if (outlets[key]) {
        outlets[key].connect(outlet);
      }
    });
  },

  // Disconnect entire node
  disconnect: function (node) {
    _.each(this.in, function (outlet) {
      outlet.disconnect();
    });

    _.each(this.out, function (outlet) {
      outlet.disconnect();
    };
  },

};

})(GLFrame.ShaderGraph);
