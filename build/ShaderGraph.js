// Underscore.js 1.3.3
// (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
// Underscore is freely distributable under the MIT license.
// Portions of Underscore are inspired or borrowed from Prototype,
// Oliver Steele's Functional, and John Resig's Micro-Templating.
// For all details and documentation:
// http://documentcloud.github.com/underscore
(function(){function r(a,c,d){if(a===c)return 0!==a||1/a==1/c;if(null==a||null==c)return a===c;a._chain&&(a=a._wrapped);c._chain&&(c=c._wrapped);if(a.isEqual&&b.isFunction(a.isEqual))return a.isEqual(c);if(c.isEqual&&b.isFunction(c.isEqual))return c.isEqual(a);var e=l.call(a);if(e!=l.call(c))return!1;switch(e){case "[object String]":return a==""+c;case "[object Number]":return a!=+a?c!=+c:0==a?1/a==1/c:a==+c;case "[object Date]":case "[object Boolean]":return+a==+c;case "[object RegExp]":return a.source==
c.source&&a.global==c.global&&a.multiline==c.multiline&&a.ignoreCase==c.ignoreCase}if("object"!=typeof a||"object"!=typeof c)return!1;for(var f=d.length;f--;)if(d[f]==a)return!0;d.push(a);var f=0,g=!0;if("[object Array]"==e){if(f=a.length,g=f==c.length)for(;f--&&(g=f in a==f in c&&r(a[f],c[f],d)););}else{if("constructor"in a!="constructor"in c||a.constructor!=c.constructor)return!1;for(var h in a)if(b.has(a,h)&&(f++,!(g=b.has(c,h)&&r(a[h],c[h],d))))break;if(g){for(h in c)if(b.has(c,h)&&!f--)break;
g=!f}}d.pop();return g}var s=this,I=s._,o={},k=Array.prototype,p=Object.prototype,i=k.slice,J=k.unshift,l=p.toString,K=p.hasOwnProperty,y=k.forEach,z=k.map,A=k.reduce,B=k.reduceRight,C=k.filter,D=k.every,E=k.some,q=k.indexOf,F=k.lastIndexOf,p=Array.isArray,L=Object.keys,t=Function.prototype.bind,b=function(a){return new m(a)};"undefined"!==typeof exports?("undefined"!==typeof module&&module.exports&&(exports=module.exports=b),exports._=b):s._=b;b.VERSION="1.3.3";var j=b.each=b.forEach=function(a,
c,d){if(a!=null)if(y&&a.forEach===y)a.forEach(c,d);else if(a.length===+a.length)for(var e=0,f=a.length;e<f;e++){if(e in a&&c.call(d,a[e],e,a)===o)break}else for(e in a)if(b.has(a,e)&&c.call(d,a[e],e,a)===o)break};b.map=b.collect=function(a,c,b){var e=[];if(a==null)return e;if(z&&a.map===z)return a.map(c,b);j(a,function(a,g,h){e[e.length]=c.call(b,a,g,h)});if(a.length===+a.length)e.length=a.length;return e};b.reduce=b.foldl=b.inject=function(a,c,d,e){var f=arguments.length>2;a==null&&(a=[]);if(A&&
a.reduce===A){e&&(c=b.bind(c,e));return f?a.reduce(c,d):a.reduce(c)}j(a,function(a,b,i){if(f)d=c.call(e,d,a,b,i);else{d=a;f=true}});if(!f)throw new TypeError("Reduce of empty array with no initial value");return d};b.reduceRight=b.foldr=function(a,c,d,e){var f=arguments.length>2;a==null&&(a=[]);if(B&&a.reduceRight===B){e&&(c=b.bind(c,e));return f?a.reduceRight(c,d):a.reduceRight(c)}var g=b.toArray(a).reverse();e&&!f&&(c=b.bind(c,e));return f?b.reduce(g,c,d,e):b.reduce(g,c)};b.find=b.detect=function(a,
c,b){var e;G(a,function(a,g,h){if(c.call(b,a,g,h)){e=a;return true}});return e};b.filter=b.select=function(a,c,b){var e=[];if(a==null)return e;if(C&&a.filter===C)return a.filter(c,b);j(a,function(a,g,h){c.call(b,a,g,h)&&(e[e.length]=a)});return e};b.reject=function(a,c,b){var e=[];if(a==null)return e;j(a,function(a,g,h){c.call(b,a,g,h)||(e[e.length]=a)});return e};b.every=b.all=function(a,c,b){var e=true;if(a==null)return e;if(D&&a.every===D)return a.every(c,b);j(a,function(a,g,h){if(!(e=e&&c.call(b,
a,g,h)))return o});return!!e};var G=b.some=b.any=function(a,c,d){c||(c=b.identity);var e=false;if(a==null)return e;if(E&&a.some===E)return a.some(c,d);j(a,function(a,b,h){if(e||(e=c.call(d,a,b,h)))return o});return!!e};b.include=b.contains=function(a,c){var b=false;if(a==null)return b;if(q&&a.indexOf===q)return a.indexOf(c)!=-1;return b=G(a,function(a){return a===c})};b.invoke=function(a,c){var d=i.call(arguments,2);return b.map(a,function(a){return(b.isFunction(c)?c||a:a[c]).apply(a,d)})};b.pluck=
function(a,c){return b.map(a,function(a){return a[c]})};b.max=function(a,c,d){if(!c&&b.isArray(a)&&a[0]===+a[0])return Math.max.apply(Math,a);if(!c&&b.isEmpty(a))return-Infinity;var e={computed:-Infinity};j(a,function(a,b,h){b=c?c.call(d,a,b,h):a;b>=e.computed&&(e={value:a,computed:b})});return e.value};b.min=function(a,c,d){if(!c&&b.isArray(a)&&a[0]===+a[0])return Math.min.apply(Math,a);if(!c&&b.isEmpty(a))return Infinity;var e={computed:Infinity};j(a,function(a,b,h){b=c?c.call(d,a,b,h):a;b<e.computed&&
(e={value:a,computed:b})});return e.value};b.shuffle=function(a){var b=[],d;j(a,function(a,f){d=Math.floor(Math.random()*(f+1));b[f]=b[d];b[d]=a});return b};b.sortBy=function(a,c,d){var e=b.isFunction(c)?c:function(a){return a[c]};return b.pluck(b.map(a,function(a,b,c){return{value:a,criteria:e.call(d,a,b,c)}}).sort(function(a,b){var c=a.criteria,d=b.criteria;return c===void 0?1:d===void 0?-1:c<d?-1:c>d?1:0}),"value")};b.groupBy=function(a,c){var d={},e=b.isFunction(c)?c:function(a){return a[c]};
j(a,function(a,b){var c=e(a,b);(d[c]||(d[c]=[])).push(a)});return d};b.sortedIndex=function(a,c,d){d||(d=b.identity);for(var e=0,f=a.length;e<f;){var g=e+f>>1;d(a[g])<d(c)?e=g+1:f=g}return e};b.toArray=function(a){return!a?[]:b.isArray(a)||b.isArguments(a)?i.call(a):a.toArray&&b.isFunction(a.toArray)?a.toArray():b.values(a)};b.size=function(a){return b.isArray(a)?a.length:b.keys(a).length};b.first=b.head=b.take=function(a,b,d){return b!=null&&!d?i.call(a,0,b):a[0]};b.initial=function(a,b,d){return i.call(a,
0,a.length-(b==null||d?1:b))};b.last=function(a,b,d){return b!=null&&!d?i.call(a,Math.max(a.length-b,0)):a[a.length-1]};b.rest=b.tail=function(a,b,d){return i.call(a,b==null||d?1:b)};b.compact=function(a){return b.filter(a,function(a){return!!a})};b.flatten=function(a,c){return b.reduce(a,function(a,e){if(b.isArray(e))return a.concat(c?e:b.flatten(e));a[a.length]=e;return a},[])};b.without=function(a){return b.difference(a,i.call(arguments,1))};b.uniq=b.unique=function(a,c,d){var d=d?b.map(a,d):a,
e=[];a.length<3&&(c=true);b.reduce(d,function(d,g,h){if(c?b.last(d)!==g||!d.length:!b.include(d,g)){d.push(g);e.push(a[h])}return d},[]);return e};b.union=function(){return b.uniq(b.flatten(arguments,true))};b.intersection=b.intersect=function(a){var c=i.call(arguments,1);return b.filter(b.uniq(a),function(a){return b.every(c,function(c){return b.indexOf(c,a)>=0})})};b.difference=function(a){var c=b.flatten(i.call(arguments,1),true);return b.filter(a,function(a){return!b.include(c,a)})};b.zip=function(){for(var a=
i.call(arguments),c=b.max(b.pluck(a,"length")),d=Array(c),e=0;e<c;e++)d[e]=b.pluck(a,""+e);return d};b.indexOf=function(a,c,d){if(a==null)return-1;var e;if(d){d=b.sortedIndex(a,c);return a[d]===c?d:-1}if(q&&a.indexOf===q)return a.indexOf(c);d=0;for(e=a.length;d<e;d++)if(d in a&&a[d]===c)return d;return-1};b.lastIndexOf=function(a,b){if(a==null)return-1;if(F&&a.lastIndexOf===F)return a.lastIndexOf(b);for(var d=a.length;d--;)if(d in a&&a[d]===b)return d;return-1};b.range=function(a,b,d){if(arguments.length<=
1){b=a||0;a=0}for(var d=arguments[2]||1,e=Math.max(Math.ceil((b-a)/d),0),f=0,g=Array(e);f<e;){g[f++]=a;a=a+d}return g};var H=function(){};b.bind=function(a,c){var d,e;if(a.bind===t&&t)return t.apply(a,i.call(arguments,1));if(!b.isFunction(a))throw new TypeError;e=i.call(arguments,2);return d=function(){if(!(this instanceof d))return a.apply(c,e.concat(i.call(arguments)));H.prototype=a.prototype;var b=new H,g=a.apply(b,e.concat(i.call(arguments)));return Object(g)===g?g:b}};b.bindAll=function(a){var c=
i.call(arguments,1);c.length==0&&(c=b.functions(a));j(c,function(c){a[c]=b.bind(a[c],a)});return a};b.memoize=function(a,c){var d={};c||(c=b.identity);return function(){var e=c.apply(this,arguments);return b.has(d,e)?d[e]:d[e]=a.apply(this,arguments)}};b.delay=function(a,b){var d=i.call(arguments,2);return setTimeout(function(){return a.apply(null,d)},b)};b.defer=function(a){return b.delay.apply(b,[a,1].concat(i.call(arguments,1)))};b.throttle=function(a,c){var d,e,f,g,h,i,j=b.debounce(function(){h=
g=false},c);return function(){d=this;e=arguments;f||(f=setTimeout(function(){f=null;h&&a.apply(d,e);j()},c));g?h=true:i=a.apply(d,e);j();g=true;return i}};b.debounce=function(a,b,d){var e;return function(){var f=this,g=arguments;d&&!e&&a.apply(f,g);clearTimeout(e);e=setTimeout(function(){e=null;d||a.apply(f,g)},b)}};b.once=function(a){var b=false,d;return function(){if(b)return d;b=true;return d=a.apply(this,arguments)}};b.wrap=function(a,b){return function(){var d=[a].concat(i.call(arguments,0));
return b.apply(this,d)}};b.compose=function(){var a=arguments;return function(){for(var b=arguments,d=a.length-1;d>=0;d--)b=[a[d].apply(this,b)];return b[0]}};b.after=function(a,b){return a<=0?b():function(){if(--a<1)return b.apply(this,arguments)}};b.keys=L||function(a){if(a!==Object(a))throw new TypeError("Invalid object");var c=[],d;for(d in a)b.has(a,d)&&(c[c.length]=d);return c};b.values=function(a){return b.map(a,b.identity)};b.functions=b.methods=function(a){var c=[],d;for(d in a)b.isFunction(a[d])&&
c.push(d);return c.sort()};b.extend=function(a){j(i.call(arguments,1),function(b){for(var d in b)a[d]=b[d]});return a};b.pick=function(a){var c={};j(b.flatten(i.call(arguments,1)),function(b){b in a&&(c[b]=a[b])});return c};b.defaults=function(a){j(i.call(arguments,1),function(b){for(var d in b)a[d]==null&&(a[d]=b[d])});return a};b.clone=function(a){return!b.isObject(a)?a:b.isArray(a)?a.slice():b.extend({},a)};b.tap=function(a,b){b(a);return a};b.isEqual=function(a,b){return r(a,b,[])};b.isEmpty=
function(a){if(a==null)return true;if(b.isArray(a)||b.isString(a))return a.length===0;for(var c in a)if(b.has(a,c))return false;return true};b.isElement=function(a){return!!(a&&a.nodeType==1)};b.isArray=p||function(a){return l.call(a)=="[object Array]"};b.isObject=function(a){return a===Object(a)};b.isArguments=function(a){return l.call(a)=="[object Arguments]"};b.isArguments(arguments)||(b.isArguments=function(a){return!(!a||!b.has(a,"callee"))});b.isFunction=function(a){return l.call(a)=="[object Function]"};
b.isString=function(a){return l.call(a)=="[object String]"};b.isNumber=function(a){return l.call(a)=="[object Number]"};b.isFinite=function(a){return b.isNumber(a)&&isFinite(a)};b.isNaN=function(a){return a!==a};b.isBoolean=function(a){return a===true||a===false||l.call(a)=="[object Boolean]"};b.isDate=function(a){return l.call(a)=="[object Date]"};b.isRegExp=function(a){return l.call(a)=="[object RegExp]"};b.isNull=function(a){return a===null};b.isUndefined=function(a){return a===void 0};b.has=function(a,
b){return K.call(a,b)};b.noConflict=function(){s._=I;return this};b.identity=function(a){return a};b.times=function(a,b,d){for(var e=0;e<a;e++)b.call(d,e)};b.escape=function(a){return(""+a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")};b.result=function(a,c){if(a==null)return null;var d=a[c];return b.isFunction(d)?d.call(a):d};b.mixin=function(a){j(b.functions(a),function(c){M(c,b[c]=a[c])})};var N=0;b.uniqueId=
function(a){var b=N++;return a?a+b:b};b.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var u=/.^/,n={"\\":"\\","'":"'",r:"\r",n:"\n",t:"\t",u2028:"\u2028",u2029:"\u2029"},v;for(v in n)n[n[v]]=v;var O=/\\|'|\r|\n|\t|\u2028|\u2029/g,P=/\\(\\|'|r|n|t|u2028|u2029)/g,w=function(a){return a.replace(P,function(a,b){return n[b]})};b.template=function(a,c,d){d=b.defaults(d||{},b.templateSettings);a="__p+='"+a.replace(O,function(a){return"\\"+n[a]}).replace(d.escape||
u,function(a,b){return"'+\n_.escape("+w(b)+")+\n'"}).replace(d.interpolate||u,function(a,b){return"'+\n("+w(b)+")+\n'"}).replace(d.evaluate||u,function(a,b){return"';\n"+w(b)+"\n;__p+='"})+"';\n";d.variable||(a="with(obj||{}){\n"+a+"}\n");var a="var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n"+a+"return __p;\n",e=new Function(d.variable||"obj","_",a);if(c)return e(c,b);c=function(a){return e.call(this,a,b)};c.source="function("+(d.variable||"obj")+"){\n"+a+"}";return c};
b.chain=function(a){return b(a).chain()};var m=function(a){this._wrapped=a};b.prototype=m.prototype;var x=function(a,c){return c?b(a).chain():a},M=function(a,c){m.prototype[a]=function(){var a=i.call(arguments);J.call(a,this._wrapped);return x(c.apply(b,a),this._chain)}};b.mixin(b);j("pop,push,reverse,shift,sort,splice,unshift".split(","),function(a){var b=k[a];m.prototype[a]=function(){var d=this._wrapped;b.apply(d,arguments);var e=d.length;(a=="shift"||a=="splice")&&e===0&&delete d[0];return x(d,
this._chain)}});j(["concat","join","slice"],function(a){var b=k[a];m.prototype[a]=function(){return x(b.apply(this._wrapped,arguments),this._chain)}});m.prototype.chain=function(){this._chain=true;return this};m.prototype.value=function(){return this._wrapped}}).call(this);/**
 * ShaderGraph.js. Assemble GLSL shaders on the fly.
 */

// Check dependencies.
;(function (deps) {
  for (var i in deps) {
    if (!window[i]) throw "Error: ShaderGraph requires " + deps[i];
  }
})({
  'THREE': 'Three.js'//,
});

// Namespace.
window.ShaderGraph = {};

// Fetch shader from <script> tag by id
ShaderGraph.getShader = function (id) {
  var elem = document.getElementById(id);
  return elem && (elem.innerText || elem.textContent) || id;
};(function ($) {

/**
 * Building block for effects, wraps a shader node, guides compilation.
 */
$.Block = function (node) {
  node = node || new $.Node();
  this.node(node);

  this.children = [];
  this.parent = null;
  this.properties = {};
  this.index = ++$.Block.index;

  this.refresh();
};

$.Block.index = 0;

$.Block.prototype = {

  node: function (node) {
    if (node !== undefined) {
      this._node = node;
      return this;
    }
    return this._node;
  },

  refresh: function () {
    this._node.owner(this);
    this._node.outlets(this.outlets());
  },

  fetch: function (program, phase, outlet, priority) {
    // Add outlet output code to program
  },

  id: function (program, phase, outlet, priority) {
    // Lookup inouts further up the chain
    if (outlet.meta.inout) {
      var input = outlet.node.get(outlet.name, $.IN).input;
      if (input) {
        return input.node.owner().fetch(program, phase, input, priority + 1);
      }
    }

    // Use this outlet's ID as intermediate variable name
    return outlet.id();
  },

};

/**
 * Building block for a GLSL shader
 */
$.Block.Snippet = function (code) {
  this.snippet = new $.Snippet(code);

  $.Block.call(this);
};

$.Block.Snippet.prototype = _.extend({}, $.Block.prototype, {

  insert: function (program, phase, priority) {
    // Compile code into program.
    $.Block.Snippet.compileCall(program, phase, this.node(), this.snippet, priority);
  },

  fetch: function (program, phase, outlet, priority) {
    // Ensure code is included in program.
    if (!program.include(this, phase)) {
      this.insert(program, phase, priority);
    }

    // Use this outlet's ID as intermediate variable name.
    return this.id(program, phase, outlet, priority);
  },

  outlets: function () {
    return $.Block.Snippet.makeOutlets(this.snippet);
  },

});

/**
 * Building block for a renderable material
 */
$.Block.Material = function (vertex, fragment) {
  this.vertex = new $.Snippet(vertex);
  this.fragment = new $.Snippet(fragment);

  $.Block.call(this);
};

$.Block.Material.prototype = _.extend({}, $.Block.prototype, {

  compile: function () {
    if (this.node().outputs.length > 0) throw "Can't compile material with outputs";

    var node = this.node();
    var program = new $.Program();

    this.insert(program, 'vertex', 0);
    this.insert(program, 'fragment', 0);

    program.compile();

    return program;
  },

  insert: function (program, phase, priority) {
    $.Block.Snippet.compileCall(program, phase, this.node(), this[phase], priority);
  },

  fetch: function (program, phase, outlet, priority) {
    // Ensure code is included only once in program.
    if (!program.include(this, phase)) {
      this.insert(program, phase, priority);
    }

    // Ensure vertex shader is added to program even if vertex outputs are not used.
    if (phase == 'fragment') {
      if (!program.include(this, 'vertex')) {
        this.insert(program, 'vertex', 0);
      }
    }

    // Use this outlet's ID as intermediate variable name.
    return this.id(program, phase, outlet, priority);
  },

  outlets: function () {
    var vertex   = $.Block.Snippet.makeOutlets(this.vertex);
    var fragment = $.Block.Snippet.makeOutlets(this.fragment);

    return _.union(vertex, fragment);
  },

});

/**
 * Make outlets based on a given signature.
 */
$.Block.Snippet.makeOutlets = function (snippet) {
  var outlets = [];

  // Since snippets are cached, cache outlets too.
  if (snippet.outlets) {
    return snippet.outlets;
  }

  var args = snippet.arguments();

  _.each(args.parameters, function (arg) {
    // Strip in/out suffix and set meta data
    arg = _.extend({}, arg);
    arg.meta = { required: true };
    arg.hint = arg.name.replace(/(In|Out)$/, '');
    arg.category = 'parameter';

    // Split inout args into two separate outlets
    if (arg.inout == $.INOUT) {
      arg.meta.inout = true;

      var input = _.extend({}, arg);
      input.inout = $.IN;
      outlets.push(input);

      arg.inout = $.OUT;
    }
    outlets.push(arg);
  });

  _.each(args.uniforms, function (arg) {
    // Strip in/out suffix and set meta data
    arg.meta = { };
    arg.hint = arg.name.replace(/(In|Out)$/, '');
    arg.category = 'uniform';
    arg.inout = $.IN;
    outlets.push(arg);
  });

  snippet.outlets = outlets;

  return outlets;
}

/**
 * Compile a GLSL snippet call by tracing inputs across the graph.
 */
$.Block.Snippet.compileCall = function (program, phase, node, snippet, priority) {
  var signature = snippet.arguments();
  var args = [];

  // Assign intermediate variables.
  _.each(signature.parameters, function (arg) {

    var fetch = arg.inout == $.INOUT ? $.IN : arg.inout;
    var outlet = node.get(arg.name, fetch);

    // Fetch code to calculate this input
    if (arg.inout == $.IN || arg.inout == $.INOUT) {
      if (outlet.input) {
        var owner = outlet.input.node.owner();

        var variable = owner.fetch(program, phase, outlet.input, priority + 1);
        program.variable(phase, variable, arg);
        args.push(variable);
      }
      else {
        console.log('Outlet', arg, input);
        throw ["Missing connection on outlet for " + arg.name];
      }
    }

    // Add output to call arguments
    else if (arg.inout == $.OUT) {
      var variable = outlet.id();
      program.variable(phase, variable, arg);
      args.push(variable);
    }
  });

  // Add uniforms
  var replaced = [];
  _.each(signature.uniforms, function (arg) {
    var outlet = node.get(arg.name);

    // Replace uniform with argument
    if (outlet.input) {
      var owner = outlet.input.node.owner();

      var variable = owner.fetch(program, phase, outlet.input, priority + 1);
      program.variable(phase, variable, arg);
      args.push(variable);
      replaced.push(arg.name);
    }
    // Pass through uniform
    else {
      program.external('uniform', arg);
    }
  });

  // Add attributes
  _.each(signature.attributes, function (arg) {
    program.external('attribute', arg);
  });

  // Add varyings
  _.each(signature.varyings, function (arg) {
    program.external('varying', arg);
  });

  // Compile snippet and add to program.
  var name = ['', 'sg', phase, snippet.name, node.owner().index ].join('_');
  var code = snippet.compile(name, replaced, true);
  program.add(phase, name, args, code, priority);
};


})(ShaderGraph);(function ($) {

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
(function ($) {

/**
 * Model of a shader program as it's being built.
 *
 * Is passed around and accumulates data, after which .compile() is called to finalize.
 */
$.Program = function () {
  this.calls = { vertex: {}, fragment: {} };
  this.variables = { vertex: {}, fragment: {} };
  this.externals = {};

  this.compiled = false;
  this.attributes = {};
  this.uniforms = {};
  this.vertexShader = '';
  this.fragmentShader = '';

  this.includes = { vertex: [], fragment: [] };
}

// TODO Add support for array types.
$.Program.types = {
  'f':  'float',
  'v2': 'vec2',
  'v3': 'vec3',
  'v4': 'vec4',
  'm3': 'mat3',
  'm4': 'mat4',
  't':  'sampler2D'//,
};

$.Program.prototype = {

  include: function (object, phase) {
    if (this.includes[phase].indexOf(object) >= 0) {
      return true;
    }
    this.includes[phase].push(object);
    return false;
  },

  external: function (category, arg) {
    arg = _.extend({ category: category }, arg);
    this.externals[arg.name] = arg;
  },

  variable: function (phase, name, arg) {
    arg = _.extend({}, arg, { name: name });
    this.variables[phase][name] = arg;
  },

  add: function (phase, name, args, code, priority) {
    var call = this.calls[phase][name];
    if (call) {
      call.priority = Math.min(call.priority, priority);
    }
    else {
      this.calls[phase][name] = { name: name, args: args, code: code, priority: priority };
    }
  },

  compile: function () {
    // Prepare uniform/attribute definitions for Three.js
    _.each(this.externals, function (e) {
      if (e.category == 'uniform') {
        this.uniforms[e.name] = {
          type: e.type,
          value: e.value//,
        };
      }
      if (e.category == 'attribute') {
        this.attributes[e.name] = {
          type: e.type,
          value: []//,
        };
      }
    }.bind(this));

    // Prepare vertex and fragment bodies.
    _.each([ 'vertex', 'fragment' ], function (phase) {

      // Build combined header without redundant definitions.
      var header = [];
      _.each(this.externals, function (e) {
        // Exclude vertex attributes from fragment shader.
        if (e.category == 'attribute' && phase == 'fragment') return;

        // Add definition
        header.push([e.category, e.signature, ';'].join(' '));
      }.bind(this));
      header = header.join("\n");

      var sorted = _.toArray(this.calls[phase]);
      var library = [ header ];

      // Start main function.
      var main = [ 'void main() {'];

      // Add variable definitions.
      _.each(this.variables[phase], function (variable) {
        main.push([ $.Program.types[variable.type], variable.name, ';' ].join(' '));
      });

      // Add calls.
      sorted.sort(function (a, b) {
        return b.priority - a.priority;
      });
      _.each(sorted, function (call) {
        library.push(call.code);
        main.push([ call.name, '(', call.args.join(','), ');' ].join(''))
      });
      main.push('}');

      // Build shader body
      this[phase + 'Shader'] = [ library.join("\n"), main.join("\n") ].join("\n");
    }.bind(this));

    this.compiled = true;
  },

  material: function () {
    if (!this.compiled) throw "Fetching material from uncompiled program.";
    return new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.vertex,
      fragmentShader: this.fragment//,
    });
  }//,

};

})(ShaderGraph);(function ($) {

/**
 * Parse a snippet of GLSL code so it can be composed into a shader.
 *
 * Must contain a single function with in/out parameters, returning void.
 */
$.Snippet = function (code) {

  // Only need to parse each snippet once.
  if ($.Snippet.cache[code]) {
    return $.Snippet.cache[code];
  }
  else {
    $.Snippet.cache[code] = this;
  }

  this.code = code;

  this.attributes = [];
  this.uniforms   = [];
  this.varyings   = [];
  this.parameters = [];
  this.signature  = '';
  this.body       = '';

  this.parseCode(code);
}

$.Snippet.cache = {};

$.Snippet.types = {
  'float':       'f',
  'vec2':        'v2',
  'vec3':        'v3',
  'vec4':        'v4',
  'mat3':        'm3',
  'mat4':        'm4',
  'sampler2D':   't',
  'samplerCube': 't'//,
};

$.Snippet.defaults = {
  'float':       0,
  'vec2':        new THREE.Vector3(),
  'vec3':        new THREE.Vector3(),
  'vec4':        new THREE.Vector4(),
  'mat4':        new THREE.Matrix4(),
  'sampler2D':   0,
  'samplerCube': 0//,
};

$.Snippet.prototype = {

  compile: function (name, replaced, bodyOnly) {
    // Build updated function signature.
    var signature = this.signature.slice();
    var header = [];
    replaced = replaced || [];

    // Prepare uniforms
    _.each(this.uniforms, function (item) {
      if (replaced.indexOf(item.name) >= 0) {
        signature.push(item.signature);
      }
      else if (!bodyOnly) {
        header.push(['uniform', item.signature].join(' '));
      }
    });

    // Prepare attributes
    !bodyOnly && _.each(this.attributes, function (item) {
      header.push(['attribute', item.signature].join(' '));
    });

    // Prepare varyings
    !bodyOnly && _.each(this.varyings, function (item) {
      header.push(['varying', item.signature].join(' '));
    });

    // Insert new signature into body
    var body = this.body.replace(/\s*void\s+([A-Za-z0-9]+)\s*\([^\)]*\)/g, ['void', name + '(', signature.join(', '), ')'].join(' '));

    // Assemble code
    header.push(body);
    return header.join(';\n')
  },

  arguments: function () {
    return {
      uniforms: this.uniforms,
      varyings: this.varyings,
      attributes: this.attributes,
      parameters: this.parameters//,
    };
  },

  type: function (type, array) {
    type = ($.Snippet.types[type] || 'f') + (array ? 'v' : '');
    type = type == 'fv' ? 'fv1' : type;
    return type;
  },

  parseAttribute: function (match) {
    var signature = match[1],
        type = match[2],
        name = match[3],
        array = match[4];

    this.attributes.push({
      name: name,
      type: this.type(type, array),
      signature: signature//,
    });
  },

  parseUniform: function (match) {
    var signature = match[1],
        type = match[2],
        name = match[3],
        array = match[4];

    this.uniforms.push({
      name: name,
      type: this.type(type, array),
      value: $.Snippet.defaults[type] || 0,
      signature: signature//,
    });
  },

  parseVarying: function (match) {
    var signature = match[1],
        type = match[2],
        name = match[3],
        array = match[4];

    this.varyings.push({
      name: name,
      type: this.type(type, array),
      signature: signature//,
    });
  },

  parseSignature: function (match) {
    this.name = match[1];

    // Ignore empty signature
    var signature = match[2].replace(/^\s*$/g, '');
    if (signature.length == 0) {
      this.signature = [];
      return;
    }

    // Parse out arguments.
    var arguments = this.signature = signature.split(',');
    _.each(arguments, function (definition) {
      var match = /((?:(in|out|inout)\s+)?([A-Za-z0-9]+)\s+([A-Za-z0-9_]+)\s*(?:\[([^\]]+)\])?)(?:$|(?=;))/.exec(definition);

      var signature = match[1],
          inout = match[2],
          type = match[3],
          name = match[4],
          array = match[5];

      var inouts = {
        'in': $.IN,
        'out': $.OUT,
        'inout': $.INOUT//,
      };

      this.parameters.push({
        inout: inouts[inout || 'in'],
        name: name,
        type: this.type(type, array),
        signature: signature//,
      });
    }.bind(this));
  },

  parseCode: function (code) {
    function findAll(re, string) {
      if (!re.global) throw "Can't findAll non-global regexp";
      var match, all = [];
      while (match = re.exec(string)) {
        all.push(match);
      };
      return all;
    }

    // Remove all comments and normalize newlines
    code = code.replace(/\r\n?/g, '\n').replace(/\/\/[^\n]*\n/g, ' ').replace(/\/\*(.|\n)*?\*\//g, ' ');

    // Find all attributes/uniforms/varying + function signature
    var attributes = findAll(/(?:^|;)\s*attribute\s+(([A-Za-z0-9]+)\s+([A-Za-z0-9_]+)\s*(?:\[([^\]]+)\])?)(?:$|(?=;))/g, code);
    var uniforms = findAll(/(?:^|;)\s*uniform\s+(([A-Za-z0-9]+)\s+([A-Za-z0-9_]+)\s*(?:\[([^\]]+)\])?)(?:$|(?=;))/g, code);
    var varyings = findAll(/(?:^|;)\s*varying\s+(([A-Za-z0-9]+)\s+([[A-Za-z0-9_]+)\s*(?:\[([^\]]+)\])?)(?:$|(?=;))/g, code);
    var signature = findAll(/(?:^|;)\s*void\s+([A-Za-z0-9]+)\s*\(([^\)]*)\)\s*{/g, code);

    if (!signature[0]) throw "Could not parse shader snippet. Must contain a void-returning function with in/outs: " + code;

    // Process uniforms/varyings and remove from source.
    var matches = {
      parseAttribute: attributes,
      parseUniform:   uniforms,
      parseVarying:   varyings//,
    };
    var body = code;
    _.each(matches, function (set, key) {
      _.each(set, function (item) {
        this[key](item);
        body = body.replace(item[0], '');
      }.bind(this));
    }.bind(this));
    body = body.replace(/^\s*;/, '');

    // Process function signature.
    this.parseSignature(signature[0]);
    this.body = body;
  }//,

};

})(ShaderGraph);
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
      callback(node, node._owner);
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
      _.each(node.inputs, function (outlet) {
        if (outlet.input == null) {
          inputs.push(outlet);
        }
      });
    });
    return inputs;
  },

  outputs: function () {
    var outputs = [];
    this.iterate(function (node) {
      _.each(node.outputs, function (outlet) {
        if (outlet.output.length == 0) {
          outputs.push(outlet);
        }
      });
    });
    return outputs;
  },

  tail: function () {
    return this.nodes[this.nodes.length - 1];
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
  }//,
};

