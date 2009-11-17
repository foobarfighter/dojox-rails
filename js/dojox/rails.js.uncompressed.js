/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

/*
	This is a compiled version of Dojo, built for deployment and not for
	development. To get an editable version, please visit:

		http://dojotoolkit.org

	for documentation and information on getting the source.
*/

if(!dojo._hasResource["dojox.rails._base.strings"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.rails._base.strings"] = true;
dojo.provide("dojox.rails._base.strings");

(function() {
  var dr = dojox.rails;

  dr.camelize = function(str, firstLetter) {
    var s="";
    var capNext = firstLetter === undefined ? true : firstLetter;

    for (var i=0; i<str.length; i++){
      var c = str.charAt(i);
      if (capNext && c != "_"){
        s += c.toUpperCase();
        capNext = false;
        continue;
      }
      if (c == "_"){
        capNext = true;
        continue;
      }
      s += c;
    }
    return s;
  }
})();

}

if(!dojo._hasResource["dojox.rails._base.parser"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.rails._base.parser"] = true;
dojo.provide("dojox.rails._base.parser");

(function() {
	var dr = dojox.rails;
	var d = dojo;
	
	dr.manager = {
		_map: {},
		
		register: function(type, obj){
			this._map[type] = this._map[type] || [];
			this._map[type].push(obj);
		},
		
		all: function(){
			var all = [];
      for (var type in this._map){
				all = all.concat(this._map[type]);
			}
			return all;
		},

    byNode: function(node){
      node = dojo.byId(node);
      if (!node) { return null }

      var decorators = this.findByType(dojo.attr(node, "data-js-type"));
      for (var i=0; i<decorators.length; i++){
        var decorator = decorators[i];
        if (node == decorator.domNode){ return decorator }
      }
      return null;
    },

    clear: function(){
      this._map = {};
    },
		
		findByType: function(type){
			return this._map[type] || [];
		}
	}
	
	dr.parse = function(){
		var nodes = d.query("*[data-js-type]");
    d.forEach(nodes, function(node){
      var tag = node.tagName.toLowerCase();
      var jsType = dojo.attr(node, "data-js-type");
      var auxType = dojo.attr(node, "type");
      var className = dr._resolveClassName(tag, jsType, auxType);
      
      d.require("dojox.rails.decorators." + className);
      dr.manager.register(jsType, new dr.decorators[className](node));
		});
	}

  dr._resolveClassName = function(tag, jsType, auxType){
      var className;
      if (tag == "script"){
        className = dr.camelize(jsType);
      } else {
        var tagMap = {'a': 'Link'};
				var postfix = null;

				if (tagMap[tag]){postfix = tagMap[tag];}
				else if (auxType){postfix = auxType;}
				else {postfix = tag;}

				className = dr.camelize(jsType + "_" + postfix);
			}
      return className;
  }
	
	if (d.config.parseOnLoad) {
		d.addOnLoad(function() {
			dr.parse();
		});
	}

  dr.AttributeParser = {
    TrueFalse:        function(v) { return v == "true" || v == true },
    ThrowUnsupported: function(v) { throw new Error("'data-" + v + "' is unsupported") },
    Code:             function(v) { return eval("(" + v + ")"); },
    Float:          function(v) { return parseFloat(v); }
  };
})();

}

if(!dojo._hasResource["dojox.rails._base"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.rails._base"] = true;
dojo.provide("dojox.rails._base");



}

if(!dojo._hasResource["dojox.rails"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.rails"] = true;
dojo.provide("dojox.rails");


}

if(!dojo._hasResource["dojox.rails.listeners"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.rails.listeners"] = true;
dojo.provide("dojox.rails.listeners");

dojo.declare("dojox.rails.listeners.Listener", null, {
	constructor: function(callback, target){
		this._callback = callback;
	},

	trigger: function(){
		this._callback();
	},
	
	listen: function() {},
	stop: function(){}
});

dojo.declare("dojox.rails.listeners.TimerListener",
	dojox.rails.listeners.Listener,
{
	constructor: function(callback, period){
		this._period = period;
	},

	listen: function(){
		this._interval = setInterval(dojo.hitch(this, "trigger"), this._period);
	},

	stop: function(){
		clearInterval(this._interval);
	}
});

dojo.declare("dojox.rails.listeners.ElementChangeListener",
	dojox.rails.listeners.Listener,
{
	constructor: function(callback, element){
		this._element = dojo.byId(element);
		this._connect = null;
	},

	listen: function(){
		var el = this._element;
		var type = (el.type||"").toLowerCase();
		if (type == "") throw new Error("Invalid type for element: " + el.constructor.toString() + ".	Did you forget to specify an input type in your markup?");

		var evtType;
		switch(el.type){
			case 'checkbox': // fall through
			case 'radio':
				evtType = 'onclick';
				break;
			default:
				evtType = 'onchange';
		}
		this._connect = dojo.connect(el, evtType, this, "trigger");
	},

	stop: function(){
		dojo.disconnect(this._connect);
	}
});

dojo.declare("dojox.rails.listeners.FormChangeListener",
	dojox.rails.listeners.Listener,
{
	constructor: function(callback, form){
		this._form = dojo.byId(form);
		this._listeners = []
	},

	listen: function(){
		var cb = dojo.hitch(this, "trigger");
		dojo.forEach(this._form.elements, function(node){
			var listener = new dojox.rails.listeners.ElementChangeListener(cb, node);
			this._listeners.push(listener);
			listener.listen();
		}, this);
	},

	stop: function(){
		dojo.forEach(this._listeners, function(listener){
			listener.stop();
		});
		this._listeners = [];
	}
});

}

if(!dojo._hasResource["dojox.rails.decorators.common"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.rails.decorators.common"] = true;
dojo.provide("dojox.rails.decorators.common");

dojo.declare("dojox.rails.decorators.Base", null, {
	constructor: function(node) {
		this.domNode = dojo.byId(node);
	},

	throwUnimplemented: function(feature){
		throw new Error(feature + ": not implemented");
	}
});

dojo.declare("dojox.rails.decorators.ArgMap", null, {
  constructor: function(mappings){
    this._mappings = mappings;
  },

  getMappingKeys: function(){
    var keys = [];
    for (var prop in this._mappings){
      keys.push(prop);
    }
    return keys;
  },

  map: function(args){
    var mappedArgs = {};
    for(var prop in args){
      if (!this._mappings[prop]) continue;

      var target = this._mappings[prop];
      var v = args[prop];

      if (dojo.isArray(target)){
        mappedArgs[target[0]] = target[1](v);
      }else if (dojo.isFunction(target)){
        mappedArgs[prop] = target(v);
      }else{
        mappedArgs[target.toString()] = v;
      }
    }
    return mappedArgs;
  }
});

}

if(!dojo._hasResource["dojox.rails.decorators.Request"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.rails.decorators.Request"] = true;
dojo.provide("dojox.rails.decorators.Request");



dojo.declare("dojox.rails.decorators.Request",
  dojox.rails.decorators.Base, {

  constructor: function(node) {
    this._connects = [];
    this._requestArgs = {};

    var attributes = this._parseAttributes(this.domNode);
    var requestCallbacks = this._mapAttributes(attributes, dojox.rails.decorators._CallbackMap);

    this._requestArgs = this._mapAttributes(attributes, dojox.rails.decorators._RequestArgMap);
    this._connectHandlers(requestCallbacks);
  },

  // Connection events
  onSuccess: function(request, ioArgs) {},
  onFailure: function(request, ioArgs) {},
  onComplete: function(request, ioArgs) {},

  getMethod: function() {
    return this._requestArgs.method || "get";
  },

  setMethod: function(method){
    this._requestArgs.method = method.toLowerCase();
  },

  exec: function(url, /*Object?*/ xhrArgs) {
    xhrArgs = xhrArgs || {};
    if (url){ xhrArgs.url = url }

    var dojoArgs = this._argsToDojo(xhrArgs);
    var xhrMethod = dojo["xhr" + dojox.rails.camelize(this.getMethod(), true)];
    if (xhrMethod){
      xhrMethod(dojoArgs);
    }else{
      dojo.xhr(this.getMethod(), dojoArgs);
    }
  },

  _parseAttributes: function(node){
    var attrs = node.attributes;
    var parsedAttrs = {};
    for (var i = 0; i < attrs.length; i++) {
      if (!attrs[i]) continue;

      var matches = attrs[i].name.match(/^data-(.*)/);
      if (matches && matches.length > 1) {
        parsedAttrs[matches[1]] = dojo.attr(node, attrs[i].name);
      }
    }
    return parsedAttrs;
  },

  _mapAttributes: function(attributes, mapper){
    return mapper.map(attributes);
  },

  _connectHandlers: function(callbacks){
    var handlers = ["onSuccess", "onFailure", "onComplete"];
    dojo.forEach(handlers, function(h){
			if (!callbacks[h]){return;}
      this._connects.push(dojo.connect(this, h, this, callbacks[h]));
    }, this);
  },

  _argsToDojo: function(xhrArgs){
    var dojoArgs = {}, drd = dojox.rails.decorators;
    var callbacks = { load: this.onSuccess, error: this.onFailure, handle: this.onComplete }
    
    dojo.mixin(dojoArgs, callbacks);
    dojo.mixin(dojoArgs, this._requestArgs);
    dojo.mixin(dojoArgs, xhrArgs);

    return dojoArgs;
  }
});

(function() {
  var drd = dojox.rails.decorators;
  var drap = dojox.rails.AttributeParser;

  drd._CallbackMap = new drd.ArgMap({
    "uninitialized-code":	drap.ThrowUnsupported,
    "loading-code":				drap.ThrowUnsupported,
    "loaded-code":				drap.ThrowUnsupported,
    "interactive-code":		drap.ThrowUnsupported,
    "create-code":        drap.ThrowUnsupported,
    "complete-code":			["onComplete", drap.Code],
    "failure-code":				["onFailure", drap.Code],
    "success-code":				["onSuccess", drap.Code]
  });

  drd._RequestArgMap = new drd.ArgMap({
    "url":                "url",
    "method":	            function(v) { return v.toLowerCase(); },
    "params":		          [ "content", function(v) { return dojo.isObject(v) ? v : dojo.queryToObject(v); } ],
    "sync":               drap.TrueFalse,
    "eval":	              ["evalScripts", drap.TrueFalse]
  });
})();

}

if(!dojo._hasResource["dojox.rails.decorators.Updater"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.rails.decorators.Updater"] = true;
dojo.provide("dojox.rails.decorators.Updater");





dojo.declare("dojox.rails.decorators.Updater", dojox.rails.decorators.Request, {
  STRIP_REGEXP: new RegExp('<script[^>]*>([\\S\\s]*?)<\/script>', "img"),

  constructor: function(domNode){
    this._updaterArgs = {};

    var attributes = this._parseAttributes(this.domNode); //TODO: Remove this line.  this._parseAttributes called in superclass
    this._updaterArgs = this._mapAttributes(attributes, dojox.rails.decorators._UpdaterArgMap);
    this._connectUpdateHandlers();
  },

  _connectUpdateHandlers: function(){
    if (this._updaterArgs.successQuery) dojo.connect(this, "onSuccess", this, "_handleSuccess");
    if (this._updaterArgs.failureQuery) dojo.connect(this, "onFailure", this, "_handleFailure");
    if (this._updaterArgs.completeQuery) dojo.connect(this, "onComplete", this, "_handleComplete");
  },

  _handleSuccess: function(request, ioArgs){
    this._handle(request, ioArgs, this._updaterArgs.successQuery);
  },

  _handleFailure: function(request, ioArgs){
    this._handle(request, ioArgs, this._updaterArgs.failureQuery);
  },

  _handleComplete: function(request, ioArgs){
    this._handle(request, ioArgs, this._updaterArgs.completeQuery);
  },

  _handle: function(request, ioArgs, query){
    var scripts = null;
    var responseText = request.status == null ? request.toString() : request.responseText;
    var doEval = this._updaterArgs.evalScripts;

    if (doEval){scripts = this._grepScripts(responseText)}
    responseText = this._strippedContent(responseText);
    this._placeHTML(query, responseText);

    if (doEval) this._evalScripts(scripts);
  },

  _placeHTML: function(query, content){
    var nl = dojo.query(query);
    nl.forEach(function(refNode){
      dojo.place("<!-- dojo.place hack -->" + content, refNode, this._updaterArgs.place);
    }, this);
  },

  _grepScripts: function(responseText){
		var scripts = [];
		dojo.forEach(this.STRIP_REGEXP.exec(responseText), function(script, i){
			if (i > 0) scripts.push(script);
		});
		return scripts;
	},

  _strippedContent: function(responseText){
		return responseText.replace(this.STRIP_REGEXP, "");
	},

	_evalScripts: function(scripts){
		if (!scripts) return;

		dojo.forEach(scripts, function(script){
			if (script) eval(script);
		});
	}
});


(function() {
  var drd = dojox.rails.decorators;
  var drap = dojox.rails.AttributeParser;

  var insertionMap = {
    "top":		 "first",
    "bottom":	 "last",
    "before":	 "before",
    "after":	 "after"
  };

  drd._UpdaterArgMap = new drd.ArgMap({
    "position": 	      [ "place", function(v) { return insertionMap[v] }],
    "update-success": 	"successQuery",
    "update-failure": 	"failureQuery",
    "update-complete": 	"completeQuery",
    "eval":	            ["evalScripts", drap.TrueFalse]
  });
})();

}

if(!dojo._hasResource["dojox.rails.decorators.Observer"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.rails.decorators.Observer"] = true;
dojo.provide("dojox.rails.decorators.Observer");



dojo.declare("dojox.rails.decorators.Observer",
  dojox.rails.decorators.Updater, {

	constructor: function(node) {
		this._observerArgs = {};

		var attributes = this._parseAttributes(this.domNode);
		this._observerArgs = this._mapAttributes(attributes, dojox.rails.decorators._ObserverArgMap);

		this._listener = null;
		this.register();
		this._lastValue = this.getValue();
	},

	register: function() {
		this._register(this._observerArgs.frequency, this._observerArgs.observed);
	},

	listenerClass: function(){
		this.throwUnimplemented("listenerClass");
	},

	compare: function(newValue, lastValue){
		this.throwUnimplemented("compare");
	},

	getValue: function() {
		this.throwUnimplemented("getValue");
	},

	onObservation: function(value, lastValue){
		if (this._observerArgs.callback){									// FIXME: Add test
			this._observerArgs.callback(value, lastValue);
		}
	},

	onEvent: function(){
		var v = this.getValue();
		if (this.compare(v, this._lastValue)){
			this.onObservation(v, this._lastValue);
			this._lastValue = v;
		}
	},

	registerListener: function(listenerClass, arg){
		var callback = dojo.hitch(this, "onEvent");
		if (this._listener){this._listener.stop();}
		this._listener = new listenerClass(callback, arg);
		this._listener.listen();
	},

	getObserved: function(){
		return dojo.byId(this._observerArgs.observed);
	},

	getListener: function(){
		return this._listener;
	},

	//FIXME: Add tests
	destroy: function(){
		if (this._listener){this._listener.stop();}
		this._listener = null;
		this._observerArgs = null;
		this._lastValue = null;
	},

	_register: function(frequency, observed){
		if (frequency){
			this.registerListener(dojox.rails.listeners.TimerListener, frequency);
		}else{
			this.registerListener(this.listenerClass(), observed);
		}
	}
});

(function() {
  var drd = dojox.rails.decorators;
  var drap = dojox.rails.AttributeParser;

  drd._ObserverArgMap = new drd.ArgMap({
		"observed":					"observed",
		"observer-code":		["callback", drap.Code],
		"frequency":				["frequency", function(v){return drap.Float(v)*1000}]
  });
})();

}

if(!dojo._hasResource["dojox.rails.decorators.FieldObserver"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.rails.decorators.FieldObserver"] = true;
dojo.provide("dojox.rails.decorators.FieldObserver");



dojo.declare("dojox.rails.decorators.FieldObserver",
	dojox.rails.decorators.Observer, {

	listenerClass: function() {
		return dojox.rails.listeners.ElementChangeListener;
	},

	compare: function(newValue, lastValue){
		return newValue != lastValue;
	},

	onObservation: function(value, lastValue){
		if (this._observerArgs.callback){
			this._observerArgs.callback(value, lastValue);
		}else{
			var o = {};
			o[this._observerArgs.observed] = value;
			this.exec(null, { content: o });				// FIXME: this is kinda ugly.  exec should normalize arguments
		}
	},

	getValue: function() {
		this._target = this._target || dojo.byId(this._observerArgs.observed);
		return dojo.fieldToObject(this._target);
	}
});

}

if(!dojo._hasResource["dojox.rails.decorators.FormObserver"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.rails.decorators.FormObserver"] = true;
dojo.provide("dojox.rails.decorators.FormObserver");



dojo.declare("dojox.rails.decorators.FormObserver",
	dojox.rails.decorators.Observer, {

	listenerClass: function() {
		return dojox.rails.listeners.FormChangeListener;
	},

	// TODO: Need to add tests!!!!!!!
	compare: function(newValue, oldValue){
		if (dojo.isString(newValue)){
			if (!dojo.isString(oldValue)){return true;}
			return newValue != oldValue;
		}

		if (dojo.isArray(newValue)){
			if(!dojo.isArray(oldValue) || newValue.length != oldValue.length){return true;}

			for (var i=0; i<newValue.length; ++i){
				if (this.compare(newValue[i], oldValue[i])){return true;}
			}
			return false;
		}

		if (dojo.isObject(newValue)){
			if (!dojo.isObject(oldValue)) {return true;}

			var keys = [];
			for(var prop in newValue){
				keys.push(prop);
				if (this.compare(newValue[prop], oldValue[prop])){ return true;}
			}
			for (var i=0; i<keys.length; ++i){
				var key = keys[i];
				if (oldValue[key] === undefined){return true};
			}
			return false;
		}

		return newValue != oldValue;
	},

	onObservation: function(value, lastValue){
		if (this._observerArgs.callback){
			this._observerArgs.callback(value, lastValue);
		}else{
			this.exec(null, { content: value });				// FIXME: this is kinda ugly.  exec should normalize arguments
		}
	},

	getValue: function() {
		this._target = this._target || dojo.byId(this._observerArgs.observed);
		return dojo.formToObject(this._target);
	}
});

}

if(!dojo._hasResource["dojox.rails.decorators.RemoteLink"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.rails.decorators.RemoteLink"] = true;
dojo.provide("dojox.rails.decorators.RemoteLink");



dojo.declare("dojox.rails.decorators.RemoteLink",
  dojox.rails.decorators.Updater, {

	constructor: function(node) {
    var href = dojo.attr(this.domNode, "href");
    if (!this._requestArgs.url && href){this._requestArgs.url = href;}

    this._connectRemoteHandlers();
	},

  onClick: function(evt){
		this._submit();
    evt.preventDefault();
  },

	destroy: function(){
		dojo.forEach(this._connects, function(c){
			dojo.disconnect(c);
		});
	},

	_submit: function(){
		this.exec();
	},

	_connectRemoteHandlers: function(){
    this._connects.push(dojo.connect(this.domNode, "onclick", this, "onClick"));
  }
});

}

if(!dojo._hasResource["dojox.rails.decorators.RemoteButton"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.rails.decorators.RemoteButton"] = true;
dojo.provide("dojox.rails.decorators.RemoteButton");



dojo.declare("dojox.rails.decorators.RemoteButton",
  dojox.rails.decorators.RemoteLink, {
});

}

if(!dojo._hasResource["dojox.rails.decorators.RemoteSubmit"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.rails.decorators.RemoteSubmit"] = true;
dojo.provide("dojox.rails.decorators.RemoteSubmit");



dojo.declare("dojox.rails.decorators.RemoteSubmit",
  dojox.rails.decorators.RemoteButton, {
	_submit: function(){
		var o = dojo.formToObject(this.domNode.form);
		this.exec(null, {content: o});
	}
});

}

if(!dojo._hasResource["dojox.rails.decorators.RemoteForm"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.rails.decorators.RemoteForm"] = true;
dojo.provide("dojox.rails.decorators.RemoteForm");



dojo.declare("dojox.rails.decorators.RemoteForm",
  dojox.rails.decorators.Updater, {

	constructor: function(node) {
		var action = dojo.attr(this.domNode, "action");
		var method = dojo.attr(this.domNode, "method");
    if (!this._requestArgs.url && action){this._requestArgs.url = action;}
    if (method){this.setMethod(method);}

		this._connectRemoteHandlers();
	},

	_connectRemoteHandlers: function(){
		this._connects.push(dojo.connect(this.domNode, "onsubmit", this, "onSubmit"));
	},

	onSubmit: function(evt){
		this._submit();
    dojo.stopEvent(evt);
  },

	destroy: function(){
		dojo.forEach(this._connects, function(c){
			dojo.disconnect(c);
		});
	},

	_submit: function(){
		var o = dojo.formToObject(this.domNode);
		this.exec(null, {content: o});
	}

});

}

if(!dojo._hasResource["dojox.rails.decorators.PeriodicalExecuter"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.rails.decorators.PeriodicalExecuter"] = true;
dojo.provide("dojox.rails.decorators.PeriodicalExecuter");



dojo.declare("dojox.rails.decorators.PeriodicalExecuter",
	[dojox.rails.decorators.Updater], {

	constructor: function(node){
		var attributes = this._parseAttributes(this.domNode);
		this._executerArgs = this._mapAttributes(attributes, dojox.rails.decorators._ExecuterArgMap);
		this.register();
	},

	register: function(){
		this._register(this._executerArgs.frequency);
	},

	onEvent: function(){
		this.exec();
	},

	getListener: function(){
		return this._listener;
	},

	_register: function(frequency){
		var callback = dojo.hitch(this, "onEvent");
		this._listener = new dojox.rails.listeners.TimerListener(callback, frequency);
		this._listener.listen();
	},

	destroy: function(){
		if (this._listener){this._listener.stop();}
	}
});

(function() {
  var drd = dojox.rails.decorators;
  var drap = dojox.rails.AttributeParser;

  drd._ExecuterArgMap = new drd.ArgMap({
		"frequency":				["frequency", function(v){return drap.Float(v)*1000}]
  });
})();

}

