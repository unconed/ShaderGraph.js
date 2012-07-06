/**
 * Graph of shader snippets.
 */
GLFrame.ShaderGraph = function (nodes) {
  this.nodes = [];
  this.add(nodes);
};

GLFrame.ShaderGraph.prototype = {
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

var sg = GLFrame.ShaderGraph;
sg.IN = 0;
sg.OUT = 1;

/**
 * Node in shader graph.
 */
GLFrame.ShaderNode = function (delegate) {
  this.graph = null;
  this.in = [];
  this.out = [];
  this.outlets = {};

  this.delegate = delegate;
};

GLFrame.ShaderNode.prototype = {

  link: function (graph) {
    this.graph = graph;
  },

  // Add outlet to node.
  add: function (outlet) {
    // Array syntax.
    var that = this;
    if (outlet.constructor == Array) return _.each(outlet, function (outlet) { that.add(outlet); });

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
    (outlet.inout == sg.IN ? in : out).push(outlet);
  },

  // Remove outlet from node.
  remove: function (outlet) {
    // Array syntax.
    var that = this;
    if (outlet.constructor == Array) return _.each(outlet, function (outlet) { that.remove(outlet); });

    var outlets = this.outlets,
        name = outlet.name,
        inout = outlet.inout,
        set = outlet.inout == sg.IN ? ? this.in : this.out;

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


GLFrame.ShaderOutlet = function (inout, name, type, category) {
  this.node     = null;
  this.inout    = inout;
  this.name     = name;
  this.type     = type;
  this.category = category;

  this.in = null;
  this.out = [];
};

GLFrame.ShaderOutlet.prototype = {
  // Connect to given outlet.
  connect: function (outlet) {
    // Auto-reverse backwards call.
    if (this.inout == sg.IN && outlet.inout == sg.OUT) {
      return outlet.connect(this);
    }

    // Disallow bad combinations.
    if (this.inout != sg.OUT || outlet.inout != sg.IN) {
      throw "Can't connect out/out or in/in outlets.";
    }

    // Check for existing connection.
    if (outlet.in == this) return;

    // Disconnect existing connections.
    outlet.disconnect();

    // Add new connection.
    outlet.in = this;
    this.out.push(outlet);
  },

  // Disconnect given outlet (or all).
  disconnect: function (outlet) {
    if (this.inout == sg.IN) {
      // Disconnect input.
      if (this.in) {
        this.in.disconnect(this);
        this.in = null;
      }
    }
    else {
      if (outlet) {
        // Remove one outgoing connection.
        if (this.out && outlet.in == this) {
          this.out.splice(this.out.indexOf(outlet), 1);
          outlet.disconnect();
        }
      }
      else {
        // Remove all outgoing connections.
        _.each(this.out, function (outlet) {
          outlet.disconnect();
        });
        this.out = [];
      }
    }
  }

  link: function (node) {
    this.node = node;
  },
};