$.IN = 0;
$.OUT = 1;
$.INOUT = 2;

})(ShaderGraph);
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
(function ($) {
$.Outlets = 0;

$.Outlet = function (inout, name, hint, type, category, exposed, meta) {

  // Object constructor syntax
  if (typeof inout == 'object') {
    var object = inout;
    return new $.Outlet(object.inout, object.name, object.hint, object.type, object.category, object.exposed, object.meta);
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
  this.key      = null;

  this.input = null;
  this.output = [];
};

$.Outlet.prototype = {
  // Unique ID for this outlet.
  id: function () {
    return ['', 'sg', this.name, this.index].join('_');
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
      console.log(this, outlet)
      throw "Can't connect out/out or in/in outlets.";
    }

    // Check for existing connection.
    if (outlet.input == this) return;

    // Disconnect existing connections.
    outlet.disconnect();

    // Add new connection.
    outlet.input = this;
    this.output.push(outlet);
  },

  // Disconnect given outlet (or all).
  disconnect: function (outlet) {
    if (this.inout == $.IN) {
      // Disconnect input from the other side.
      if (this.input) {
        this.input.disconnect(this);
      }
    }
    else {
      if (outlet) {
        // Remove one outgoing connection.
        var index = this.output.indexOf(outlet);
        if (index >= 0) {
          this.output.splice(index, 1);
          outlet.input = null
        }
      }
      else {
        // Remove all outgoing connections.
        _.each(this.output, function (outlet) {
          outlet.input = null
        });
        this.output = [];
      }
    }
  },

  // Link to given node.
  link: function (node) {
    this.node = node;
  }//,
};

})(ShaderGraph);