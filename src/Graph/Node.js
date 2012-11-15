(function ($) {

/**
 * Node in shader graph.
 */
$.Node = function (owner, outlets) {
  this.graph = null;
  this.inputs = [];
  this.outputs = [];
  this._outlets = {};

  this.owner(owner);
  this.outlets(outlets);
};

$.Node.prototype = {

  // Set/get object represented by the node.
  owner: function (owner) {
    if (owner !== undefined) {
      // Setter
      this._owner = owner;

      // Chain
      return this;
    }
    // Getter
    return this._owner;
  },

  // Notify: become part of the given graph
  link: function (graph) {
    this.graph = graph;
  },

  // Retrieve input
  getIn: function (name) {
    return this.get(name, $.IN);
  },

  // Retrieve output
  getOut: function (name) {
    return this.get(name, $.OUT);
  },

  // Find outlet by name.
  get: function (name, inout) {
    if (inout === undefined) {
      return this.get(name, $.IN) || this.get(name, $.OUT);
    }
    return this._outlets[[name, inout].join('-')];
  },

  // Return hash key for outlet
  key: function (outlet) {
    return [outlet.name, outlet.inout].join('-');
  },

  // Set new outlet definition
  outlets: function (outlets) {
    if (outlets !== undefined) {
      // Return new/old outlet matching hash key
      function hash(outlet) {
        // Match by name, direction and type.
        return [outlet.name, outlet.inout, outlet.type].join('-');
      };

      // Build hash of new outlets
      var keys = {};
      _.each(outlets, function (outlet) {
        keys[hash(outlet)] = true;
      }.bind(this));

      // Remove missing outlets
      _.each(this._outlets, function (outlet) {
        if (!keys[hash(outlet)]) this.remove(outlet);
      }.bind(this));

      // Insert new outlets.
      _.each(outlets, function (outlet) {
        // Find match by type/name/direction
        var existing = this.get(outlet.name, outlet.inout);
        if (!existing) {
          // Spawn new outlet
          outlet = new $.Outlet(outlet);
          this.add(outlet);
        }
        else {
          // Update existing outlets in place to retain connections.
          existing.morph(outlet);
        }
      }.bind(this));

      // Chain
      return this;
    }
    return this._outlets;
  },

  // Add outlet object to node.
  add: function (outlet) {
    var key = this.key(outlet);
        outlets = this._outlets,
        _in = this.inputs,
        _out = this.outputs;

    // Sanity checks.
    if (outlet.node) throw "Adding outlet to two nodes at once.";
    if (outlets[key]) throw "Adding two identical outlets to same node.";

    // Link back outlet.
    outlet.link(this);

    // Add to name list and inout list.
    outlets[key] = outlet;
    (outlet.inout == $.IN ? _in : _out).push(outlet);

    // Chain
    return this;
  },

  // Remove outlet object from node.
  remove: function (outlet) {
    var outlets = this._outlets,
        key = this.key(outlet),
        inout = outlet.inout,
        set = outlet.inout == $.IN ? this.inputs : this.outputs;

    // Sanity checks
    if (outlet.node != this) throw "Removing outlet from wrong node.";

    // Disconnect outlet.
    outlet.disconnect();

    // Unlink outlet.
    outlet.link(null);

    // Remove from name list and inout list.
    delete outlets[key];
    set.splice(set.indexOf(outlet), 1);

    // Chain
    return this;
  },

  // Connect to the target node by matching up inputs and outputs.
  connect: function (node, empty, force) {
    var outlets = {},
        hints = {},
        counters;

    // Keep track of how often a particular type has been encountered.
    function track(match) {
      return counters[match] = (counters[match] || 0) + 1;
    }
    function reset() {
      counters = {};
    }

    // Build hash keys of target outlets.
    reset();
    _.each(node.inputs, function (outlet) {
      // Only autoconnect if not already connected.
      if (!force && outlet.input) {
        return;
      }

      // Match outlets by type/name hint, then type/position key.
      var type = outlet.type,
          hint = [type, outlet.hint].join('-');

      if (!hints[hint]) hints[hint] = outlet;
      outlets[type] = outlets[type] || [];
      outlets[type].push(outlet);
    });

    // Build hash keys of source outlets.
    reset();
    _.each(this.outputs, function (outlet) {
      // Ignore this outlet if only matching empties.
      if (empty && outlet.output.length) return;

      // Match outlets by type and name.
      var type = outlet.type,
          hint = [type, outlet.hint].join('-');

      // Connect if found.
      if (hints[hint]) {
        hints[hint].connect(outlet);

        delete hints[hint];
        outlets[type].splice(outlets[type].indexOf(outlet), 1);
        return;
      }

      // Match outlets by type and order.
      // Link up corresponding outlets.
      if (outlets[type] && outlets[type].length) {
        outlets[type].shift().connect(outlet);
      }
    });

    // Chain
    return this;
  },

  // Disconnect entire node
  disconnect: function (node) {
    _.each(this.inputs, function (outlet) {
      outlet.disconnect();
    });

    _.each(this.outputs, function (outlet) {
      outlet.disconnect();
    });

    // Chain
    return this;
  }//,

};

})(ShaderGraph);
