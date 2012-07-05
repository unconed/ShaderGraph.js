(function ($) {

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

})(GLFrame.ShaderGraph);