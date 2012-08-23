(function ($) {
$.Outlets = 0;

$.Outlet = function (inout, name, hint, type, category, exposed, meta) {

  // Object constructor syntax
  if (typeof inout == 'object') {
    var object = inout;
    return new $.Outlet(object.inout, object.name, object.hint, object.type, object.category, object.exposed);
  }

  this.node     = null;
  this.inout    = inout;
  this.name     = name;
  this.hint     = hint || name;
  this.type     = type;
  this.category = category;
  this.exposed  = !!exposed;
  this.meta     = meta || {};
  this.index    = ++$.Outlets;

  this.in = null;
  this.out = [];
};

$.Outlet.prototype = {
  // Unique ID for this outlet.
  id: function () {
    return ['', this.name, this.index].join('__');
  },

  // Set exposed flag
  expose: function (exposed) {
    this.exposed = exposed;
  },

  // Change into given outlet without touching connections.
  morph: function (outlet) {
    this.inout    = outlet.inout;
    this.name     = outlet.name;
    this.type     = outlet.type;
    this.category = outlet.category;
    this.exposed  = outlet.exposed;
    this.meta     = outlet.meta || {};
  },

  // Connect to given outlet.
  connect: function (outlet) {
    // Connect input from the other side.
    if (this.inout == $.IN && outlet.inout == $.OUT) {
      return outlet.connect(this);
    }

    // Disallow bad combinations.
    if (this.inout != $.OUT || outlet.inout != $.IN) {
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
    if (this.inout == $.IN) {
      // Disconnect input from the other side.
      if (this.in) {
        this.in.disconnect(this);
      }
    }
    else {
      if (outlet) {
        // Remove one outgoing connection.
        var index = this.out.indexOf(outlet);
        if (index >= 0) {
          this.out.splice(index, 1);
          outlet.in = null
        }
      }
      else {
        // Remove all outgoing connections.
        _.each(this.out, function (outlet) {
          outlet.in = null
        });
        this.out = [];
      }
    }
  },

  // Link to given node.
  link: function (node) {
    this.node = node;
  }//,
};

})(ShaderGraph);