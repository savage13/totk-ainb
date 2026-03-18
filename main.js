"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // node_modules/split.js/dist/split.es.js
  var global2 = typeof window !== "undefined" ? window : null;
  var ssr = global2 === null;
  var document2 = !ssr ? global2.document : void 0;
  var addEventListener = "addEventListener";
  var removeEventListener = "removeEventListener";
  var getBoundingClientRect = "getBoundingClientRect";
  var gutterStartDragging = "_a";
  var aGutterSize = "_b";
  var bGutterSize = "_c";
  var HORIZONTAL = "horizontal";
  var NOOP = function() {
    return false;
  };
  var calc = ssr ? "calc" : ["", "-webkit-", "-moz-", "-o-"].filter(function(prefix) {
    var el = document2.createElement("div");
    el.style.cssText = "width:" + prefix + "calc(9px)";
    return !!el.style.length;
  }).shift() + "calc";
  var isString = function(v) {
    return typeof v === "string" || v instanceof String;
  };
  var elementOrSelector = function(el) {
    if (isString(el)) {
      var ele = document2.querySelector(el);
      if (!ele) {
        throw new Error("Selector " + el + " did not match a DOM element");
      }
      return ele;
    }
    return el;
  };
  var getOption = function(options, propName, def) {
    var value = options[propName];
    if (value !== void 0) {
      return value;
    }
    return def;
  };
  var getGutterSize = function(gutterSize, isFirst, isLast, gutterAlign) {
    if (isFirst) {
      if (gutterAlign === "end") {
        return 0;
      }
      if (gutterAlign === "center") {
        return gutterSize / 2;
      }
    } else if (isLast) {
      if (gutterAlign === "start") {
        return 0;
      }
      if (gutterAlign === "center") {
        return gutterSize / 2;
      }
    }
    return gutterSize;
  };
  var defaultGutterFn = function(i, gutterDirection) {
    var gut = document2.createElement("div");
    gut.className = "gutter gutter-" + gutterDirection;
    return gut;
  };
  var defaultElementStyleFn = function(dim, size2, gutSize) {
    var style2 = {};
    if (!isString(size2)) {
      style2[dim] = calc + "(" + size2 + "% - " + gutSize + "px)";
    } else {
      style2[dim] = size2;
    }
    return style2;
  };
  var defaultGutterStyleFn = function(dim, gutSize) {
    var obj;
    return obj = {}, obj[dim] = gutSize + "px", obj;
  };
  var Split = function(idsOption, options) {
    if (options === void 0) options = {};
    if (ssr) {
      return {};
    }
    var ids = idsOption;
    var dimension;
    var clientAxis;
    var position2;
    var positionEnd;
    var clientSize;
    var elements;
    if (Array.from) {
      ids = Array.from(ids);
    }
    var firstElement = elementOrSelector(ids[0]);
    var parent = firstElement.parentNode;
    var parentStyle = getComputedStyle ? getComputedStyle(parent) : null;
    var parentFlexDirection = parentStyle ? parentStyle.flexDirection : null;
    var sizes = getOption(options, "sizes") || ids.map(function() {
      return 100 / ids.length;
    });
    var minSize = getOption(options, "minSize", 100);
    var minSizes = Array.isArray(minSize) ? minSize : ids.map(function() {
      return minSize;
    });
    var maxSize = getOption(options, "maxSize", Infinity);
    var maxSizes = Array.isArray(maxSize) ? maxSize : ids.map(function() {
      return maxSize;
    });
    var expandToMin = getOption(options, "expandToMin", false);
    var gutterSize = getOption(options, "gutterSize", 10);
    var gutterAlign = getOption(options, "gutterAlign", "center");
    var snapOffset = getOption(options, "snapOffset", 30);
    var snapOffsets = Array.isArray(snapOffset) ? snapOffset : ids.map(function() {
      return snapOffset;
    });
    var dragInterval = getOption(options, "dragInterval", 1);
    var direction = getOption(options, "direction", HORIZONTAL);
    var cursor = getOption(
      options,
      "cursor",
      direction === HORIZONTAL ? "col-resize" : "row-resize"
    );
    var gutter = getOption(options, "gutter", defaultGutterFn);
    var elementStyle = getOption(
      options,
      "elementStyle",
      defaultElementStyleFn
    );
    var gutterStyle = getOption(options, "gutterStyle", defaultGutterStyleFn);
    if (direction === HORIZONTAL) {
      dimension = "width";
      clientAxis = "clientX";
      position2 = "left";
      positionEnd = "right";
      clientSize = "clientWidth";
    } else if (direction === "vertical") {
      dimension = "height";
      clientAxis = "clientY";
      position2 = "top";
      positionEnd = "bottom";
      clientSize = "clientHeight";
    }
    function setElementSize(el, size2, gutSize, i) {
      var style2 = elementStyle(dimension, size2, gutSize, i);
      Object.keys(style2).forEach(function(prop) {
        el.style[prop] = style2[prop];
      });
    }
    function setGutterSize(gutterElement, gutSize, i) {
      var style2 = gutterStyle(dimension, gutSize, i);
      Object.keys(style2).forEach(function(prop) {
        gutterElement.style[prop] = style2[prop];
      });
    }
    function getSizes() {
      return elements.map(function(element) {
        return element.size;
      });
    }
    function getMousePosition(e) {
      if ("touches" in e) {
        return e.touches[0][clientAxis];
      }
      return e[clientAxis];
    }
    function adjust2(offset) {
      var a = elements[this.a];
      var b = elements[this.b];
      var percentage = a.size + b.size;
      a.size = offset / this.size * percentage;
      b.size = percentage - offset / this.size * percentage;
      setElementSize(a.element, a.size, this[aGutterSize], a.i);
      setElementSize(b.element, b.size, this[bGutterSize], b.i);
    }
    function drag(e) {
      var offset;
      var a = elements[this.a];
      var b = elements[this.b];
      if (!this.dragging) {
        return;
      }
      offset = getMousePosition(e) - this.start + (this[aGutterSize] - this.dragOffset);
      if (dragInterval > 1) {
        offset = Math.round(offset / dragInterval) * dragInterval;
      }
      if (offset <= a.minSize + a.snapOffset + this[aGutterSize]) {
        offset = a.minSize + this[aGutterSize];
      } else if (offset >= this.size - (b.minSize + b.snapOffset + this[bGutterSize])) {
        offset = this.size - (b.minSize + this[bGutterSize]);
      }
      if (offset >= a.maxSize - a.snapOffset + this[aGutterSize]) {
        offset = a.maxSize + this[aGutterSize];
      } else if (offset <= this.size - (b.maxSize - b.snapOffset + this[bGutterSize])) {
        offset = this.size - (b.maxSize + this[bGutterSize]);
      }
      adjust2.call(this, offset);
      getOption(options, "onDrag", NOOP)(getSizes());
    }
    function calculateSizes() {
      var a = elements[this.a].element;
      var b = elements[this.b].element;
      var aBounds = a[getBoundingClientRect]();
      var bBounds = b[getBoundingClientRect]();
      this.size = aBounds[dimension] + bBounds[dimension] + this[aGutterSize] + this[bGutterSize];
      this.start = aBounds[position2];
      this.end = aBounds[positionEnd];
    }
    function innerSize(element) {
      if (!getComputedStyle) {
        return null;
      }
      var computedStyle = getComputedStyle(element);
      if (!computedStyle) {
        return null;
      }
      var size2 = element[clientSize];
      if (size2 === 0) {
        return null;
      }
      if (direction === HORIZONTAL) {
        size2 -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
      } else {
        size2 -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
      }
      return size2;
    }
    function trimToMin(sizesToTrim) {
      var parentSize = innerSize(parent);
      if (parentSize === null) {
        return sizesToTrim;
      }
      if (minSizes.reduce(function(a, b) {
        return a + b;
      }, 0) > parentSize) {
        return sizesToTrim;
      }
      var excessPixels = 0;
      var toSpare = [];
      var pixelSizes = sizesToTrim.map(function(size2, i) {
        var pixelSize = parentSize * size2 / 100;
        var elementGutterSize = getGutterSize(
          gutterSize,
          i === 0,
          i === sizesToTrim.length - 1,
          gutterAlign
        );
        var elementMinSize = minSizes[i] + elementGutterSize;
        if (pixelSize < elementMinSize) {
          excessPixels += elementMinSize - pixelSize;
          toSpare.push(0);
          return elementMinSize;
        }
        toSpare.push(pixelSize - elementMinSize);
        return pixelSize;
      });
      if (excessPixels === 0) {
        return sizesToTrim;
      }
      return pixelSizes.map(function(pixelSize, i) {
        var newPixelSize = pixelSize;
        if (excessPixels > 0 && toSpare[i] - excessPixels > 0) {
          var takenPixels = Math.min(
            excessPixels,
            toSpare[i] - excessPixels
          );
          excessPixels -= takenPixels;
          newPixelSize = pixelSize - takenPixels;
        }
        return newPixelSize / parentSize * 100;
      });
    }
    function stopDragging() {
      var self2 = this;
      var a = elements[self2.a].element;
      var b = elements[self2.b].element;
      if (self2.dragging) {
        getOption(options, "onDragEnd", NOOP)(getSizes());
      }
      self2.dragging = false;
      global2[removeEventListener]("mouseup", self2.stop);
      global2[removeEventListener]("touchend", self2.stop);
      global2[removeEventListener]("touchcancel", self2.stop);
      global2[removeEventListener]("mousemove", self2.move);
      global2[removeEventListener]("touchmove", self2.move);
      self2.stop = null;
      self2.move = null;
      a[removeEventListener]("selectstart", NOOP);
      a[removeEventListener]("dragstart", NOOP);
      b[removeEventListener]("selectstart", NOOP);
      b[removeEventListener]("dragstart", NOOP);
      a.style.userSelect = "";
      a.style.webkitUserSelect = "";
      a.style.MozUserSelect = "";
      a.style.pointerEvents = "";
      b.style.userSelect = "";
      b.style.webkitUserSelect = "";
      b.style.MozUserSelect = "";
      b.style.pointerEvents = "";
      self2.gutter.style.cursor = "";
      self2.parent.style.cursor = "";
      document2.body.style.cursor = "";
    }
    function startDragging(e) {
      if ("button" in e && e.button !== 0) {
        return;
      }
      var self2 = this;
      var a = elements[self2.a].element;
      var b = elements[self2.b].element;
      if (!self2.dragging) {
        getOption(options, "onDragStart", NOOP)(getSizes());
      }
      e.preventDefault();
      self2.dragging = true;
      self2.move = drag.bind(self2);
      self2.stop = stopDragging.bind(self2);
      global2[addEventListener]("mouseup", self2.stop);
      global2[addEventListener]("touchend", self2.stop);
      global2[addEventListener]("touchcancel", self2.stop);
      global2[addEventListener]("mousemove", self2.move);
      global2[addEventListener]("touchmove", self2.move);
      a[addEventListener]("selectstart", NOOP);
      a[addEventListener]("dragstart", NOOP);
      b[addEventListener]("selectstart", NOOP);
      b[addEventListener]("dragstart", NOOP);
      a.style.userSelect = "none";
      a.style.webkitUserSelect = "none";
      a.style.MozUserSelect = "none";
      a.style.pointerEvents = "none";
      b.style.userSelect = "none";
      b.style.webkitUserSelect = "none";
      b.style.MozUserSelect = "none";
      b.style.pointerEvents = "none";
      self2.gutter.style.cursor = cursor;
      self2.parent.style.cursor = cursor;
      document2.body.style.cursor = cursor;
      calculateSizes.call(self2);
      self2.dragOffset = getMousePosition(e) - self2.end;
    }
    sizes = trimToMin(sizes);
    var pairs = [];
    elements = ids.map(function(id2, i) {
      var element = {
        element: elementOrSelector(id2),
        size: sizes[i],
        minSize: minSizes[i],
        maxSize: maxSizes[i],
        snapOffset: snapOffsets[i],
        i
      };
      var pair;
      if (i > 0) {
        pair = {
          a: i - 1,
          b: i,
          dragging: false,
          direction,
          parent
        };
        pair[aGutterSize] = getGutterSize(
          gutterSize,
          i - 1 === 0,
          false,
          gutterAlign
        );
        pair[bGutterSize] = getGutterSize(
          gutterSize,
          false,
          i === ids.length - 1,
          gutterAlign
        );
        if (parentFlexDirection === "row-reverse" || parentFlexDirection === "column-reverse") {
          var temp = pair.a;
          pair.a = pair.b;
          pair.b = temp;
        }
      }
      if (i > 0) {
        var gutterElement = gutter(i, direction, element.element);
        setGutterSize(gutterElement, gutterSize, i);
        pair[gutterStartDragging] = startDragging.bind(pair);
        gutterElement[addEventListener](
          "mousedown",
          pair[gutterStartDragging]
        );
        gutterElement[addEventListener](
          "touchstart",
          pair[gutterStartDragging]
        );
        parent.insertBefore(gutterElement, element.element);
        pair.gutter = gutterElement;
      }
      setElementSize(
        element.element,
        element.size,
        getGutterSize(
          gutterSize,
          i === 0,
          i === ids.length - 1,
          gutterAlign
        ),
        i
      );
      if (i > 0) {
        pairs.push(pair);
      }
      return element;
    });
    function adjustToMin(element) {
      var isLast = element.i === pairs.length;
      var pair = isLast ? pairs[element.i - 1] : pairs[element.i];
      calculateSizes.call(pair);
      var size2 = isLast ? pair.size - element.minSize - pair[bGutterSize] : element.minSize + pair[aGutterSize];
      adjust2.call(pair, size2);
    }
    elements.forEach(function(element) {
      var computedSize = element.element[getBoundingClientRect]()[dimension];
      if (computedSize < element.minSize) {
        if (expandToMin) {
          adjustToMin(element);
        } else {
          element.minSize = computedSize;
        }
      }
    });
    function setSizes(newSizes) {
      var trimmed = trimToMin(newSizes);
      trimmed.forEach(function(newSize, i) {
        if (i > 0) {
          var pair = pairs[i - 1];
          var a = elements[pair.a];
          var b = elements[pair.b];
          a.size = trimmed[i - 1];
          b.size = newSize;
          setElementSize(a.element, a.size, pair[aGutterSize], a.i);
          setElementSize(b.element, b.size, pair[bGutterSize], b.i);
        }
      });
    }
    function destroy(preserveStyles, preserveGutter) {
      pairs.forEach(function(pair) {
        if (preserveGutter !== true) {
          pair.parent.removeChild(pair.gutter);
        } else {
          pair.gutter[removeEventListener](
            "mousedown",
            pair[gutterStartDragging]
          );
          pair.gutter[removeEventListener](
            "touchstart",
            pair[gutterStartDragging]
          );
        }
        if (preserveStyles !== true) {
          var style2 = elementStyle(
            dimension,
            pair.a.size,
            pair[aGutterSize]
          );
          Object.keys(style2).forEach(function(prop) {
            elements[pair.a].element.style[prop] = "";
            elements[pair.b].element.style[prop] = "";
          });
        }
      });
    }
    return {
      setSizes,
      getSizes,
      collapse: function collapse(i) {
        adjustToMin(elements[i]);
      },
      destroy,
      parent,
      pairs
    };
  };
  var split_es_default = Split;

  // node_modules/d3-dispatch/src/dispatch.js
  var noop = { value: () => {
  } };
  function dispatch() {
    for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
      if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
      _[t] = [];
    }
    return new Dispatch(_);
  }
  function Dispatch(_) {
    this._ = _;
  }
  function parseTypenames(typenames, types) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
      return { type: t, name };
    });
  }
  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function(typename, callback) {
      var _ = this._, T = parseTypenames(typename + "", _), t, i = -1, n = T.length;
      if (arguments.length < 2) {
        while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
        return;
      }
      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
      while (++i < n) {
        if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
        else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
      }
      return this;
    },
    copy: function() {
      var copy = {}, _ = this._;
      for (var t in _) copy[t] = _[t].slice();
      return new Dispatch(copy);
    },
    call: function(type2, that) {
      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
      if (!this._.hasOwnProperty(type2)) throw new Error("unknown type: " + type2);
      for (t = this._[type2], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    },
    apply: function(type2, that, args) {
      if (!this._.hasOwnProperty(type2)) throw new Error("unknown type: " + type2);
      for (var t = this._[type2], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    }
  };
  function get(type2, name) {
    for (var i = 0, n = type2.length, c; i < n; ++i) {
      if ((c = type2[i]).name === name) {
        return c.value;
      }
    }
  }
  function set(type2, name, callback) {
    for (var i = 0, n = type2.length; i < n; ++i) {
      if (type2[i].name === name) {
        type2[i] = noop, type2 = type2.slice(0, i).concat(type2.slice(i + 1));
        break;
      }
    }
    if (callback != null) type2.push({ name, value: callback });
    return type2;
  }
  var dispatch_default = dispatch;

  // node_modules/d3-selection/src/namespaces.js
  var xhtml = "http://www.w3.org/1999/xhtml";
  var namespaces_default = {
    svg: "http://www.w3.org/2000/svg",
    xhtml,
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };

  // node_modules/d3-selection/src/namespace.js
  function namespace_default(name) {
    var prefix = name += "", i = prefix.indexOf(":");
    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
    return namespaces_default.hasOwnProperty(prefix) ? { space: namespaces_default[prefix], local: name } : name;
  }

  // node_modules/d3-selection/src/creator.js
  function creatorInherit(name) {
    return function() {
      var document3 = this.ownerDocument, uri = this.namespaceURI;
      return uri === xhtml && document3.documentElement.namespaceURI === xhtml ? document3.createElement(name) : document3.createElementNS(uri, name);
    };
  }
  function creatorFixed(fullname) {
    return function() {
      return this.ownerDocument.createElementNS(fullname.space, fullname.local);
    };
  }
  function creator_default(name) {
    var fullname = namespace_default(name);
    return (fullname.local ? creatorFixed : creatorInherit)(fullname);
  }

  // node_modules/d3-selection/src/selector.js
  function none() {
  }
  function selector_default(selector) {
    return selector == null ? none : function() {
      return this.querySelector(selector);
    };
  }

  // node_modules/d3-selection/src/selection/select.js
  function select_default(select) {
    if (typeof select !== "function") select = selector_default(select);
    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
        }
      }
    }
    return new Selection(subgroups, this._parents);
  }

  // node_modules/d3-selection/src/array.js
  function array(x2) {
    return x2 == null ? [] : Array.isArray(x2) ? x2 : Array.from(x2);
  }

  // node_modules/d3-selection/src/selectorAll.js
  function empty() {
    return [];
  }
  function selectorAll_default(selector) {
    return selector == null ? empty : function() {
      return this.querySelectorAll(selector);
    };
  }

  // node_modules/d3-selection/src/selection/selectAll.js
  function arrayAll(select) {
    return function() {
      return array(select.apply(this, arguments));
    };
  }
  function selectAll_default(select) {
    if (typeof select === "function") select = arrayAll(select);
    else select = selectorAll_default(select);
    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          subgroups.push(select.call(node, node.__data__, i, group));
          parents.push(node);
        }
      }
    }
    return new Selection(subgroups, parents);
  }

  // node_modules/d3-selection/src/matcher.js
  function matcher_default(selector) {
    return function() {
      return this.matches(selector);
    };
  }
  function childMatcher(selector) {
    return function(node) {
      return node.matches(selector);
    };
  }

  // node_modules/d3-selection/src/selection/selectChild.js
  var find = Array.prototype.find;
  function childFind(match) {
    return function() {
      return find.call(this.children, match);
    };
  }
  function childFirst() {
    return this.firstElementChild;
  }
  function selectChild_default(match) {
    return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
  }

  // node_modules/d3-selection/src/selection/selectChildren.js
  var filter = Array.prototype.filter;
  function children() {
    return Array.from(this.children);
  }
  function childrenFilter(match) {
    return function() {
      return filter.call(this.children, match);
    };
  }
  function selectChildren_default(match) {
    return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
  }

  // node_modules/d3-selection/src/selection/filter.js
  function filter_default(match) {
    if (typeof match !== "function") match = matcher_default(match);
    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }
    return new Selection(subgroups, this._parents);
  }

  // node_modules/d3-selection/src/selection/sparse.js
  function sparse_default(update) {
    return new Array(update.length);
  }

  // node_modules/d3-selection/src/selection/enter.js
  function enter_default() {
    return new Selection(this._enter || this._groups.map(sparse_default), this._parents);
  }
  function EnterNode(parent, datum2) {
    this.ownerDocument = parent.ownerDocument;
    this.namespaceURI = parent.namespaceURI;
    this._next = null;
    this._parent = parent;
    this.__data__ = datum2;
  }
  EnterNode.prototype = {
    constructor: EnterNode,
    appendChild: function(child) {
      return this._parent.insertBefore(child, this._next);
    },
    insertBefore: function(child, next) {
      return this._parent.insertBefore(child, next);
    },
    querySelector: function(selector) {
      return this._parent.querySelector(selector);
    },
    querySelectorAll: function(selector) {
      return this._parent.querySelectorAll(selector);
    }
  };

  // node_modules/d3-selection/src/constant.js
  function constant_default(x2) {
    return function() {
      return x2;
    };
  }

  // node_modules/d3-selection/src/selection/data.js
  function bindIndex(parent, group, enter2, update, exit2, data) {
    var i = 0, node, groupLength = group.length, dataLength = data.length;
    for (; i < dataLength; ++i) {
      if (node = group[i]) {
        node.__data__ = data[i];
        update[i] = node;
      } else {
        enter2[i] = new EnterNode(parent, data[i]);
      }
    }
    for (; i < groupLength; ++i) {
      if (node = group[i]) {
        exit2[i] = node;
      }
    }
  }
  function bindKey(parent, group, enter2, update, exit2, data, key) {
    var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
    for (i = 0; i < groupLength; ++i) {
      if (node = group[i]) {
        keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
        if (nodeByKeyValue.has(keyValue)) {
          exit2[i] = node;
        } else {
          nodeByKeyValue.set(keyValue, node);
        }
      }
    }
    for (i = 0; i < dataLength; ++i) {
      keyValue = key.call(parent, data[i], i, data) + "";
      if (node = nodeByKeyValue.get(keyValue)) {
        update[i] = node;
        node.__data__ = data[i];
        nodeByKeyValue.delete(keyValue);
      } else {
        enter2[i] = new EnterNode(parent, data[i]);
      }
    }
    for (i = 0; i < groupLength; ++i) {
      if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
        exit2[i] = node;
      }
    }
  }
  function datum(node) {
    return node.__data__;
  }
  function data_default(value, key) {
    if (!arguments.length) return Array.from(this, datum);
    var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
    if (typeof value !== "function") value = constant_default(value);
    for (var m = groups.length, update = new Array(m), enter2 = new Array(m), exit2 = new Array(m), j = 0; j < m; ++j) {
      var parent = parents[j], group = groups[j], groupLength = group.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter2[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit2[j] = new Array(groupLength);
      bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);
      for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
        if (previous = enterGroup[i0]) {
          if (i0 >= i1) i1 = i0 + 1;
          while (!(next = updateGroup[i1]) && ++i1 < dataLength) ;
          previous._next = next || null;
        }
      }
    }
    update = new Selection(update, parents);
    update._enter = enter2;
    update._exit = exit2;
    return update;
  }
  function arraylike(data) {
    return typeof data === "object" && "length" in data ? data : Array.from(data);
  }

  // node_modules/d3-selection/src/selection/exit.js
  function exit_default() {
    return new Selection(this._exit || this._groups.map(sparse_default), this._parents);
  }

  // node_modules/d3-selection/src/selection/join.js
  function join_default(onenter, onupdate, onexit) {
    var enter2 = this.enter(), update = this, exit2 = this.exit();
    if (typeof onenter === "function") {
      enter2 = onenter(enter2);
      if (enter2) enter2 = enter2.selection();
    } else {
      enter2 = enter2.append(onenter + "");
    }
    if (onupdate != null) {
      update = onupdate(update);
      if (update) update = update.selection();
    }
    if (onexit == null) exit2.remove();
    else onexit(exit2);
    return enter2 && update ? enter2.merge(update).order() : update;
  }

  // node_modules/d3-selection/src/selection/merge.js
  function merge_default(context) {
    var selection2 = context.selection ? context.selection() : context;
    for (var groups0 = this._groups, groups1 = selection2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge2 = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge2[i] = node;
        }
      }
    }
    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }
    return new Selection(merges, this._parents);
  }

  // node_modules/d3-selection/src/selection/order.js
  function order_default() {
    for (var groups = this._groups, j = -1, m = groups.length; ++j < m; ) {
      for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
        if (node = group[i]) {
          if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }
    return this;
  }

  // node_modules/d3-selection/src/selection/sort.js
  function sort_default(compare) {
    if (!compare) compare = ascending;
    function compareNode(a, b) {
      return a && b ? compare(a.__data__, b.__data__) : !a - !b;
    }
    for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          sortgroup[i] = node;
        }
      }
      sortgroup.sort(compareNode);
    }
    return new Selection(sortgroups, this._parents).order();
  }
  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  // node_modules/d3-selection/src/selection/call.js
  function call_default() {
    var callback = arguments[0];
    arguments[0] = this;
    callback.apply(null, arguments);
    return this;
  }

  // node_modules/d3-selection/src/selection/nodes.js
  function nodes_default() {
    return Array.from(this);
  }

  // node_modules/d3-selection/src/selection/node.js
  function node_default() {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
        var node = group[i];
        if (node) return node;
      }
    }
    return null;
  }

  // node_modules/d3-selection/src/selection/size.js
  function size_default() {
    let size2 = 0;
    for (const node of this) ++size2;
    return size2;
  }

  // node_modules/d3-selection/src/selection/empty.js
  function empty_default() {
    return !this.node();
  }

  // node_modules/d3-selection/src/selection/each.js
  function each_default(callback) {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) callback.call(node, node.__data__, i, group);
      }
    }
    return this;
  }

  // node_modules/d3-selection/src/selection/attr.js
  function attrRemove(name) {
    return function() {
      this.removeAttribute(name);
    };
  }
  function attrRemoveNS(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }
  function attrConstant(name, value) {
    return function() {
      this.setAttribute(name, value);
    };
  }
  function attrConstantNS(fullname, value) {
    return function() {
      this.setAttributeNS(fullname.space, fullname.local, value);
    };
  }
  function attrFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttribute(name);
      else this.setAttribute(name, v);
    };
  }
  function attrFunctionNS(fullname, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
      else this.setAttributeNS(fullname.space, fullname.local, v);
    };
  }
  function attr_default(name, value) {
    var fullname = namespace_default(name);
    if (arguments.length < 2) {
      var node = this.node();
      return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
    }
    return this.each((value == null ? fullname.local ? attrRemoveNS : attrRemove : typeof value === "function" ? fullname.local ? attrFunctionNS : attrFunction : fullname.local ? attrConstantNS : attrConstant)(fullname, value));
  }

  // node_modules/d3-selection/src/window.js
  function window_default(node) {
    return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
  }

  // node_modules/d3-selection/src/selection/style.js
  function styleRemove(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }
  function styleConstant(name, value, priority) {
    return function() {
      this.style.setProperty(name, value, priority);
    };
  }
  function styleFunction(name, value, priority) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.style.removeProperty(name);
      else this.style.setProperty(name, v, priority);
    };
  }
  function style_default(name, value, priority) {
    return arguments.length > 1 ? this.each((value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
  }
  function styleValue(node, name) {
    return node.style.getPropertyValue(name) || window_default(node).getComputedStyle(node, null).getPropertyValue(name);
  }

  // node_modules/d3-selection/src/selection/property.js
  function propertyRemove(name) {
    return function() {
      delete this[name];
    };
  }
  function propertyConstant(name, value) {
    return function() {
      this[name] = value;
    };
  }
  function propertyFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) delete this[name];
      else this[name] = v;
    };
  }
  function property_default(name, value) {
    return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
  }

  // node_modules/d3-selection/src/selection/classed.js
  function classArray(string) {
    return string.trim().split(/^|\s+/);
  }
  function classList(node) {
    return node.classList || new ClassList(node);
  }
  function ClassList(node) {
    this._node = node;
    this._names = classArray(node.getAttribute("class") || "");
  }
  ClassList.prototype = {
    add: function(name) {
      var i = this._names.indexOf(name);
      if (i < 0) {
        this._names.push(name);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    remove: function(name) {
      var i = this._names.indexOf(name);
      if (i >= 0) {
        this._names.splice(i, 1);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    contains: function(name) {
      return this._names.indexOf(name) >= 0;
    }
  };
  function classedAdd(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.add(names[i]);
  }
  function classedRemove(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.remove(names[i]);
  }
  function classedTrue(names) {
    return function() {
      classedAdd(this, names);
    };
  }
  function classedFalse(names) {
    return function() {
      classedRemove(this, names);
    };
  }
  function classedFunction(names, value) {
    return function() {
      (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
    };
  }
  function classed_default(name, value) {
    var names = classArray(name + "");
    if (arguments.length < 2) {
      var list = classList(this.node()), i = -1, n = names.length;
      while (++i < n) if (!list.contains(names[i])) return false;
      return true;
    }
    return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
  }

  // node_modules/d3-selection/src/selection/text.js
  function textRemove() {
    this.textContent = "";
  }
  function textConstant(value) {
    return function() {
      this.textContent = value;
    };
  }
  function textFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    };
  }
  function text_default(value) {
    return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value)) : this.node().textContent;
  }

  // node_modules/d3-selection/src/selection/html.js
  function htmlRemove() {
    this.innerHTML = "";
  }
  function htmlConstant(value) {
    return function() {
      this.innerHTML = value;
    };
  }
  function htmlFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    };
  }
  function html_default(value) {
    return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
  }

  // node_modules/d3-selection/src/selection/raise.js
  function raise() {
    if (this.nextSibling) this.parentNode.appendChild(this);
  }
  function raise_default() {
    return this.each(raise);
  }

  // node_modules/d3-selection/src/selection/lower.js
  function lower() {
    if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
  }
  function lower_default() {
    return this.each(lower);
  }

  // node_modules/d3-selection/src/selection/append.js
  function append_default(name) {
    var create2 = typeof name === "function" ? name : creator_default(name);
    return this.select(function() {
      return this.appendChild(create2.apply(this, arguments));
    });
  }

  // node_modules/d3-selection/src/selection/insert.js
  function constantNull() {
    return null;
  }
  function insert_default(name, before) {
    var create2 = typeof name === "function" ? name : creator_default(name), select = before == null ? constantNull : typeof before === "function" ? before : selector_default(before);
    return this.select(function() {
      return this.insertBefore(create2.apply(this, arguments), select.apply(this, arguments) || null);
    });
  }

  // node_modules/d3-selection/src/selection/remove.js
  function remove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }
  function remove_default() {
    return this.each(remove);
  }

  // node_modules/d3-selection/src/selection/clone.js
  function selection_cloneShallow() {
    var clone = this.cloneNode(false), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }
  function selection_cloneDeep() {
    var clone = this.cloneNode(true), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }
  function clone_default(deep) {
    return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
  }

  // node_modules/d3-selection/src/selection/datum.js
  function datum_default(value) {
    return arguments.length ? this.property("__data__", value) : this.node().__data__;
  }

  // node_modules/d3-selection/src/selection/on.js
  function contextListener(listener) {
    return function(event) {
      listener.call(this, event, this.__data__);
    };
  }
  function parseTypenames2(typenames) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      return { type: t, name };
    });
  }
  function onRemove(typename) {
    return function() {
      var on = this.__on;
      if (!on) return;
      for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
        if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
        } else {
          on[++i] = o;
        }
      }
      if (++i) on.length = i;
      else delete this.__on;
    };
  }
  function onAdd(typename, value, options) {
    return function() {
      var on = this.__on, o, listener = contextListener(value);
      if (on) for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
          this.addEventListener(o.type, o.listener = listener, o.options = options);
          o.value = value;
          return;
        }
      }
      this.addEventListener(typename.type, listener, options);
      o = { type: typename.type, name: typename.name, value, listener, options };
      if (!on) this.__on = [o];
      else on.push(o);
    };
  }
  function on_default(typename, value, options) {
    var typenames = parseTypenames2(typename + ""), i, n = typenames.length, t;
    if (arguments.length < 2) {
      var on = this.node().__on;
      if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
      return;
    }
    on = value ? onAdd : onRemove;
    for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
    return this;
  }

  // node_modules/d3-selection/src/selection/dispatch.js
  function dispatchEvent(node, type2, params) {
    var window2 = window_default(node), event = window2.CustomEvent;
    if (typeof event === "function") {
      event = new event(type2, params);
    } else {
      event = window2.document.createEvent("Event");
      if (params) event.initEvent(type2, params.bubbles, params.cancelable), event.detail = params.detail;
      else event.initEvent(type2, false, false);
    }
    node.dispatchEvent(event);
  }
  function dispatchConstant(type2, params) {
    return function() {
      return dispatchEvent(this, type2, params);
    };
  }
  function dispatchFunction(type2, params) {
    return function() {
      return dispatchEvent(this, type2, params.apply(this, arguments));
    };
  }
  function dispatch_default2(type2, params) {
    return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type2, params));
  }

  // node_modules/d3-selection/src/selection/iterator.js
  function* iterator_default() {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) yield node;
      }
    }
  }

  // node_modules/d3-selection/src/selection/index.js
  var root = [null];
  function Selection(groups, parents) {
    this._groups = groups;
    this._parents = parents;
  }
  function selection() {
    return new Selection([[document.documentElement]], root);
  }
  function selection_selection() {
    return this;
  }
  Selection.prototype = selection.prototype = {
    constructor: Selection,
    select: select_default,
    selectAll: selectAll_default,
    selectChild: selectChild_default,
    selectChildren: selectChildren_default,
    filter: filter_default,
    data: data_default,
    enter: enter_default,
    exit: exit_default,
    join: join_default,
    merge: merge_default,
    selection: selection_selection,
    order: order_default,
    sort: sort_default,
    call: call_default,
    nodes: nodes_default,
    node: node_default,
    size: size_default,
    empty: empty_default,
    each: each_default,
    attr: attr_default,
    style: style_default,
    property: property_default,
    classed: classed_default,
    text: text_default,
    html: html_default,
    raise: raise_default,
    lower: lower_default,
    append: append_default,
    insert: insert_default,
    remove: remove_default,
    clone: clone_default,
    datum: datum_default,
    on: on_default,
    dispatch: dispatch_default2,
    [Symbol.iterator]: iterator_default
  };
  var selection_default = selection;

  // node_modules/d3-selection/src/select.js
  function select_default2(selector) {
    return typeof selector === "string" ? new Selection([[document.querySelector(selector)]], [document.documentElement]) : new Selection([[selector]], root);
  }

  // node_modules/d3-selection/src/sourceEvent.js
  function sourceEvent_default(event) {
    let sourceEvent;
    while (sourceEvent = event.sourceEvent) event = sourceEvent;
    return event;
  }

  // node_modules/d3-selection/src/pointer.js
  function pointer_default(event, node) {
    event = sourceEvent_default(event);
    if (node === void 0) node = event.currentTarget;
    if (node) {
      var svg2 = node.ownerSVGElement || node;
      if (svg2.createSVGPoint) {
        var point = svg2.createSVGPoint();
        point.x = event.clientX, point.y = event.clientY;
        point = point.matrixTransform(node.getScreenCTM().inverse());
        return [point.x, point.y];
      }
      if (node.getBoundingClientRect) {
        var rect2 = node.getBoundingClientRect();
        return [event.clientX - rect2.left - node.clientLeft, event.clientY - rect2.top - node.clientTop];
      }
    }
    return [event.pageX, event.pageY];
  }

  // node_modules/d3-selection/src/selectAll.js
  function selectAll_default2(selector) {
    return typeof selector === "string" ? new Selection([document.querySelectorAll(selector)], [document.documentElement]) : new Selection([array(selector)], root);
  }

  // node_modules/d3-drag/src/noevent.js
  var nonpassivecapture = { capture: true, passive: false };
  function noevent_default(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  // node_modules/d3-drag/src/nodrag.js
  function nodrag_default(view) {
    var root3 = view.document.documentElement, selection2 = select_default2(view).on("dragstart.drag", noevent_default, nonpassivecapture);
    if ("onselectstart" in root3) {
      selection2.on("selectstart.drag", noevent_default, nonpassivecapture);
    } else {
      root3.__noselect = root3.style.MozUserSelect;
      root3.style.MozUserSelect = "none";
    }
  }
  function yesdrag(view, noclick) {
    var root3 = view.document.documentElement, selection2 = select_default2(view).on("dragstart.drag", null);
    if (noclick) {
      selection2.on("click.drag", noevent_default, nonpassivecapture);
      setTimeout(function() {
        selection2.on("click.drag", null);
      }, 0);
    }
    if ("onselectstart" in root3) {
      selection2.on("selectstart.drag", null);
    } else {
      root3.style.MozUserSelect = root3.__noselect;
      delete root3.__noselect;
    }
  }

  // node_modules/d3-color/src/define.js
  function define_default(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }
  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  // node_modules/d3-color/src/color.js
  function Color() {
  }
  var darker = 0.7;
  var brighter = 1 / darker;
  var reI = "\\s*([+-]?\\d+)\\s*";
  var reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*";
  var reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
  var reHex = /^#([0-9a-f]{3,8})$/;
  var reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`);
  var reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`);
  var reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`);
  var reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`);
  var reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`);
  var reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
  var named = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  };
  define_default(Color, color, {
    copy(channels) {
      return Object.assign(new this.constructor(), this, channels);
    },
    displayable() {
      return this.rgb().displayable();
    },
    hex: color_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: color_formatHex,
    formatHex8: color_formatHex8,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb
  });
  function color_formatHex() {
    return this.rgb().formatHex();
  }
  function color_formatHex8() {
    return this.rgb().formatHex8();
  }
  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }
  function color_formatRgb() {
    return this.rgb().formatRgb();
  }
  function color(format) {
    var m, l;
    format = (format + "").trim().toLowerCase();
    return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
  }
  function rgbn(n) {
    return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
  }
  function rgba(r, g2, b, a) {
    if (a <= 0) r = g2 = b = NaN;
    return new Rgb(r, g2, b, a);
  }
  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb();
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }
  function rgb(r, g2, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g2, b, opacity == null ? 1 : opacity);
  }
  function Rgb(r, g2, b, opacity) {
    this.r = +r;
    this.g = +g2;
    this.b = +b;
    this.opacity = +opacity;
  }
  define_default(Rgb, rgb, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb() {
      return this;
    },
    clamp() {
      return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
    },
    displayable() {
      return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
    },
    hex: rgb_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: rgb_formatHex,
    formatHex8: rgb_formatHex8,
    formatRgb: rgb_formatRgb,
    toString: rgb_formatRgb
  }));
  function rgb_formatHex() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
  }
  function rgb_formatHex8() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
  }
  function rgb_formatRgb() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
  }
  function clampa(opacity) {
    return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
  }
  function clampi(value) {
    return Math.max(0, Math.min(255, Math.round(value) || 0));
  }
  function hex(value) {
    value = clampi(value);
    return (value < 16 ? "0" : "") + value.toString(16);
  }
  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;
    else if (l <= 0 || l >= 1) h = s = NaN;
    else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }
  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl();
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r = o.r / 255, g2 = o.g / 255, b = o.b / 255, min3 = Math.min(r, g2, b), max3 = Math.max(r, g2, b), h = NaN, s = max3 - min3, l = (max3 + min3) / 2;
    if (s) {
      if (r === max3) h = (g2 - b) / s + (g2 < b) * 6;
      else if (g2 === max3) h = (b - r) / s + 2;
      else h = (r - g2) / s + 4;
      s /= l < 0.5 ? max3 + min3 : 2 - max3 - min3;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }
  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }
  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }
  define_default(Hsl, hsl, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb() {
      var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
      return new Rgb(
        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
        hsl2rgb(h, m1, m2),
        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
        this.opacity
      );
    },
    clamp() {
      return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
    },
    displayable() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
    },
    formatHsl() {
      const a = clampa(this.opacity);
      return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
    }
  }));
  function clamph(value) {
    value = (value || 0) % 360;
    return value < 0 ? value + 360 : value;
  }
  function clampt(value) {
    return Math.max(0, Math.min(1, value || 0));
  }
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
  }

  // node_modules/d3-interpolate/src/basis.js
  function basis(t1, v0, v1, v2, v3) {
    var t2 = t1 * t1, t3 = t2 * t1;
    return ((1 - 3 * t1 + 3 * t2 - t3) * v0 + (4 - 6 * t2 + 3 * t3) * v1 + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2 + t3 * v3) / 6;
  }
  function basis_default(values2) {
    var n = values2.length - 1;
    return function(t) {
      var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n), v1 = values2[i], v2 = values2[i + 1], v0 = i > 0 ? values2[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values2[i + 2] : 2 * v2 - v1;
      return basis((t - i / n) * n, v0, v1, v2, v3);
    };
  }

  // node_modules/d3-interpolate/src/basisClosed.js
  function basisClosed_default(values2) {
    var n = values2.length;
    return function(t) {
      var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n), v0 = values2[(i + n - 1) % n], v1 = values2[i % n], v2 = values2[(i + 1) % n], v3 = values2[(i + 2) % n];
      return basis((t - i / n) * n, v0, v1, v2, v3);
    };
  }

  // node_modules/d3-interpolate/src/constant.js
  var constant_default2 = (x2) => () => x2;

  // node_modules/d3-interpolate/src/color.js
  function linear(a, d) {
    return function(t) {
      return a + t * d;
    };
  }
  function exponential(a, b, y2) {
    return a = Math.pow(a, y2), b = Math.pow(b, y2) - a, y2 = 1 / y2, function(t) {
      return Math.pow(a + t * b, y2);
    };
  }
  function gamma(y2) {
    return (y2 = +y2) === 1 ? nogamma : function(a, b) {
      return b - a ? exponential(a, b, y2) : constant_default2(isNaN(a) ? b : a);
    };
  }
  function nogamma(a, b) {
    var d = b - a;
    return d ? linear(a, d) : constant_default2(isNaN(a) ? b : a);
  }

  // node_modules/d3-interpolate/src/rgb.js
  var rgb_default = (function rgbGamma(y2) {
    var color2 = gamma(y2);
    function rgb2(start2, end) {
      var r = color2((start2 = rgb(start2)).r, (end = rgb(end)).r), g2 = color2(start2.g, end.g), b = color2(start2.b, end.b), opacity = nogamma(start2.opacity, end.opacity);
      return function(t) {
        start2.r = r(t);
        start2.g = g2(t);
        start2.b = b(t);
        start2.opacity = opacity(t);
        return start2 + "";
      };
    }
    rgb2.gamma = rgbGamma;
    return rgb2;
  })(1);
  function rgbSpline(spline) {
    return function(colors) {
      var n = colors.length, r = new Array(n), g2 = new Array(n), b = new Array(n), i, color2;
      for (i = 0; i < n; ++i) {
        color2 = rgb(colors[i]);
        r[i] = color2.r || 0;
        g2[i] = color2.g || 0;
        b[i] = color2.b || 0;
      }
      r = spline(r);
      g2 = spline(g2);
      b = spline(b);
      color2.opacity = 1;
      return function(t) {
        color2.r = r(t);
        color2.g = g2(t);
        color2.b = b(t);
        return color2 + "";
      };
    };
  }
  var rgbBasis = rgbSpline(basis_default);
  var rgbBasisClosed = rgbSpline(basisClosed_default);

  // node_modules/d3-interpolate/src/number.js
  function number_default(a, b) {
    return a = +a, b = +b, function(t) {
      return a * (1 - t) + b * t;
    };
  }

  // node_modules/d3-interpolate/src/string.js
  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
  var reB = new RegExp(reA.source, "g");
  function zero(b) {
    return function() {
      return b;
    };
  }
  function one(b) {
    return function(t) {
      return b(t) + "";
    };
  }
  function string_default(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
    a = a + "", b = b + "";
    while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) {
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs;
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) {
        if (s[i]) s[i] += bm;
        else s[++i] = bm;
      } else {
        s[++i] = null;
        q.push({ i, x: number_default(am, bm) });
      }
      bi = reB.lastIndex;
    }
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs;
      else s[++i] = bs;
    }
    return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function(t) {
      for (var i2 = 0, o; i2 < b; ++i2) s[(o = q[i2]).i] = o.x(t);
      return s.join("");
    });
  }

  // node_modules/d3-interpolate/src/transform/decompose.js
  var degrees = 180 / Math.PI;
  var identity = {
    translateX: 0,
    translateY: 0,
    rotate: 0,
    skewX: 0,
    scaleX: 1,
    scaleY: 1
  };
  function decompose_default(a, b, c, d, e, f) {
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
    if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
      translateX: e,
      translateY: f,
      rotate: Math.atan2(b, a) * degrees,
      skewX: Math.atan(skewX) * degrees,
      scaleX,
      scaleY
    };
  }

  // node_modules/d3-interpolate/src/transform/parse.js
  var svgNode;
  function parseCss(value) {
    const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
    return m.isIdentity ? identity : decompose_default(m.a, m.b, m.c, m.d, m.e, m.f);
  }
  function parseSvg(value) {
    if (value == null) return identity;
    if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svgNode.setAttribute("transform", value);
    if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
    value = value.matrix;
    return decompose_default(value.a, value.b, value.c, value.d, value.e, value.f);
  }

  // node_modules/d3-interpolate/src/transform/index.js
  function interpolateTransform(parse, pxComma, pxParen, degParen) {
    function pop(s) {
      return s.length ? s.pop() + " " : "";
    }
    function translate(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push("translate(", null, pxComma, null, pxParen);
        q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
      } else if (xb || yb) {
        s.push("translate(" + xb + pxComma + yb + pxParen);
      }
    }
    function rotate(a, b, s, q) {
      if (a !== b) {
        if (a - b > 180) b += 360;
        else if (b - a > 180) a += 360;
        q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: number_default(a, b) });
      } else if (b) {
        s.push(pop(s) + "rotate(" + b + degParen);
      }
    }
    function skewX(a, b, s, q) {
      if (a !== b) {
        q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: number_default(a, b) });
      } else if (b) {
        s.push(pop(s) + "skewX(" + b + degParen);
      }
    }
    function scale(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push(pop(s) + "scale(", null, ",", null, ")");
        q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
      } else if (xb !== 1 || yb !== 1) {
        s.push(pop(s) + "scale(" + xb + "," + yb + ")");
      }
    }
    return function(a, b) {
      var s = [], q = [];
      a = parse(a), b = parse(b);
      translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
      rotate(a.rotate, b.rotate, s, q);
      skewX(a.skewX, b.skewX, s, q);
      scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
      a = b = null;
      return function(t) {
        var i = -1, n = q.length, o;
        while (++i < n) s[(o = q[i]).i] = o.x(t);
        return s.join("");
      };
    };
  }
  var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
  var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

  // node_modules/d3-interpolate/src/zoom.js
  var epsilon2 = 1e-12;
  function cosh(x2) {
    return ((x2 = Math.exp(x2)) + 1 / x2) / 2;
  }
  function sinh(x2) {
    return ((x2 = Math.exp(x2)) - 1 / x2) / 2;
  }
  function tanh(x2) {
    return ((x2 = Math.exp(2 * x2)) - 1) / (x2 + 1);
  }
  var zoom_default = (function zoomRho(rho, rho2, rho4) {
    function zoom2(p0, p1) {
      var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2], dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
      if (d2 < epsilon2) {
        S = Math.log(w1 / w0) / rho;
        i = function(t) {
          return [
            ux0 + t * dx,
            uy0 + t * dy,
            w0 * Math.exp(rho * t * S)
          ];
        };
      } else {
        var d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1), b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
        S = (r1 - r0) / rho;
        i = function(t) {
          var s = t * S, coshr0 = cosh(r0), u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
          return [
            ux0 + u * dx,
            uy0 + u * dy,
            w0 * coshr0 / cosh(rho * s + r0)
          ];
        };
      }
      i.duration = S * 1e3 * rho / Math.SQRT2;
      return i;
    }
    zoom2.rho = function(_) {
      var _1 = Math.max(1e-3, +_), _2 = _1 * _1, _4 = _2 * _2;
      return zoomRho(_1, _2, _4);
    };
    return zoom2;
  })(Math.SQRT2, 2, 4);

  // node_modules/d3-timer/src/timer.js
  var frame = 0;
  var timeout = 0;
  var interval = 0;
  var pokeDelay = 1e3;
  var taskHead;
  var taskTail;
  var clockLast = 0;
  var clockNow = 0;
  var clockSkew = 0;
  var clock = typeof performance === "object" && performance.now ? performance : Date;
  var setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
    setTimeout(f, 17);
  };
  function now() {
    return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
  }
  function clearNow() {
    clockNow = 0;
  }
  function Timer() {
    this._call = this._time = this._next = null;
  }
  Timer.prototype = timer.prototype = {
    constructor: Timer,
    restart: function(callback, delay, time2) {
      if (typeof callback !== "function") throw new TypeError("callback is not a function");
      time2 = (time2 == null ? now() : +time2) + (delay == null ? 0 : +delay);
      if (!this._next && taskTail !== this) {
        if (taskTail) taskTail._next = this;
        else taskHead = this;
        taskTail = this;
      }
      this._call = callback;
      this._time = time2;
      sleep();
    },
    stop: function() {
      if (this._call) {
        this._call = null;
        this._time = Infinity;
        sleep();
      }
    }
  };
  function timer(callback, delay, time2) {
    var t = new Timer();
    t.restart(callback, delay, time2);
    return t;
  }
  function timerFlush() {
    now();
    ++frame;
    var t = taskHead, e;
    while (t) {
      if ((e = clockNow - t._time) >= 0) t._call.call(void 0, e);
      t = t._next;
    }
    --frame;
  }
  function wake() {
    clockNow = (clockLast = clock.now()) + clockSkew;
    frame = timeout = 0;
    try {
      timerFlush();
    } finally {
      frame = 0;
      nap();
      clockNow = 0;
    }
  }
  function poke() {
    var now3 = clock.now(), delay = now3 - clockLast;
    if (delay > pokeDelay) clockSkew -= delay, clockLast = now3;
  }
  function nap() {
    var t0, t1 = taskHead, t2, time2 = Infinity;
    while (t1) {
      if (t1._call) {
        if (time2 > t1._time) time2 = t1._time;
        t0 = t1, t1 = t1._next;
      } else {
        t2 = t1._next, t1._next = null;
        t1 = t0 ? t0._next = t2 : taskHead = t2;
      }
    }
    taskTail = t0;
    sleep(time2);
  }
  function sleep(time2) {
    if (frame) return;
    if (timeout) timeout = clearTimeout(timeout);
    var delay = time2 - clockNow;
    if (delay > 24) {
      if (time2 < Infinity) timeout = setTimeout(wake, time2 - clock.now() - clockSkew);
      if (interval) interval = clearInterval(interval);
    } else {
      if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
      frame = 1, setFrame(wake);
    }
  }

  // node_modules/d3-timer/src/timeout.js
  function timeout_default(callback, delay, time2) {
    var t = new Timer();
    delay = delay == null ? 0 : +delay;
    t.restart((elapsed) => {
      t.stop();
      callback(elapsed + delay);
    }, delay, time2);
    return t;
  }

  // node_modules/d3-transition/src/transition/schedule.js
  var emptyOn = dispatch_default("start", "end", "cancel", "interrupt");
  var emptyTween = [];
  var CREATED = 0;
  var SCHEDULED = 1;
  var STARTING = 2;
  var STARTED = 3;
  var RUNNING = 4;
  var ENDING = 5;
  var ENDED = 6;
  function schedule_default(node, name, id2, index, group, timing) {
    var schedules = node.__transition;
    if (!schedules) node.__transition = {};
    else if (id2 in schedules) return;
    create(node, id2, {
      name,
      index,
      // For context during callback.
      group,
      // For context during callback.
      on: emptyOn,
      tween: emptyTween,
      time: timing.time,
      delay: timing.delay,
      duration: timing.duration,
      ease: timing.ease,
      timer: null,
      state: CREATED
    });
  }
  function init(node, id2) {
    var schedule = get2(node, id2);
    if (schedule.state > CREATED) throw new Error("too late; already scheduled");
    return schedule;
  }
  function set2(node, id2) {
    var schedule = get2(node, id2);
    if (schedule.state > STARTED) throw new Error("too late; already running");
    return schedule;
  }
  function get2(node, id2) {
    var schedule = node.__transition;
    if (!schedule || !(schedule = schedule[id2])) throw new Error("transition not found");
    return schedule;
  }
  function create(node, id2, self2) {
    var schedules = node.__transition, tween;
    schedules[id2] = self2;
    self2.timer = timer(schedule, 0, self2.time);
    function schedule(elapsed) {
      self2.state = SCHEDULED;
      self2.timer.restart(start2, self2.delay, self2.time);
      if (self2.delay <= elapsed) start2(elapsed - self2.delay);
    }
    function start2(elapsed) {
      var i, j, n, o;
      if (self2.state !== SCHEDULED) return stop();
      for (i in schedules) {
        o = schedules[i];
        if (o.name !== self2.name) continue;
        if (o.state === STARTED) return timeout_default(start2);
        if (o.state === RUNNING) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("interrupt", node, node.__data__, o.index, o.group);
          delete schedules[i];
        } else if (+i < id2) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("cancel", node, node.__data__, o.index, o.group);
          delete schedules[i];
        }
      }
      timeout_default(function() {
        if (self2.state === STARTED) {
          self2.state = RUNNING;
          self2.timer.restart(tick, self2.delay, self2.time);
          tick(elapsed);
        }
      });
      self2.state = STARTING;
      self2.on.call("start", node, node.__data__, self2.index, self2.group);
      if (self2.state !== STARTING) return;
      self2.state = STARTED;
      tween = new Array(n = self2.tween.length);
      for (i = 0, j = -1; i < n; ++i) {
        if (o = self2.tween[i].value.call(node, node.__data__, self2.index, self2.group)) {
          tween[++j] = o;
        }
      }
      tween.length = j + 1;
    }
    function tick(elapsed) {
      var t = elapsed < self2.duration ? self2.ease.call(null, elapsed / self2.duration) : (self2.timer.restart(stop), self2.state = ENDING, 1), i = -1, n = tween.length;
      while (++i < n) {
        tween[i].call(node, t);
      }
      if (self2.state === ENDING) {
        self2.on.call("end", node, node.__data__, self2.index, self2.group);
        stop();
      }
    }
    function stop() {
      self2.state = ENDED;
      self2.timer.stop();
      delete schedules[id2];
      for (var i in schedules) return;
      delete node.__transition;
    }
  }

  // node_modules/d3-transition/src/interrupt.js
  function interrupt_default(node, name) {
    var schedules = node.__transition, schedule, active, empty2 = true, i;
    if (!schedules) return;
    name = name == null ? null : name + "";
    for (i in schedules) {
      if ((schedule = schedules[i]).name !== name) {
        empty2 = false;
        continue;
      }
      active = schedule.state > STARTING && schedule.state < ENDING;
      schedule.state = ENDED;
      schedule.timer.stop();
      schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
      delete schedules[i];
    }
    if (empty2) delete node.__transition;
  }

  // node_modules/d3-transition/src/selection/interrupt.js
  function interrupt_default2(name) {
    return this.each(function() {
      interrupt_default(this, name);
    });
  }

  // node_modules/d3-transition/src/transition/tween.js
  function tweenRemove(id2, name) {
    var tween0, tween1;
    return function() {
      var schedule = set2(this, id2), tween = schedule.tween;
      if (tween !== tween0) {
        tween1 = tween0 = tween;
        for (var i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1 = tween1.slice();
            tween1.splice(i, 1);
            break;
          }
        }
      }
      schedule.tween = tween1;
    };
  }
  function tweenFunction(id2, name, value) {
    var tween0, tween1;
    if (typeof value !== "function") throw new Error();
    return function() {
      var schedule = set2(this, id2), tween = schedule.tween;
      if (tween !== tween0) {
        tween1 = (tween0 = tween).slice();
        for (var t = { name, value }, i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1[i] = t;
            break;
          }
        }
        if (i === n) tween1.push(t);
      }
      schedule.tween = tween1;
    };
  }
  function tween_default(name, value) {
    var id2 = this._id;
    name += "";
    if (arguments.length < 2) {
      var tween = get2(this.node(), id2).tween;
      for (var i = 0, n = tween.length, t; i < n; ++i) {
        if ((t = tween[i]).name === name) {
          return t.value;
        }
      }
      return null;
    }
    return this.each((value == null ? tweenRemove : tweenFunction)(id2, name, value));
  }
  function tweenValue(transition2, name, value) {
    var id2 = transition2._id;
    transition2.each(function() {
      var schedule = set2(this, id2);
      (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
    });
    return function(node) {
      return get2(node, id2).value[name];
    };
  }

  // node_modules/d3-transition/src/transition/interpolate.js
  function interpolate_default(a, b) {
    var c;
    return (typeof b === "number" ? number_default : b instanceof color ? rgb_default : (c = color(b)) ? (b = c, rgb_default) : string_default)(a, b);
  }

  // node_modules/d3-transition/src/transition/attr.js
  function attrRemove2(name) {
    return function() {
      this.removeAttribute(name);
    };
  }
  function attrRemoveNS2(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }
  function attrConstant2(name, interpolate, value1) {
    var string00, string1 = value1 + "", interpolate0;
    return function() {
      var string0 = this.getAttribute(name);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }
  function attrConstantNS2(fullname, interpolate, value1) {
    var string00, string1 = value1 + "", interpolate0;
    return function() {
      var string0 = this.getAttributeNS(fullname.space, fullname.local);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }
  function attrFunction2(name, interpolate, value) {
    var string00, string10, interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttribute(name);
      string0 = this.getAttribute(name);
      string1 = value1 + "";
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }
  function attrFunctionNS2(fullname, interpolate, value) {
    var string00, string10, interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
      string0 = this.getAttributeNS(fullname.space, fullname.local);
      string1 = value1 + "";
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }
  function attr_default2(name, value) {
    var fullname = namespace_default(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate_default;
    return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS2 : attrFunction2)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS2 : attrRemove2)(fullname) : (fullname.local ? attrConstantNS2 : attrConstant2)(fullname, i, value));
  }

  // node_modules/d3-transition/src/transition/attrTween.js
  function attrInterpolate(name, i) {
    return function(t) {
      this.setAttribute(name, i.call(this, t));
    };
  }
  function attrInterpolateNS(fullname, i) {
    return function(t) {
      this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
    };
  }
  function attrTweenNS(fullname, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }
  function attrTween(name, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }
  function attrTween_default(name, value) {
    var key = "attr." + name;
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error();
    var fullname = namespace_default(name);
    return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
  }

  // node_modules/d3-transition/src/transition/delay.js
  function delayFunction(id2, value) {
    return function() {
      init(this, id2).delay = +value.apply(this, arguments);
    };
  }
  function delayConstant(id2, value) {
    return value = +value, function() {
      init(this, id2).delay = value;
    };
  }
  function delay_default(value) {
    var id2 = this._id;
    return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id2, value)) : get2(this.node(), id2).delay;
  }

  // node_modules/d3-transition/src/transition/duration.js
  function durationFunction(id2, value) {
    return function() {
      set2(this, id2).duration = +value.apply(this, arguments);
    };
  }
  function durationConstant(id2, value) {
    return value = +value, function() {
      set2(this, id2).duration = value;
    };
  }
  function duration_default(value) {
    var id2 = this._id;
    return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id2, value)) : get2(this.node(), id2).duration;
  }

  // node_modules/d3-transition/src/transition/ease.js
  function easeConstant(id2, value) {
    if (typeof value !== "function") throw new Error();
    return function() {
      set2(this, id2).ease = value;
    };
  }
  function ease_default(value) {
    var id2 = this._id;
    return arguments.length ? this.each(easeConstant(id2, value)) : get2(this.node(), id2).ease;
  }

  // node_modules/d3-transition/src/transition/easeVarying.js
  function easeVarying(id2, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (typeof v !== "function") throw new Error();
      set2(this, id2).ease = v;
    };
  }
  function easeVarying_default(value) {
    if (typeof value !== "function") throw new Error();
    return this.each(easeVarying(this._id, value));
  }

  // node_modules/d3-transition/src/transition/filter.js
  function filter_default2(match) {
    if (typeof match !== "function") match = matcher_default(match);
    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }
    return new Transition(subgroups, this._parents, this._name, this._id);
  }

  // node_modules/d3-transition/src/transition/merge.js
  function merge_default2(transition2) {
    if (transition2._id !== this._id) throw new Error();
    for (var groups0 = this._groups, groups1 = transition2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge2 = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge2[i] = node;
        }
      }
    }
    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }
    return new Transition(merges, this._parents, this._name, this._id);
  }

  // node_modules/d3-transition/src/transition/on.js
  function start(name) {
    return (name + "").trim().split(/^|\s+/).every(function(t) {
      var i = t.indexOf(".");
      if (i >= 0) t = t.slice(0, i);
      return !t || t === "start";
    });
  }
  function onFunction(id2, name, listener) {
    var on0, on1, sit = start(name) ? init : set2;
    return function() {
      var schedule = sit(this, id2), on = schedule.on;
      if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);
      schedule.on = on1;
    };
  }
  function on_default2(name, listener) {
    var id2 = this._id;
    return arguments.length < 2 ? get2(this.node(), id2).on.on(name) : this.each(onFunction(id2, name, listener));
  }

  // node_modules/d3-transition/src/transition/remove.js
  function removeFunction(id2) {
    return function() {
      var parent = this.parentNode;
      for (var i in this.__transition) if (+i !== id2) return;
      if (parent) parent.removeChild(this);
    };
  }
  function remove_default2() {
    return this.on("end.remove", removeFunction(this._id));
  }

  // node_modules/d3-transition/src/transition/select.js
  function select_default3(select) {
    var name = this._name, id2 = this._id;
    if (typeof select !== "function") select = selector_default(select);
    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
          schedule_default(subgroup[i], name, id2, i, subgroup, get2(node, id2));
        }
      }
    }
    return new Transition(subgroups, this._parents, name, id2);
  }

  // node_modules/d3-transition/src/transition/selectAll.js
  function selectAll_default3(select) {
    var name = this._name, id2 = this._id;
    if (typeof select !== "function") select = selectorAll_default(select);
    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          for (var children2 = select.call(node, node.__data__, i, group), child, inherit2 = get2(node, id2), k = 0, l = children2.length; k < l; ++k) {
            if (child = children2[k]) {
              schedule_default(child, name, id2, k, children2, inherit2);
            }
          }
          subgroups.push(children2);
          parents.push(node);
        }
      }
    }
    return new Transition(subgroups, parents, name, id2);
  }

  // node_modules/d3-transition/src/transition/selection.js
  var Selection2 = selection_default.prototype.constructor;
  function selection_default2() {
    return new Selection2(this._groups, this._parents);
  }

  // node_modules/d3-transition/src/transition/style.js
  function styleNull(name, interpolate) {
    var string00, string10, interpolate0;
    return function() {
      var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate(string00 = string0, string10 = string1);
    };
  }
  function styleRemove2(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }
  function styleConstant2(name, interpolate, value1) {
    var string00, string1 = value1 + "", interpolate0;
    return function() {
      var string0 = styleValue(this, name);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }
  function styleFunction2(name, interpolate, value) {
    var string00, string10, interpolate0;
    return function() {
      var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
      if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }
  function styleMaybeRemove(id2, name) {
    var on0, on1, listener0, key = "style." + name, event = "end." + key, remove2;
    return function() {
      var schedule = set2(this, id2), on = schedule.on, listener = schedule.value[key] == null ? remove2 || (remove2 = styleRemove2(name)) : void 0;
      if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);
      schedule.on = on1;
    };
  }
  function style_default2(name, value, priority) {
    var i = (name += "") === "transform" ? interpolateTransformCss : interpolate_default;
    return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove2(name)) : typeof value === "function" ? this.styleTween(name, styleFunction2(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant2(name, i, value), priority).on("end.style." + name, null);
  }

  // node_modules/d3-transition/src/transition/styleTween.js
  function styleInterpolate(name, i, priority) {
    return function(t) {
      this.style.setProperty(name, i.call(this, t), priority);
    };
  }
  function styleTween(name, value, priority) {
    var t, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
      return t;
    }
    tween._value = value;
    return tween;
  }
  function styleTween_default(name, value, priority) {
    var key = "style." + (name += "");
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error();
    return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
  }

  // node_modules/d3-transition/src/transition/text.js
  function textConstant2(value) {
    return function() {
      this.textContent = value;
    };
  }
  function textFunction2(value) {
    return function() {
      var value1 = value(this);
      this.textContent = value1 == null ? "" : value1;
    };
  }
  function text_default2(value) {
    return this.tween("text", typeof value === "function" ? textFunction2(tweenValue(this, "text", value)) : textConstant2(value == null ? "" : value + ""));
  }

  // node_modules/d3-transition/src/transition/textTween.js
  function textInterpolate(i) {
    return function(t) {
      this.textContent = i.call(this, t);
    };
  }
  function textTween(value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
      return t0;
    }
    tween._value = value;
    return tween;
  }
  function textTween_default(value) {
    var key = "text";
    if (arguments.length < 1) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error();
    return this.tween(key, textTween(value));
  }

  // node_modules/d3-transition/src/transition/transition.js
  function transition_default() {
    var name = this._name, id0 = this._id, id1 = newId();
    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          var inherit2 = get2(node, id0);
          schedule_default(node, name, id1, i, group, {
            time: inherit2.time + inherit2.delay + inherit2.duration,
            delay: 0,
            duration: inherit2.duration,
            ease: inherit2.ease
          });
        }
      }
    }
    return new Transition(groups, this._parents, name, id1);
  }

  // node_modules/d3-transition/src/transition/end.js
  function end_default() {
    var on0, on1, that = this, id2 = that._id, size2 = that.size();
    return new Promise(function(resolve, reject) {
      var cancel = { value: reject }, end = { value: function() {
        if (--size2 === 0) resolve();
      } };
      that.each(function() {
        var schedule = set2(this, id2), on = schedule.on;
        if (on !== on0) {
          on1 = (on0 = on).copy();
          on1._.cancel.push(cancel);
          on1._.interrupt.push(cancel);
          on1._.end.push(end);
        }
        schedule.on = on1;
      });
      if (size2 === 0) resolve();
    });
  }

  // node_modules/d3-transition/src/transition/index.js
  var id = 0;
  function Transition(groups, parents, name, id2) {
    this._groups = groups;
    this._parents = parents;
    this._name = name;
    this._id = id2;
  }
  function transition(name) {
    return selection_default().transition(name);
  }
  function newId() {
    return ++id;
  }
  var selection_prototype = selection_default.prototype;
  Transition.prototype = transition.prototype = {
    constructor: Transition,
    select: select_default3,
    selectAll: selectAll_default3,
    selectChild: selection_prototype.selectChild,
    selectChildren: selection_prototype.selectChildren,
    filter: filter_default2,
    merge: merge_default2,
    selection: selection_default2,
    transition: transition_default,
    call: selection_prototype.call,
    nodes: selection_prototype.nodes,
    node: selection_prototype.node,
    size: selection_prototype.size,
    empty: selection_prototype.empty,
    each: selection_prototype.each,
    on: on_default2,
    attr: attr_default2,
    attrTween: attrTween_default,
    style: style_default2,
    styleTween: styleTween_default,
    text: text_default2,
    textTween: textTween_default,
    remove: remove_default2,
    tween: tween_default,
    delay: delay_default,
    duration: duration_default,
    ease: ease_default,
    easeVarying: easeVarying_default,
    end: end_default,
    [Symbol.iterator]: selection_prototype[Symbol.iterator]
  };

  // node_modules/d3-ease/src/cubic.js
  function cubicInOut(t) {
    return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
  }

  // node_modules/d3-transition/src/selection/transition.js
  var defaultTiming = {
    time: null,
    // Set on use.
    delay: 0,
    duration: 250,
    ease: cubicInOut
  };
  function inherit(node, id2) {
    var timing;
    while (!(timing = node.__transition) || !(timing = timing[id2])) {
      if (!(node = node.parentNode)) {
        throw new Error(`transition ${id2} not found`);
      }
    }
    return timing;
  }
  function transition_default2(name) {
    var id2, timing;
    if (name instanceof Transition) {
      id2 = name._id, name = name._name;
    } else {
      id2 = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
    }
    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          schedule_default(node, name, id2, i, group, timing || inherit(node, id2));
        }
      }
    }
    return new Transition(groups, this._parents, name, id2);
  }

  // node_modules/d3-transition/src/selection/index.js
  selection_default.prototype.interrupt = interrupt_default2;
  selection_default.prototype.transition = transition_default2;

  // node_modules/d3-brush/src/brush.js
  var { abs, max, min } = Math;
  function number1(e) {
    return [+e[0], +e[1]];
  }
  function number2(e) {
    return [number1(e[0]), number1(e[1])];
  }
  var X = {
    name: "x",
    handles: ["w", "e"].map(type),
    input: function(x2, e) {
      return x2 == null ? null : [[+x2[0], e[0][1]], [+x2[1], e[1][1]]];
    },
    output: function(xy) {
      return xy && [xy[0][0], xy[1][0]];
    }
  };
  var Y = {
    name: "y",
    handles: ["n", "s"].map(type),
    input: function(y2, e) {
      return y2 == null ? null : [[e[0][0], +y2[0]], [e[1][0], +y2[1]]];
    },
    output: function(xy) {
      return xy && [xy[0][1], xy[1][1]];
    }
  };
  var XY = {
    name: "xy",
    handles: ["n", "w", "e", "s", "nw", "ne", "sw", "se"].map(type),
    input: function(xy) {
      return xy == null ? null : number2(xy);
    },
    output: function(xy) {
      return xy;
    }
  };
  function type(t) {
    return { type: t };
  }

  // node_modules/d3-path/src/path.js
  var pi = Math.PI;
  var tau = 2 * pi;
  var epsilon = 1e-6;
  var tauEpsilon = tau - epsilon;
  function append(strings) {
    this._ += strings[0];
    for (let i = 1, n = strings.length; i < n; ++i) {
      this._ += arguments[i] + strings[i];
    }
  }
  function appendRound(digits) {
    let d = Math.floor(digits);
    if (!(d >= 0)) throw new Error(`invalid digits: ${digits}`);
    if (d > 15) return append;
    const k = 10 ** d;
    return function(strings) {
      this._ += strings[0];
      for (let i = 1, n = strings.length; i < n; ++i) {
        this._ += Math.round(arguments[i] * k) / k + strings[i];
      }
    };
  }
  var Path = class {
    constructor(digits) {
      this._x0 = this._y0 = // start of current subpath
      this._x1 = this._y1 = null;
      this._ = "";
      this._append = digits == null ? append : appendRound(digits);
    }
    moveTo(x2, y2) {
      this._append`M${this._x0 = this._x1 = +x2},${this._y0 = this._y1 = +y2}`;
    }
    closePath() {
      if (this._x1 !== null) {
        this._x1 = this._x0, this._y1 = this._y0;
        this._append`Z`;
      }
    }
    lineTo(x2, y2) {
      this._append`L${this._x1 = +x2},${this._y1 = +y2}`;
    }
    quadraticCurveTo(x1, y1, x2, y2) {
      this._append`Q${+x1},${+y1},${this._x1 = +x2},${this._y1 = +y2}`;
    }
    bezierCurveTo(x1, y1, x2, y2, x3, y3) {
      this._append`C${+x1},${+y1},${+x2},${+y2},${this._x1 = +x3},${this._y1 = +y3}`;
    }
    arcTo(x1, y1, x2, y2, r) {
      x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
      if (r < 0) throw new Error(`negative radius: ${r}`);
      let x0 = this._x1, y0 = this._y1, x21 = x2 - x1, y21 = y2 - y1, x01 = x0 - x1, y01 = y0 - y1, l01_2 = x01 * x01 + y01 * y01;
      if (this._x1 === null) {
        this._append`M${this._x1 = x1},${this._y1 = y1}`;
      } else if (!(l01_2 > epsilon)) ;
      else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
        this._append`L${this._x1 = x1},${this._y1 = y1}`;
      } else {
        let x20 = x2 - x0, y20 = y2 - y0, l21_2 = x21 * x21 + y21 * y21, l20_2 = x20 * x20 + y20 * y20, l21 = Math.sqrt(l21_2), l01 = Math.sqrt(l01_2), l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2), t01 = l / l01, t21 = l / l21;
        if (Math.abs(t01 - 1) > epsilon) {
          this._append`L${x1 + t01 * x01},${y1 + t01 * y01}`;
        }
        this._append`A${r},${r},0,0,${+(y01 * x20 > x01 * y20)},${this._x1 = x1 + t21 * x21},${this._y1 = y1 + t21 * y21}`;
      }
    }
    arc(x2, y2, r, a0, a1, ccw) {
      x2 = +x2, y2 = +y2, r = +r, ccw = !!ccw;
      if (r < 0) throw new Error(`negative radius: ${r}`);
      let dx = r * Math.cos(a0), dy = r * Math.sin(a0), x0 = x2 + dx, y0 = y2 + dy, cw = 1 ^ ccw, da = ccw ? a0 - a1 : a1 - a0;
      if (this._x1 === null) {
        this._append`M${x0},${y0}`;
      } else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) {
        this._append`L${x0},${y0}`;
      }
      if (!r) return;
      if (da < 0) da = da % tau + tau;
      if (da > tauEpsilon) {
        this._append`A${r},${r},0,1,${cw},${x2 - dx},${y2 - dy}A${r},${r},0,1,${cw},${this._x1 = x0},${this._y1 = y0}`;
      } else if (da > epsilon) {
        this._append`A${r},${r},0,${+(da >= pi)},${cw},${this._x1 = x2 + r * Math.cos(a1)},${this._y1 = y2 + r * Math.sin(a1)}`;
      }
    }
    rect(x2, y2, w, h) {
      this._append`M${this._x0 = this._x1 = +x2},${this._y0 = this._y1 = +y2}h${w = +w}v${+h}h${-w}Z`;
    }
    toString() {
      return this._;
    }
  };
  function path() {
    return new Path();
  }
  path.prototype = Path.prototype;

  // node_modules/d3-fetch/src/text.js
  function responseText(response) {
    if (!response.ok) throw new Error(response.status + " " + response.statusText);
    return response.text();
  }
  function text_default3(input, init2) {
    return fetch(input, init2).then(responseText);
  }

  // node_modules/d3-fetch/src/xml.js
  function parser(type2) {
    return (input, init2) => text_default3(input, init2).then((text) => new DOMParser().parseFromString(text, type2));
  }
  var xml_default = parser("application/xml");
  var html = parser("text/html");
  var svg = parser("image/svg+xml");

  // node_modules/d3-shape/src/constant.js
  function constant_default4(x2) {
    return function constant2() {
      return x2;
    };
  }

  // node_modules/d3-shape/src/path.js
  function withPath(shape) {
    let digits = 3;
    shape.digits = function(_) {
      if (!arguments.length) return digits;
      if (_ == null) {
        digits = null;
      } else {
        const d = Math.floor(_);
        if (!(d >= 0)) throw new RangeError(`invalid digits: ${_}`);
        digits = d;
      }
      return shape;
    };
    return () => new Path(digits);
  }

  // node_modules/d3-shape/src/array.js
  var slice = Array.prototype.slice;
  function array_default(x2) {
    return typeof x2 === "object" && "length" in x2 ? x2 : Array.from(x2);
  }

  // node_modules/d3-shape/src/curve/linear.js
  function Linear(context) {
    this._context = context;
  }
  Linear.prototype = {
    areaStart: function() {
      this._line = 0;
    },
    areaEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._point = 0;
    },
    lineEnd: function() {
      if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
      this._line = 1 - this._line;
    },
    point: function(x2, y2) {
      x2 = +x2, y2 = +y2;
      switch (this._point) {
        case 0:
          this._point = 1;
          this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
          break;
        case 1:
          this._point = 2;
        // falls through
        default:
          this._context.lineTo(x2, y2);
          break;
      }
    }
  };
  function linear_default(context) {
    return new Linear(context);
  }

  // node_modules/d3-shape/src/point.js
  function x(p) {
    return p[0];
  }
  function y(p) {
    return p[1];
  }

  // node_modules/d3-shape/src/line.js
  function line_default(x2, y2) {
    var defined = constant_default4(true), context = null, curve = linear_default, output = null, path2 = withPath(line);
    x2 = typeof x2 === "function" ? x2 : x2 === void 0 ? x : constant_default4(x2);
    y2 = typeof y2 === "function" ? y2 : y2 === void 0 ? y : constant_default4(y2);
    function line(data) {
      var i, n = (data = array_default(data)).length, d, defined0 = false, buffer;
      if (context == null) output = curve(buffer = path2());
      for (i = 0; i <= n; ++i) {
        if (!(i < n && defined(d = data[i], i, data)) === defined0) {
          if (defined0 = !defined0) output.lineStart();
          else output.lineEnd();
        }
        if (defined0) output.point(+x2(d, i, data), +y2(d, i, data));
      }
      if (buffer) return output = null, buffer + "" || null;
    }
    line.x = function(_) {
      return arguments.length ? (x2 = typeof _ === "function" ? _ : constant_default4(+_), line) : x2;
    };
    line.y = function(_) {
      return arguments.length ? (y2 = typeof _ === "function" ? _ : constant_default4(+_), line) : y2;
    };
    line.defined = function(_) {
      return arguments.length ? (defined = typeof _ === "function" ? _ : constant_default4(!!_), line) : defined;
    };
    line.curve = function(_) {
      return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
    };
    line.context = function(_) {
      return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
    };
    return line;
  }

  // node_modules/d3-zoom/src/constant.js
  var constant_default5 = (x2) => () => x2;

  // node_modules/d3-zoom/src/event.js
  function ZoomEvent(type2, {
    sourceEvent,
    target,
    transform: transform2,
    dispatch: dispatch2
  }) {
    Object.defineProperties(this, {
      type: { value: type2, enumerable: true, configurable: true },
      sourceEvent: { value: sourceEvent, enumerable: true, configurable: true },
      target: { value: target, enumerable: true, configurable: true },
      transform: { value: transform2, enumerable: true, configurable: true },
      _: { value: dispatch2 }
    });
  }

  // node_modules/d3-zoom/src/transform.js
  function Transform(k, x2, y2) {
    this.k = k;
    this.x = x2;
    this.y = y2;
  }
  Transform.prototype = {
    constructor: Transform,
    scale: function(k) {
      return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
    },
    translate: function(x2, y2) {
      return x2 === 0 & y2 === 0 ? this : new Transform(this.k, this.x + this.k * x2, this.y + this.k * y2);
    },
    apply: function(point) {
      return [point[0] * this.k + this.x, point[1] * this.k + this.y];
    },
    applyX: function(x2) {
      return x2 * this.k + this.x;
    },
    applyY: function(y2) {
      return y2 * this.k + this.y;
    },
    invert: function(location2) {
      return [(location2[0] - this.x) / this.k, (location2[1] - this.y) / this.k];
    },
    invertX: function(x2) {
      return (x2 - this.x) / this.k;
    },
    invertY: function(y2) {
      return (y2 - this.y) / this.k;
    },
    rescaleX: function(x2) {
      return x2.copy().domain(x2.range().map(this.invertX, this).map(x2.invert, x2));
    },
    rescaleY: function(y2) {
      return y2.copy().domain(y2.range().map(this.invertY, this).map(y2.invert, y2));
    },
    toString: function() {
      return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
    }
  };
  var identity2 = new Transform(1, 0, 0);
  transform.prototype = Transform.prototype;
  function transform(node) {
    while (!node.__zoom) if (!(node = node.parentNode)) return identity2;
    return node.__zoom;
  }

  // node_modules/d3-zoom/src/noevent.js
  function nopropagation2(event) {
    event.stopImmediatePropagation();
  }
  function noevent_default3(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  // node_modules/d3-zoom/src/zoom.js
  function defaultFilter(event) {
    return (!event.ctrlKey || event.type === "wheel") && !event.button;
  }
  function defaultExtent() {
    var e = this;
    if (e instanceof SVGElement) {
      e = e.ownerSVGElement || e;
      if (e.hasAttribute("viewBox")) {
        e = e.viewBox.baseVal;
        return [[e.x, e.y], [e.x + e.width, e.y + e.height]];
      }
      return [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]];
    }
    return [[0, 0], [e.clientWidth, e.clientHeight]];
  }
  function defaultTransform() {
    return this.__zoom || identity2;
  }
  function defaultWheelDelta(event) {
    return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 2e-3) * (event.ctrlKey ? 10 : 1);
  }
  function defaultTouchable() {
    return navigator.maxTouchPoints || "ontouchstart" in this;
  }
  function defaultConstrain(transform2, extent, translateExtent) {
    var dx0 = transform2.invertX(extent[0][0]) - translateExtent[0][0], dx1 = transform2.invertX(extent[1][0]) - translateExtent[1][0], dy0 = transform2.invertY(extent[0][1]) - translateExtent[0][1], dy1 = transform2.invertY(extent[1][1]) - translateExtent[1][1];
    return transform2.translate(
      dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
      dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
    );
  }
  function zoom_default2() {
    var filter3 = defaultFilter, extent = defaultExtent, constrain = defaultConstrain, wheelDelta = defaultWheelDelta, touchable = defaultTouchable, scaleExtent = [0, Infinity], translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]], duration = 250, interpolate = zoom_default, listeners = dispatch_default("start", "zoom", "end"), touchstarting, touchfirst, touchending, touchDelay = 500, wheelDelay = 150, clickDistance2 = 0, tapDistance = 10;
    function zoom2(selection2) {
      selection2.property("__zoom", defaultTransform).on("wheel.zoom", wheeled, { passive: false }).on("mousedown.zoom", mousedowned).on("dblclick.zoom", dblclicked).filter(touchable).on("touchstart.zoom", touchstarted).on("touchmove.zoom", touchmoved).on("touchend.zoom touchcancel.zoom", touchended).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
    }
    zoom2.transform = function(collection, transform2, point, event) {
      var selection2 = collection.selection ? collection.selection() : collection;
      selection2.property("__zoom", defaultTransform);
      if (collection !== selection2) {
        schedule(collection, transform2, point, event);
      } else {
        selection2.interrupt().each(function() {
          gesture(this, arguments).event(event).start().zoom(null, typeof transform2 === "function" ? transform2.apply(this, arguments) : transform2).end();
        });
      }
    };
    zoom2.scaleBy = function(selection2, k, p, event) {
      zoom2.scaleTo(selection2, function() {
        var k0 = this.__zoom.k, k1 = typeof k === "function" ? k.apply(this, arguments) : k;
        return k0 * k1;
      }, p, event);
    };
    zoom2.scaleTo = function(selection2, k, p, event) {
      zoom2.transform(selection2, function() {
        var e = extent.apply(this, arguments), t0 = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p, p1 = t0.invert(p0), k1 = typeof k === "function" ? k.apply(this, arguments) : k;
        return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent);
      }, p, event);
    };
    zoom2.translateBy = function(selection2, x2, y2, event) {
      zoom2.transform(selection2, function() {
        return constrain(this.__zoom.translate(
          typeof x2 === "function" ? x2.apply(this, arguments) : x2,
          typeof y2 === "function" ? y2.apply(this, arguments) : y2
        ), extent.apply(this, arguments), translateExtent);
      }, null, event);
    };
    zoom2.translateTo = function(selection2, x2, y2, p, event) {
      zoom2.transform(selection2, function() {
        var e = extent.apply(this, arguments), t = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p;
        return constrain(identity2.translate(p0[0], p0[1]).scale(t.k).translate(
          typeof x2 === "function" ? -x2.apply(this, arguments) : -x2,
          typeof y2 === "function" ? -y2.apply(this, arguments) : -y2
        ), e, translateExtent);
      }, p, event);
    };
    function scale(transform2, k) {
      k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
      return k === transform2.k ? transform2 : new Transform(k, transform2.x, transform2.y);
    }
    function translate(transform2, p0, p1) {
      var x2 = p0[0] - p1[0] * transform2.k, y2 = p0[1] - p1[1] * transform2.k;
      return x2 === transform2.x && y2 === transform2.y ? transform2 : new Transform(transform2.k, x2, y2);
    }
    function centroid(extent2) {
      return [(+extent2[0][0] + +extent2[1][0]) / 2, (+extent2[0][1] + +extent2[1][1]) / 2];
    }
    function schedule(transition2, transform2, point, event) {
      transition2.on("start.zoom", function() {
        gesture(this, arguments).event(event).start();
      }).on("interrupt.zoom end.zoom", function() {
        gesture(this, arguments).event(event).end();
      }).tween("zoom", function() {
        var that = this, args = arguments, g2 = gesture(that, args).event(event), e = extent.apply(that, args), p = point == null ? centroid(e) : typeof point === "function" ? point.apply(that, args) : point, w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]), a = that.__zoom, b = typeof transform2 === "function" ? transform2.apply(that, args) : transform2, i = interpolate(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
        return function(t) {
          if (t === 1) t = b;
          else {
            var l = i(t), k = w / l[2];
            t = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k);
          }
          g2.zoom(null, t);
        };
      });
    }
    function gesture(that, args, clean) {
      return !clean && that.__zooming || new Gesture(that, args);
    }
    function Gesture(that, args) {
      this.that = that;
      this.args = args;
      this.active = 0;
      this.sourceEvent = null;
      this.extent = extent.apply(that, args);
      this.taps = 0;
    }
    Gesture.prototype = {
      event: function(event) {
        if (event) this.sourceEvent = event;
        return this;
      },
      start: function() {
        if (++this.active === 1) {
          this.that.__zooming = this;
          this.emit("start");
        }
        return this;
      },
      zoom: function(key, transform2) {
        if (this.mouse && key !== "mouse") this.mouse[1] = transform2.invert(this.mouse[0]);
        if (this.touch0 && key !== "touch") this.touch0[1] = transform2.invert(this.touch0[0]);
        if (this.touch1 && key !== "touch") this.touch1[1] = transform2.invert(this.touch1[0]);
        this.that.__zoom = transform2;
        this.emit("zoom");
        return this;
      },
      end: function() {
        if (--this.active === 0) {
          delete this.that.__zooming;
          this.emit("end");
        }
        return this;
      },
      emit: function(type2) {
        var d = select_default2(this.that).datum();
        listeners.call(
          type2,
          this.that,
          new ZoomEvent(type2, {
            sourceEvent: this.sourceEvent,
            target: zoom2,
            type: type2,
            transform: this.that.__zoom,
            dispatch: listeners
          }),
          d
        );
      }
    };
    function wheeled(event, ...args) {
      if (!filter3.apply(this, arguments)) return;
      var g2 = gesture(this, args).event(event), t = this.__zoom, k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments)))), p = pointer_default(event);
      if (g2.wheel) {
        if (g2.mouse[0][0] !== p[0] || g2.mouse[0][1] !== p[1]) {
          g2.mouse[1] = t.invert(g2.mouse[0] = p);
        }
        clearTimeout(g2.wheel);
      } else if (t.k === k) return;
      else {
        g2.mouse = [p, t.invert(p)];
        interrupt_default(this);
        g2.start();
      }
      noevent_default3(event);
      g2.wheel = setTimeout(wheelidled, wheelDelay);
      g2.zoom("mouse", constrain(translate(scale(t, k), g2.mouse[0], g2.mouse[1]), g2.extent, translateExtent));
      function wheelidled() {
        g2.wheel = null;
        g2.end();
      }
    }
    function mousedowned(event, ...args) {
      if (touchending || !filter3.apply(this, arguments)) return;
      var currentTarget = event.currentTarget, g2 = gesture(this, args, true).event(event), v = select_default2(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true), p = pointer_default(event, currentTarget), x0 = event.clientX, y0 = event.clientY;
      nodrag_default(event.view);
      nopropagation2(event);
      g2.mouse = [p, this.__zoom.invert(p)];
      interrupt_default(this);
      g2.start();
      function mousemoved(event2) {
        noevent_default3(event2);
        if (!g2.moved) {
          var dx = event2.clientX - x0, dy = event2.clientY - y0;
          g2.moved = dx * dx + dy * dy > clickDistance2;
        }
        g2.event(event2).zoom("mouse", constrain(translate(g2.that.__zoom, g2.mouse[0] = pointer_default(event2, currentTarget), g2.mouse[1]), g2.extent, translateExtent));
      }
      function mouseupped(event2) {
        v.on("mousemove.zoom mouseup.zoom", null);
        yesdrag(event2.view, g2.moved);
        noevent_default3(event2);
        g2.event(event2).end();
      }
    }
    function dblclicked(event, ...args) {
      if (!filter3.apply(this, arguments)) return;
      var t0 = this.__zoom, p0 = pointer_default(event.changedTouches ? event.changedTouches[0] : event, this), p1 = t0.invert(p0), k1 = t0.k * (event.shiftKey ? 0.5 : 2), t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, args), translateExtent);
      noevent_default3(event);
      if (duration > 0) select_default2(this).transition().duration(duration).call(schedule, t1, p0, event);
      else select_default2(this).call(zoom2.transform, t1, p0, event);
    }
    function touchstarted(event, ...args) {
      if (!filter3.apply(this, arguments)) return;
      var touches = event.touches, n = touches.length, g2 = gesture(this, args, event.changedTouches.length === n).event(event), started, i, t, p;
      nopropagation2(event);
      for (i = 0; i < n; ++i) {
        t = touches[i], p = pointer_default(t, this);
        p = [p, this.__zoom.invert(p), t.identifier];
        if (!g2.touch0) g2.touch0 = p, started = true, g2.taps = 1 + !!touchstarting;
        else if (!g2.touch1 && g2.touch0[2] !== p[2]) g2.touch1 = p, g2.taps = 0;
      }
      if (touchstarting) touchstarting = clearTimeout(touchstarting);
      if (started) {
        if (g2.taps < 2) touchfirst = p[0], touchstarting = setTimeout(function() {
          touchstarting = null;
        }, touchDelay);
        interrupt_default(this);
        g2.start();
      }
    }
    function touchmoved(event, ...args) {
      if (!this.__zooming) return;
      var g2 = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t, p, l;
      noevent_default3(event);
      for (i = 0; i < n; ++i) {
        t = touches[i], p = pointer_default(t, this);
        if (g2.touch0 && g2.touch0[2] === t.identifier) g2.touch0[0] = p;
        else if (g2.touch1 && g2.touch1[2] === t.identifier) g2.touch1[0] = p;
      }
      t = g2.that.__zoom;
      if (g2.touch1) {
        var p0 = g2.touch0[0], l0 = g2.touch0[1], p1 = g2.touch1[0], l1 = g2.touch1[1], dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp, dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
        t = scale(t, Math.sqrt(dp / dl));
        p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
        l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
      } else if (g2.touch0) p = g2.touch0[0], l = g2.touch0[1];
      else return;
      g2.zoom("touch", constrain(translate(t, p, l), g2.extent, translateExtent));
    }
    function touchended(event, ...args) {
      if (!this.__zooming) return;
      var g2 = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t;
      nopropagation2(event);
      if (touchending) clearTimeout(touchending);
      touchending = setTimeout(function() {
        touchending = null;
      }, touchDelay);
      for (i = 0; i < n; ++i) {
        t = touches[i];
        if (g2.touch0 && g2.touch0[2] === t.identifier) delete g2.touch0;
        else if (g2.touch1 && g2.touch1[2] === t.identifier) delete g2.touch1;
      }
      if (g2.touch1 && !g2.touch0) g2.touch0 = g2.touch1, delete g2.touch1;
      if (g2.touch0) g2.touch0[1] = this.__zoom.invert(g2.touch0[0]);
      else {
        g2.end();
        if (g2.taps === 2) {
          t = pointer_default(t, this);
          if (Math.hypot(touchfirst[0] - t[0], touchfirst[1] - t[1]) < tapDistance) {
            var p = select_default2(this).on("dblclick.zoom");
            if (p) p.apply(this, arguments);
          }
        }
      }
    }
    zoom2.wheelDelta = function(_) {
      return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant_default5(+_), zoom2) : wheelDelta;
    };
    zoom2.filter = function(_) {
      return arguments.length ? (filter3 = typeof _ === "function" ? _ : constant_default5(!!_), zoom2) : filter3;
    };
    zoom2.touchable = function(_) {
      return arguments.length ? (touchable = typeof _ === "function" ? _ : constant_default5(!!_), zoom2) : touchable;
    };
    zoom2.extent = function(_) {
      return arguments.length ? (extent = typeof _ === "function" ? _ : constant_default5([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom2) : extent;
    };
    zoom2.scaleExtent = function(_) {
      return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom2) : [scaleExtent[0], scaleExtent[1]];
    };
    zoom2.translateExtent = function(_) {
      return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom2) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
    };
    zoom2.constrain = function(_) {
      return arguments.length ? (constrain = _, zoom2) : constrain;
    };
    zoom2.duration = function(_) {
      return arguments.length ? (duration = +_, zoom2) : duration;
    };
    zoom2.interpolate = function(_) {
      return arguments.length ? (interpolate = _, zoom2) : interpolate;
    };
    zoom2.on = function() {
      var value = listeners.on.apply(listeners, arguments);
      return value === listeners ? zoom2 : value;
    };
    zoom2.clickDistance = function(_) {
      return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom2) : Math.sqrt(clickDistance2);
    };
    zoom2.tapDistance = function(_) {
      return arguments.length ? (tapDistance = +_, zoom2) : tapDistance;
    };
    return zoom2;
  }

  // node_modules/lodash-es/_freeGlobal.js
  var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
  var freeGlobal_default = freeGlobal;

  // node_modules/lodash-es/_root.js
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  var root2 = freeGlobal_default || freeSelf || Function("return this")();
  var root_default = root2;

  // node_modules/lodash-es/_Symbol.js
  var Symbol2 = root_default.Symbol;
  var Symbol_default = Symbol2;

  // node_modules/lodash-es/_getRawTag.js
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var nativeObjectToString = objectProto.toString;
  var symToStringTag = Symbol_default ? Symbol_default.toStringTag : void 0;
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
    try {
      value[symToStringTag] = void 0;
      var unmasked = true;
    } catch (e) {
    }
    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }
  var getRawTag_default = getRawTag;

  // node_modules/lodash-es/_objectToString.js
  var objectProto2 = Object.prototype;
  var nativeObjectToString2 = objectProto2.toString;
  function objectToString(value) {
    return nativeObjectToString2.call(value);
  }
  var objectToString_default = objectToString;

  // node_modules/lodash-es/_baseGetTag.js
  var nullTag = "[object Null]";
  var undefinedTag = "[object Undefined]";
  var symToStringTag2 = Symbol_default ? Symbol_default.toStringTag : void 0;
  function baseGetTag(value) {
    if (value == null) {
      return value === void 0 ? undefinedTag : nullTag;
    }
    return symToStringTag2 && symToStringTag2 in Object(value) ? getRawTag_default(value) : objectToString_default(value);
  }
  var baseGetTag_default = baseGetTag;

  // node_modules/lodash-es/isObjectLike.js
  function isObjectLike(value) {
    return value != null && typeof value == "object";
  }
  var isObjectLike_default = isObjectLike;

  // node_modules/lodash-es/isSymbol.js
  var symbolTag = "[object Symbol]";
  function isSymbol(value) {
    return typeof value == "symbol" || isObjectLike_default(value) && baseGetTag_default(value) == symbolTag;
  }
  var isSymbol_default = isSymbol;

  // node_modules/lodash-es/_arrayMap.js
  function arrayMap(array2, iteratee) {
    var index = -1, length = array2 == null ? 0 : array2.length, result = Array(length);
    while (++index < length) {
      result[index] = iteratee(array2[index], index, array2);
    }
    return result;
  }
  var arrayMap_default = arrayMap;

  // node_modules/lodash-es/isArray.js
  var isArray = Array.isArray;
  var isArray_default = isArray;

  // node_modules/lodash-es/_baseToString.js
  var INFINITY = 1 / 0;
  var symbolProto = Symbol_default ? Symbol_default.prototype : void 0;
  var symbolToString = symbolProto ? symbolProto.toString : void 0;
  function baseToString(value) {
    if (typeof value == "string") {
      return value;
    }
    if (isArray_default(value)) {
      return arrayMap_default(value, baseToString) + "";
    }
    if (isSymbol_default(value)) {
      return symbolToString ? symbolToString.call(value) : "";
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  }
  var baseToString_default = baseToString;

  // node_modules/lodash-es/_trimmedEndIndex.js
  var reWhitespace = /\s/;
  function trimmedEndIndex(string) {
    var index = string.length;
    while (index-- && reWhitespace.test(string.charAt(index))) {
    }
    return index;
  }
  var trimmedEndIndex_default = trimmedEndIndex;

  // node_modules/lodash-es/_baseTrim.js
  var reTrimStart = /^\s+/;
  function baseTrim(string) {
    return string ? string.slice(0, trimmedEndIndex_default(string) + 1).replace(reTrimStart, "") : string;
  }
  var baseTrim_default = baseTrim;

  // node_modules/lodash-es/isObject.js
  function isObject(value) {
    var type2 = typeof value;
    return value != null && (type2 == "object" || type2 == "function");
  }
  var isObject_default = isObject;

  // node_modules/lodash-es/toNumber.js
  var NAN = 0 / 0;
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
  var reIsBinary = /^0b[01]+$/i;
  var reIsOctal = /^0o[0-7]+$/i;
  var freeParseInt = parseInt;
  function toNumber(value) {
    if (typeof value == "number") {
      return value;
    }
    if (isSymbol_default(value)) {
      return NAN;
    }
    if (isObject_default(value)) {
      var other = typeof value.valueOf == "function" ? value.valueOf() : value;
      value = isObject_default(other) ? other + "" : other;
    }
    if (typeof value != "string") {
      return value === 0 ? value : +value;
    }
    value = baseTrim_default(value);
    var isBinary = reIsBinary.test(value);
    return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
  }
  var toNumber_default = toNumber;

  // node_modules/lodash-es/toFinite.js
  var INFINITY2 = 1 / 0;
  var MAX_INTEGER = 17976931348623157e292;
  function toFinite(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }
    value = toNumber_default(value);
    if (value === INFINITY2 || value === -INFINITY2) {
      var sign = value < 0 ? -1 : 1;
      return sign * MAX_INTEGER;
    }
    return value === value ? value : 0;
  }
  var toFinite_default = toFinite;

  // node_modules/lodash-es/toInteger.js
  function toInteger(value) {
    var result = toFinite_default(value), remainder = result % 1;
    return result === result ? remainder ? result - remainder : result : 0;
  }
  var toInteger_default = toInteger;

  // node_modules/lodash-es/identity.js
  function identity3(value) {
    return value;
  }
  var identity_default = identity3;

  // node_modules/lodash-es/isFunction.js
  var asyncTag = "[object AsyncFunction]";
  var funcTag = "[object Function]";
  var genTag = "[object GeneratorFunction]";
  var proxyTag = "[object Proxy]";
  function isFunction(value) {
    if (!isObject_default(value)) {
      return false;
    }
    var tag = baseGetTag_default(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }
  var isFunction_default = isFunction;

  // node_modules/lodash-es/_coreJsData.js
  var coreJsData = root_default["__core-js_shared__"];
  var coreJsData_default = coreJsData;

  // node_modules/lodash-es/_isMasked.js
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData_default && coreJsData_default.keys && coreJsData_default.keys.IE_PROTO || "");
    return uid ? "Symbol(src)_1." + uid : "";
  })();
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }
  var isMasked_default = isMasked;

  // node_modules/lodash-es/_toSource.js
  var funcProto = Function.prototype;
  var funcToString = funcProto.toString;
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {
      }
      try {
        return func + "";
      } catch (e) {
      }
    }
    return "";
  }
  var toSource_default = toSource;

  // node_modules/lodash-es/_baseIsNative.js
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var funcProto2 = Function.prototype;
  var objectProto3 = Object.prototype;
  var funcToString2 = funcProto2.toString;
  var hasOwnProperty2 = objectProto3.hasOwnProperty;
  var reIsNative = RegExp(
    "^" + funcToString2.call(hasOwnProperty2).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  );
  function baseIsNative(value) {
    if (!isObject_default(value) || isMasked_default(value)) {
      return false;
    }
    var pattern = isFunction_default(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource_default(value));
  }
  var baseIsNative_default = baseIsNative;

  // node_modules/lodash-es/_getValue.js
  function getValue(object, key) {
    return object == null ? void 0 : object[key];
  }
  var getValue_default = getValue;

  // node_modules/lodash-es/_getNative.js
  function getNative(object, key) {
    var value = getValue_default(object, key);
    return baseIsNative_default(value) ? value : void 0;
  }
  var getNative_default = getNative;

  // node_modules/lodash-es/_WeakMap.js
  var WeakMap = getNative_default(root_default, "WeakMap");
  var WeakMap_default = WeakMap;

  // node_modules/lodash-es/_baseCreate.js
  var objectCreate = Object.create;
  var baseCreate = /* @__PURE__ */ (function() {
    function object() {
    }
    return function(proto) {
      if (!isObject_default(proto)) {
        return {};
      }
      if (objectCreate) {
        return objectCreate(proto);
      }
      object.prototype = proto;
      var result = new object();
      object.prototype = void 0;
      return result;
    };
  })();
  var baseCreate_default = baseCreate;

  // node_modules/lodash-es/_apply.js
  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0:
        return func.call(thisArg);
      case 1:
        return func.call(thisArg, args[0]);
      case 2:
        return func.call(thisArg, args[0], args[1]);
      case 3:
        return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }
  var apply_default = apply;

  // node_modules/lodash-es/noop.js
  function noop2() {
  }
  var noop_default = noop2;

  // node_modules/lodash-es/_copyArray.js
  function copyArray(source, array2) {
    var index = -1, length = source.length;
    array2 || (array2 = Array(length));
    while (++index < length) {
      array2[index] = source[index];
    }
    return array2;
  }
  var copyArray_default = copyArray;

  // node_modules/lodash-es/_shortOut.js
  var HOT_COUNT = 800;
  var HOT_SPAN = 16;
  var nativeNow = Date.now;
  function shortOut(func) {
    var count = 0, lastCalled = 0;
    return function() {
      var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return arguments[0];
        }
      } else {
        count = 0;
      }
      return func.apply(void 0, arguments);
    };
  }
  var shortOut_default = shortOut;

  // node_modules/lodash-es/constant.js
  function constant(value) {
    return function() {
      return value;
    };
  }
  var constant_default6 = constant;

  // node_modules/lodash-es/_defineProperty.js
  var defineProperty = (function() {
    try {
      var func = getNative_default(Object, "defineProperty");
      func({}, "", {});
      return func;
    } catch (e) {
    }
  })();
  var defineProperty_default = defineProperty;

  // node_modules/lodash-es/_baseSetToString.js
  var baseSetToString = !defineProperty_default ? identity_default : function(func, string) {
    return defineProperty_default(func, "toString", {
      "configurable": true,
      "enumerable": false,
      "value": constant_default6(string),
      "writable": true
    });
  };
  var baseSetToString_default = baseSetToString;

  // node_modules/lodash-es/_setToString.js
  var setToString = shortOut_default(baseSetToString_default);
  var setToString_default = setToString;

  // node_modules/lodash-es/_arrayEach.js
  function arrayEach(array2, iteratee) {
    var index = -1, length = array2 == null ? 0 : array2.length;
    while (++index < length) {
      if (iteratee(array2[index], index, array2) === false) {
        break;
      }
    }
    return array2;
  }
  var arrayEach_default = arrayEach;

  // node_modules/lodash-es/_baseFindIndex.js
  function baseFindIndex(array2, predicate, fromIndex, fromRight) {
    var length = array2.length, index = fromIndex + (fromRight ? 1 : -1);
    while (fromRight ? index-- : ++index < length) {
      if (predicate(array2[index], index, array2)) {
        return index;
      }
    }
    return -1;
  }
  var baseFindIndex_default = baseFindIndex;

  // node_modules/lodash-es/_baseIsNaN.js
  function baseIsNaN(value) {
    return value !== value;
  }
  var baseIsNaN_default = baseIsNaN;

  // node_modules/lodash-es/_strictIndexOf.js
  function strictIndexOf(array2, value, fromIndex) {
    var index = fromIndex - 1, length = array2.length;
    while (++index < length) {
      if (array2[index] === value) {
        return index;
      }
    }
    return -1;
  }
  var strictIndexOf_default = strictIndexOf;

  // node_modules/lodash-es/_baseIndexOf.js
  function baseIndexOf(array2, value, fromIndex) {
    return value === value ? strictIndexOf_default(array2, value, fromIndex) : baseFindIndex_default(array2, baseIsNaN_default, fromIndex);
  }
  var baseIndexOf_default = baseIndexOf;

  // node_modules/lodash-es/_arrayIncludes.js
  function arrayIncludes(array2, value) {
    var length = array2 == null ? 0 : array2.length;
    return !!length && baseIndexOf_default(array2, value, 0) > -1;
  }
  var arrayIncludes_default = arrayIncludes;

  // node_modules/lodash-es/_isIndex.js
  var MAX_SAFE_INTEGER = 9007199254740991;
  var reIsUint = /^(?:0|[1-9]\d*)$/;
  function isIndex(value, length) {
    var type2 = typeof value;
    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length && (type2 == "number" || type2 != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
  }
  var isIndex_default = isIndex;

  // node_modules/lodash-es/_baseAssignValue.js
  function baseAssignValue(object, key, value) {
    if (key == "__proto__" && defineProperty_default) {
      defineProperty_default(object, key, {
        "configurable": true,
        "enumerable": true,
        "value": value,
        "writable": true
      });
    } else {
      object[key] = value;
    }
  }
  var baseAssignValue_default = baseAssignValue;

  // node_modules/lodash-es/eq.js
  function eq(value, other) {
    return value === other || value !== value && other !== other;
  }
  var eq_default = eq;

  // node_modules/lodash-es/_assignValue.js
  var objectProto4 = Object.prototype;
  var hasOwnProperty3 = objectProto4.hasOwnProperty;
  function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty3.call(object, key) && eq_default(objValue, value)) || value === void 0 && !(key in object)) {
      baseAssignValue_default(object, key, value);
    }
  }
  var assignValue_default = assignValue;

  // node_modules/lodash-es/_copyObject.js
  function copyObject(source, props, object, customizer) {
    var isNew = !object;
    object || (object = {});
    var index = -1, length = props.length;
    while (++index < length) {
      var key = props[index];
      var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
      if (newValue === void 0) {
        newValue = source[key];
      }
      if (isNew) {
        baseAssignValue_default(object, key, newValue);
      } else {
        assignValue_default(object, key, newValue);
      }
    }
    return object;
  }
  var copyObject_default = copyObject;

  // node_modules/lodash-es/_overRest.js
  var nativeMax = Math.max;
  function overRest(func, start2, transform2) {
    start2 = nativeMax(start2 === void 0 ? func.length - 1 : start2, 0);
    return function() {
      var args = arguments, index = -1, length = nativeMax(args.length - start2, 0), array2 = Array(length);
      while (++index < length) {
        array2[index] = args[start2 + index];
      }
      index = -1;
      var otherArgs = Array(start2 + 1);
      while (++index < start2) {
        otherArgs[index] = args[index];
      }
      otherArgs[start2] = transform2(array2);
      return apply_default(func, this, otherArgs);
    };
  }
  var overRest_default = overRest;

  // node_modules/lodash-es/_baseRest.js
  function baseRest(func, start2) {
    return setToString_default(overRest_default(func, start2, identity_default), func + "");
  }
  var baseRest_default = baseRest;

  // node_modules/lodash-es/isLength.js
  var MAX_SAFE_INTEGER2 = 9007199254740991;
  function isLength(value) {
    return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER2;
  }
  var isLength_default = isLength;

  // node_modules/lodash-es/isArrayLike.js
  function isArrayLike(value) {
    return value != null && isLength_default(value.length) && !isFunction_default(value);
  }
  var isArrayLike_default = isArrayLike;

  // node_modules/lodash-es/_isIterateeCall.js
  function isIterateeCall(value, index, object) {
    if (!isObject_default(object)) {
      return false;
    }
    var type2 = typeof index;
    if (type2 == "number" ? isArrayLike_default(object) && isIndex_default(index, object.length) : type2 == "string" && index in object) {
      return eq_default(object[index], value);
    }
    return false;
  }
  var isIterateeCall_default = isIterateeCall;

  // node_modules/lodash-es/_createAssigner.js
  function createAssigner(assigner) {
    return baseRest_default(function(object, sources) {
      var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
      customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
      if (guard && isIterateeCall_default(sources[0], sources[1], guard)) {
        customizer = length < 3 ? void 0 : customizer;
        length = 1;
      }
      object = Object(object);
      while (++index < length) {
        var source = sources[index];
        if (source) {
          assigner(object, source, index, customizer);
        }
      }
      return object;
    });
  }
  var createAssigner_default = createAssigner;

  // node_modules/lodash-es/_isPrototype.js
  var objectProto5 = Object.prototype;
  function isPrototype(value) {
    var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto5;
    return value === proto;
  }
  var isPrototype_default = isPrototype;

  // node_modules/lodash-es/_baseTimes.js
  function baseTimes(n, iteratee) {
    var index = -1, result = Array(n);
    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }
  var baseTimes_default = baseTimes;

  // node_modules/lodash-es/_baseIsArguments.js
  var argsTag = "[object Arguments]";
  function baseIsArguments(value) {
    return isObjectLike_default(value) && baseGetTag_default(value) == argsTag;
  }
  var baseIsArguments_default = baseIsArguments;

  // node_modules/lodash-es/isArguments.js
  var objectProto6 = Object.prototype;
  var hasOwnProperty4 = objectProto6.hasOwnProperty;
  var propertyIsEnumerable = objectProto6.propertyIsEnumerable;
  var isArguments = baseIsArguments_default(/* @__PURE__ */ (function() {
    return arguments;
  })()) ? baseIsArguments_default : function(value) {
    return isObjectLike_default(value) && hasOwnProperty4.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
  };
  var isArguments_default = isArguments;

  // node_modules/lodash-es/stubFalse.js
  function stubFalse() {
    return false;
  }
  var stubFalse_default = stubFalse;

  // node_modules/lodash-es/isBuffer.js
  var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
  var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var Buffer2 = moduleExports ? root_default.Buffer : void 0;
  var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
  var isBuffer = nativeIsBuffer || stubFalse_default;
  var isBuffer_default = isBuffer;

  // node_modules/lodash-es/_baseIsTypedArray.js
  var argsTag2 = "[object Arguments]";
  var arrayTag = "[object Array]";
  var boolTag = "[object Boolean]";
  var dateTag = "[object Date]";
  var errorTag = "[object Error]";
  var funcTag2 = "[object Function]";
  var mapTag = "[object Map]";
  var numberTag = "[object Number]";
  var objectTag = "[object Object]";
  var regexpTag = "[object RegExp]";
  var setTag = "[object Set]";
  var stringTag = "[object String]";
  var weakMapTag = "[object WeakMap]";
  var arrayBufferTag = "[object ArrayBuffer]";
  var dataViewTag = "[object DataView]";
  var float32Tag = "[object Float32Array]";
  var float64Tag = "[object Float64Array]";
  var int8Tag = "[object Int8Array]";
  var int16Tag = "[object Int16Array]";
  var int32Tag = "[object Int32Array]";
  var uint8Tag = "[object Uint8Array]";
  var uint8ClampedTag = "[object Uint8ClampedArray]";
  var uint16Tag = "[object Uint16Array]";
  var uint32Tag = "[object Uint32Array]";
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag2] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag2] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
  function baseIsTypedArray(value) {
    return isObjectLike_default(value) && isLength_default(value.length) && !!typedArrayTags[baseGetTag_default(value)];
  }
  var baseIsTypedArray_default = baseIsTypedArray;

  // node_modules/lodash-es/_baseUnary.js
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }
  var baseUnary_default = baseUnary;

  // node_modules/lodash-es/_nodeUtil.js
  var freeExports2 = typeof exports == "object" && exports && !exports.nodeType && exports;
  var freeModule2 = freeExports2 && typeof module == "object" && module && !module.nodeType && module;
  var moduleExports2 = freeModule2 && freeModule2.exports === freeExports2;
  var freeProcess = moduleExports2 && freeGlobal_default.process;
  var nodeUtil = (function() {
    try {
      var types = freeModule2 && freeModule2.require && freeModule2.require("util").types;
      if (types) {
        return types;
      }
      return freeProcess && freeProcess.binding && freeProcess.binding("util");
    } catch (e) {
    }
  })();
  var nodeUtil_default = nodeUtil;

  // node_modules/lodash-es/isTypedArray.js
  var nodeIsTypedArray = nodeUtil_default && nodeUtil_default.isTypedArray;
  var isTypedArray = nodeIsTypedArray ? baseUnary_default(nodeIsTypedArray) : baseIsTypedArray_default;
  var isTypedArray_default = isTypedArray;

  // node_modules/lodash-es/_arrayLikeKeys.js
  var objectProto7 = Object.prototype;
  var hasOwnProperty5 = objectProto7.hasOwnProperty;
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray_default(value), isArg = !isArr && isArguments_default(value), isBuff = !isArr && !isArg && isBuffer_default(value), isType = !isArr && !isArg && !isBuff && isTypedArray_default(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes_default(value.length, String) : [], length = result.length;
    for (var key in value) {
      if ((inherited || hasOwnProperty5.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
      (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
      isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
      isIndex_default(key, length)))) {
        result.push(key);
      }
    }
    return result;
  }
  var arrayLikeKeys_default = arrayLikeKeys;

  // node_modules/lodash-es/_overArg.js
  function overArg(func, transform2) {
    return function(arg) {
      return func(transform2(arg));
    };
  }
  var overArg_default = overArg;

  // node_modules/lodash-es/_nativeKeys.js
  var nativeKeys = overArg_default(Object.keys, Object);
  var nativeKeys_default = nativeKeys;

  // node_modules/lodash-es/_baseKeys.js
  var objectProto8 = Object.prototype;
  var hasOwnProperty6 = objectProto8.hasOwnProperty;
  function baseKeys(object) {
    if (!isPrototype_default(object)) {
      return nativeKeys_default(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty6.call(object, key) && key != "constructor") {
        result.push(key);
      }
    }
    return result;
  }
  var baseKeys_default = baseKeys;

  // node_modules/lodash-es/keys.js
  function keys(object) {
    return isArrayLike_default(object) ? arrayLikeKeys_default(object) : baseKeys_default(object);
  }
  var keys_default = keys;

  // node_modules/lodash-es/_nativeKeysIn.js
  function nativeKeysIn(object) {
    var result = [];
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key);
      }
    }
    return result;
  }
  var nativeKeysIn_default = nativeKeysIn;

  // node_modules/lodash-es/_baseKeysIn.js
  var objectProto9 = Object.prototype;
  var hasOwnProperty7 = objectProto9.hasOwnProperty;
  function baseKeysIn(object) {
    if (!isObject_default(object)) {
      return nativeKeysIn_default(object);
    }
    var isProto = isPrototype_default(object), result = [];
    for (var key in object) {
      if (!(key == "constructor" && (isProto || !hasOwnProperty7.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }
  var baseKeysIn_default = baseKeysIn;

  // node_modules/lodash-es/keysIn.js
  function keysIn(object) {
    return isArrayLike_default(object) ? arrayLikeKeys_default(object, true) : baseKeysIn_default(object);
  }
  var keysIn_default = keysIn;

  // node_modules/lodash-es/_isKey.js
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
  var reIsPlainProp = /^\w*$/;
  function isKey(value, object) {
    if (isArray_default(value)) {
      return false;
    }
    var type2 = typeof value;
    if (type2 == "number" || type2 == "symbol" || type2 == "boolean" || value == null || isSymbol_default(value)) {
      return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
  }
  var isKey_default = isKey;

  // node_modules/lodash-es/_nativeCreate.js
  var nativeCreate = getNative_default(Object, "create");
  var nativeCreate_default = nativeCreate;

  // node_modules/lodash-es/_hashClear.js
  function hashClear() {
    this.__data__ = nativeCreate_default ? nativeCreate_default(null) : {};
    this.size = 0;
  }
  var hashClear_default = hashClear;

  // node_modules/lodash-es/_hashDelete.js
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }
  var hashDelete_default = hashDelete;

  // node_modules/lodash-es/_hashGet.js
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  var objectProto10 = Object.prototype;
  var hasOwnProperty8 = objectProto10.hasOwnProperty;
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate_default) {
      var result = data[key];
      return result === HASH_UNDEFINED ? void 0 : result;
    }
    return hasOwnProperty8.call(data, key) ? data[key] : void 0;
  }
  var hashGet_default = hashGet;

  // node_modules/lodash-es/_hashHas.js
  var objectProto11 = Object.prototype;
  var hasOwnProperty9 = objectProto11.hasOwnProperty;
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate_default ? data[key] !== void 0 : hasOwnProperty9.call(data, key);
  }
  var hashHas_default = hashHas;

  // node_modules/lodash-es/_hashSet.js
  var HASH_UNDEFINED2 = "__lodash_hash_undefined__";
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = nativeCreate_default && value === void 0 ? HASH_UNDEFINED2 : value;
    return this;
  }
  var hashSet_default = hashSet;

  // node_modules/lodash-es/_Hash.js
  function Hash(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  Hash.prototype.clear = hashClear_default;
  Hash.prototype["delete"] = hashDelete_default;
  Hash.prototype.get = hashGet_default;
  Hash.prototype.has = hashHas_default;
  Hash.prototype.set = hashSet_default;
  var Hash_default = Hash;

  // node_modules/lodash-es/_listCacheClear.js
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }
  var listCacheClear_default = listCacheClear;

  // node_modules/lodash-es/_assocIndexOf.js
  function assocIndexOf(array2, key) {
    var length = array2.length;
    while (length--) {
      if (eq_default(array2[length][0], key)) {
        return length;
      }
    }
    return -1;
  }
  var assocIndexOf_default = assocIndexOf;

  // node_modules/lodash-es/_listCacheDelete.js
  var arrayProto = Array.prototype;
  var splice = arrayProto.splice;
  function listCacheDelete(key) {
    var data = this.__data__, index = assocIndexOf_default(data, key);
    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }
  var listCacheDelete_default = listCacheDelete;

  // node_modules/lodash-es/_listCacheGet.js
  function listCacheGet(key) {
    var data = this.__data__, index = assocIndexOf_default(data, key);
    return index < 0 ? void 0 : data[index][1];
  }
  var listCacheGet_default = listCacheGet;

  // node_modules/lodash-es/_listCacheHas.js
  function listCacheHas(key) {
    return assocIndexOf_default(this.__data__, key) > -1;
  }
  var listCacheHas_default = listCacheHas;

  // node_modules/lodash-es/_listCacheSet.js
  function listCacheSet(key, value) {
    var data = this.__data__, index = assocIndexOf_default(data, key);
    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }
  var listCacheSet_default = listCacheSet;

  // node_modules/lodash-es/_ListCache.js
  function ListCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  ListCache.prototype.clear = listCacheClear_default;
  ListCache.prototype["delete"] = listCacheDelete_default;
  ListCache.prototype.get = listCacheGet_default;
  ListCache.prototype.has = listCacheHas_default;
  ListCache.prototype.set = listCacheSet_default;
  var ListCache_default = ListCache;

  // node_modules/lodash-es/_Map.js
  var Map2 = getNative_default(root_default, "Map");
  var Map_default = Map2;

  // node_modules/lodash-es/_mapCacheClear.js
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      "hash": new Hash_default(),
      "map": new (Map_default || ListCache_default)(),
      "string": new Hash_default()
    };
  }
  var mapCacheClear_default = mapCacheClear;

  // node_modules/lodash-es/_isKeyable.js
  function isKeyable(value) {
    var type2 = typeof value;
    return type2 == "string" || type2 == "number" || type2 == "symbol" || type2 == "boolean" ? value !== "__proto__" : value === null;
  }
  var isKeyable_default = isKeyable;

  // node_modules/lodash-es/_getMapData.js
  function getMapData(map2, key) {
    var data = map2.__data__;
    return isKeyable_default(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
  }
  var getMapData_default = getMapData;

  // node_modules/lodash-es/_mapCacheDelete.js
  function mapCacheDelete(key) {
    var result = getMapData_default(this, key)["delete"](key);
    this.size -= result ? 1 : 0;
    return result;
  }
  var mapCacheDelete_default = mapCacheDelete;

  // node_modules/lodash-es/_mapCacheGet.js
  function mapCacheGet(key) {
    return getMapData_default(this, key).get(key);
  }
  var mapCacheGet_default = mapCacheGet;

  // node_modules/lodash-es/_mapCacheHas.js
  function mapCacheHas(key) {
    return getMapData_default(this, key).has(key);
  }
  var mapCacheHas_default = mapCacheHas;

  // node_modules/lodash-es/_mapCacheSet.js
  function mapCacheSet(key, value) {
    var data = getMapData_default(this, key), size2 = data.size;
    data.set(key, value);
    this.size += data.size == size2 ? 0 : 1;
    return this;
  }
  var mapCacheSet_default = mapCacheSet;

  // node_modules/lodash-es/_MapCache.js
  function MapCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  MapCache.prototype.clear = mapCacheClear_default;
  MapCache.prototype["delete"] = mapCacheDelete_default;
  MapCache.prototype.get = mapCacheGet_default;
  MapCache.prototype.has = mapCacheHas_default;
  MapCache.prototype.set = mapCacheSet_default;
  var MapCache_default = MapCache;

  // node_modules/lodash-es/memoize.js
  var FUNC_ERROR_TEXT = "Expected a function";
  function memoize(func, resolver) {
    if (typeof func != "function" || resolver != null && typeof resolver != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result) || cache;
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache_default)();
    return memoized;
  }
  memoize.Cache = MapCache_default;
  var memoize_default = memoize;

  // node_modules/lodash-es/_memoizeCapped.js
  var MAX_MEMOIZE_SIZE = 500;
  function memoizeCapped(func) {
    var result = memoize_default(func, function(key) {
      if (cache.size === MAX_MEMOIZE_SIZE) {
        cache.clear();
      }
      return key;
    });
    var cache = result.cache;
    return result;
  }
  var memoizeCapped_default = memoizeCapped;

  // node_modules/lodash-es/_stringToPath.js
  var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
  var reEscapeChar = /\\(\\)?/g;
  var stringToPath = memoizeCapped_default(function(string) {
    var result = [];
    if (string.charCodeAt(0) === 46) {
      result.push("");
    }
    string.replace(rePropName, function(match, number, quote, subString) {
      result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
    });
    return result;
  });
  var stringToPath_default = stringToPath;

  // node_modules/lodash-es/toString.js
  function toString(value) {
    return value == null ? "" : baseToString_default(value);
  }
  var toString_default = toString;

  // node_modules/lodash-es/_castPath.js
  function castPath(value, object) {
    if (isArray_default(value)) {
      return value;
    }
    return isKey_default(value, object) ? [value] : stringToPath_default(toString_default(value));
  }
  var castPath_default = castPath;

  // node_modules/lodash-es/_toKey.js
  var INFINITY3 = 1 / 0;
  function toKey(value) {
    if (typeof value == "string" || isSymbol_default(value)) {
      return value;
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY3 ? "-0" : result;
  }
  var toKey_default = toKey;

  // node_modules/lodash-es/_baseGet.js
  function baseGet(object, path2) {
    path2 = castPath_default(path2, object);
    var index = 0, length = path2.length;
    while (object != null && index < length) {
      object = object[toKey_default(path2[index++])];
    }
    return index && index == length ? object : void 0;
  }
  var baseGet_default = baseGet;

  // node_modules/lodash-es/get.js
  function get3(object, path2, defaultValue) {
    var result = object == null ? void 0 : baseGet_default(object, path2);
    return result === void 0 ? defaultValue : result;
  }
  var get_default = get3;

  // node_modules/lodash-es/_arrayPush.js
  function arrayPush(array2, values2) {
    var index = -1, length = values2.length, offset = array2.length;
    while (++index < length) {
      array2[offset + index] = values2[index];
    }
    return array2;
  }
  var arrayPush_default = arrayPush;

  // node_modules/lodash-es/_isFlattenable.js
  var spreadableSymbol = Symbol_default ? Symbol_default.isConcatSpreadable : void 0;
  function isFlattenable(value) {
    return isArray_default(value) || isArguments_default(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
  }
  var isFlattenable_default = isFlattenable;

  // node_modules/lodash-es/_baseFlatten.js
  function baseFlatten(array2, depth, predicate, isStrict, result) {
    var index = -1, length = array2.length;
    predicate || (predicate = isFlattenable_default);
    result || (result = []);
    while (++index < length) {
      var value = array2[index];
      if (depth > 0 && predicate(value)) {
        if (depth > 1) {
          baseFlatten(value, depth - 1, predicate, isStrict, result);
        } else {
          arrayPush_default(result, value);
        }
      } else if (!isStrict) {
        result[result.length] = value;
      }
    }
    return result;
  }
  var baseFlatten_default = baseFlatten;

  // node_modules/lodash-es/flatten.js
  function flatten(array2) {
    var length = array2 == null ? 0 : array2.length;
    return length ? baseFlatten_default(array2, 1) : [];
  }
  var flatten_default = flatten;

  // node_modules/lodash-es/_flatRest.js
  function flatRest(func) {
    return setToString_default(overRest_default(func, void 0, flatten_default), func + "");
  }
  var flatRest_default = flatRest;

  // node_modules/lodash-es/_getPrototype.js
  var getPrototype = overArg_default(Object.getPrototypeOf, Object);
  var getPrototype_default = getPrototype;

  // node_modules/lodash-es/isPlainObject.js
  var objectTag2 = "[object Object]";
  var funcProto3 = Function.prototype;
  var objectProto12 = Object.prototype;
  var funcToString3 = funcProto3.toString;
  var hasOwnProperty10 = objectProto12.hasOwnProperty;
  var objectCtorString = funcToString3.call(Object);
  function isPlainObject(value) {
    if (!isObjectLike_default(value) || baseGetTag_default(value) != objectTag2) {
      return false;
    }
    var proto = getPrototype_default(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty10.call(proto, "constructor") && proto.constructor;
    return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString3.call(Ctor) == objectCtorString;
  }
  var isPlainObject_default = isPlainObject;

  // node_modules/lodash-es/_hasUnicode.js
  var rsAstralRange = "\\ud800-\\udfff";
  var rsComboMarksRange = "\\u0300-\\u036f";
  var reComboHalfMarksRange = "\\ufe20-\\ufe2f";
  var rsComboSymbolsRange = "\\u20d0-\\u20ff";
  var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
  var rsVarRange = "\\ufe0e\\ufe0f";
  var rsZWJ = "\\u200d";
  var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + "]");
  function hasUnicode(string) {
    return reHasUnicode.test(string);
  }
  var hasUnicode_default = hasUnicode;

  // node_modules/lodash-es/_arrayReduce.js
  function arrayReduce(array2, iteratee, accumulator, initAccum) {
    var index = -1, length = array2 == null ? 0 : array2.length;
    if (initAccum && length) {
      accumulator = array2[++index];
    }
    while (++index < length) {
      accumulator = iteratee(accumulator, array2[index], index, array2);
    }
    return accumulator;
  }
  var arrayReduce_default = arrayReduce;

  // node_modules/lodash-es/_stackClear.js
  function stackClear() {
    this.__data__ = new ListCache_default();
    this.size = 0;
  }
  var stackClear_default = stackClear;

  // node_modules/lodash-es/_stackDelete.js
  function stackDelete(key) {
    var data = this.__data__, result = data["delete"](key);
    this.size = data.size;
    return result;
  }
  var stackDelete_default = stackDelete;

  // node_modules/lodash-es/_stackGet.js
  function stackGet(key) {
    return this.__data__.get(key);
  }
  var stackGet_default = stackGet;

  // node_modules/lodash-es/_stackHas.js
  function stackHas(key) {
    return this.__data__.has(key);
  }
  var stackHas_default = stackHas;

  // node_modules/lodash-es/_stackSet.js
  var LARGE_ARRAY_SIZE = 200;
  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache_default) {
      var pairs = data.__data__;
      if (!Map_default || pairs.length < LARGE_ARRAY_SIZE - 1) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new MapCache_default(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }
  var stackSet_default = stackSet;

  // node_modules/lodash-es/_Stack.js
  function Stack(entries) {
    var data = this.__data__ = new ListCache_default(entries);
    this.size = data.size;
  }
  Stack.prototype.clear = stackClear_default;
  Stack.prototype["delete"] = stackDelete_default;
  Stack.prototype.get = stackGet_default;
  Stack.prototype.has = stackHas_default;
  Stack.prototype.set = stackSet_default;
  var Stack_default = Stack;

  // node_modules/lodash-es/_baseAssign.js
  function baseAssign(object, source) {
    return object && copyObject_default(source, keys_default(source), object);
  }
  var baseAssign_default = baseAssign;

  // node_modules/lodash-es/_baseAssignIn.js
  function baseAssignIn(object, source) {
    return object && copyObject_default(source, keysIn_default(source), object);
  }
  var baseAssignIn_default = baseAssignIn;

  // node_modules/lodash-es/_cloneBuffer.js
  var freeExports3 = typeof exports == "object" && exports && !exports.nodeType && exports;
  var freeModule3 = freeExports3 && typeof module == "object" && module && !module.nodeType && module;
  var moduleExports3 = freeModule3 && freeModule3.exports === freeExports3;
  var Buffer3 = moduleExports3 ? root_default.Buffer : void 0;
  var allocUnsafe = Buffer3 ? Buffer3.allocUnsafe : void 0;
  function cloneBuffer(buffer, isDeep) {
    if (isDeep) {
      return buffer.slice();
    }
    var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
    buffer.copy(result);
    return result;
  }
  var cloneBuffer_default = cloneBuffer;

  // node_modules/lodash-es/_arrayFilter.js
  function arrayFilter(array2, predicate) {
    var index = -1, length = array2 == null ? 0 : array2.length, resIndex = 0, result = [];
    while (++index < length) {
      var value = array2[index];
      if (predicate(value, index, array2)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }
  var arrayFilter_default = arrayFilter;

  // node_modules/lodash-es/stubArray.js
  function stubArray() {
    return [];
  }
  var stubArray_default = stubArray;

  // node_modules/lodash-es/_getSymbols.js
  var objectProto13 = Object.prototype;
  var propertyIsEnumerable2 = objectProto13.propertyIsEnumerable;
  var nativeGetSymbols = Object.getOwnPropertySymbols;
  var getSymbols = !nativeGetSymbols ? stubArray_default : function(object) {
    if (object == null) {
      return [];
    }
    object = Object(object);
    return arrayFilter_default(nativeGetSymbols(object), function(symbol) {
      return propertyIsEnumerable2.call(object, symbol);
    });
  };
  var getSymbols_default = getSymbols;

  // node_modules/lodash-es/_copySymbols.js
  function copySymbols(source, object) {
    return copyObject_default(source, getSymbols_default(source), object);
  }
  var copySymbols_default = copySymbols;

  // node_modules/lodash-es/_getSymbolsIn.js
  var nativeGetSymbols2 = Object.getOwnPropertySymbols;
  var getSymbolsIn = !nativeGetSymbols2 ? stubArray_default : function(object) {
    var result = [];
    while (object) {
      arrayPush_default(result, getSymbols_default(object));
      object = getPrototype_default(object);
    }
    return result;
  };
  var getSymbolsIn_default = getSymbolsIn;

  // node_modules/lodash-es/_copySymbolsIn.js
  function copySymbolsIn(source, object) {
    return copyObject_default(source, getSymbolsIn_default(source), object);
  }
  var copySymbolsIn_default = copySymbolsIn;

  // node_modules/lodash-es/_baseGetAllKeys.js
  function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return isArray_default(object) ? result : arrayPush_default(result, symbolsFunc(object));
  }
  var baseGetAllKeys_default = baseGetAllKeys;

  // node_modules/lodash-es/_getAllKeys.js
  function getAllKeys(object) {
    return baseGetAllKeys_default(object, keys_default, getSymbols_default);
  }
  var getAllKeys_default = getAllKeys;

  // node_modules/lodash-es/_getAllKeysIn.js
  function getAllKeysIn(object) {
    return baseGetAllKeys_default(object, keysIn_default, getSymbolsIn_default);
  }
  var getAllKeysIn_default = getAllKeysIn;

  // node_modules/lodash-es/_DataView.js
  var DataView = getNative_default(root_default, "DataView");
  var DataView_default = DataView;

  // node_modules/lodash-es/_Promise.js
  var Promise2 = getNative_default(root_default, "Promise");
  var Promise_default = Promise2;

  // node_modules/lodash-es/_Set.js
  var Set2 = getNative_default(root_default, "Set");
  var Set_default = Set2;

  // node_modules/lodash-es/_getTag.js
  var mapTag2 = "[object Map]";
  var objectTag3 = "[object Object]";
  var promiseTag = "[object Promise]";
  var setTag2 = "[object Set]";
  var weakMapTag2 = "[object WeakMap]";
  var dataViewTag2 = "[object DataView]";
  var dataViewCtorString = toSource_default(DataView_default);
  var mapCtorString = toSource_default(Map_default);
  var promiseCtorString = toSource_default(Promise_default);
  var setCtorString = toSource_default(Set_default);
  var weakMapCtorString = toSource_default(WeakMap_default);
  var getTag = baseGetTag_default;
  if (DataView_default && getTag(new DataView_default(new ArrayBuffer(1))) != dataViewTag2 || Map_default && getTag(new Map_default()) != mapTag2 || Promise_default && getTag(Promise_default.resolve()) != promiseTag || Set_default && getTag(new Set_default()) != setTag2 || WeakMap_default && getTag(new WeakMap_default()) != weakMapTag2) {
    getTag = function(value) {
      var result = baseGetTag_default(value), Ctor = result == objectTag3 ? value.constructor : void 0, ctorString = Ctor ? toSource_default(Ctor) : "";
      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString:
            return dataViewTag2;
          case mapCtorString:
            return mapTag2;
          case promiseCtorString:
            return promiseTag;
          case setCtorString:
            return setTag2;
          case weakMapCtorString:
            return weakMapTag2;
        }
      }
      return result;
    };
  }
  var getTag_default = getTag;

  // node_modules/lodash-es/_initCloneArray.js
  var objectProto14 = Object.prototype;
  var hasOwnProperty11 = objectProto14.hasOwnProperty;
  function initCloneArray(array2) {
    var length = array2.length, result = new array2.constructor(length);
    if (length && typeof array2[0] == "string" && hasOwnProperty11.call(array2, "index")) {
      result.index = array2.index;
      result.input = array2.input;
    }
    return result;
  }
  var initCloneArray_default = initCloneArray;

  // node_modules/lodash-es/_Uint8Array.js
  var Uint8Array2 = root_default.Uint8Array;
  var Uint8Array_default = Uint8Array2;

  // node_modules/lodash-es/_cloneArrayBuffer.js
  function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new Uint8Array_default(result).set(new Uint8Array_default(arrayBuffer));
    return result;
  }
  var cloneArrayBuffer_default = cloneArrayBuffer;

  // node_modules/lodash-es/_cloneDataView.js
  function cloneDataView(dataView, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer_default(dataView.buffer) : dataView.buffer;
    return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
  }
  var cloneDataView_default = cloneDataView;

  // node_modules/lodash-es/_cloneRegExp.js
  var reFlags = /\w*$/;
  function cloneRegExp(regexp) {
    var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
    result.lastIndex = regexp.lastIndex;
    return result;
  }
  var cloneRegExp_default = cloneRegExp;

  // node_modules/lodash-es/_cloneSymbol.js
  var symbolProto2 = Symbol_default ? Symbol_default.prototype : void 0;
  var symbolValueOf = symbolProto2 ? symbolProto2.valueOf : void 0;
  function cloneSymbol(symbol) {
    return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
  }
  var cloneSymbol_default = cloneSymbol;

  // node_modules/lodash-es/_cloneTypedArray.js
  function cloneTypedArray(typedArray, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer_default(typedArray.buffer) : typedArray.buffer;
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
  }
  var cloneTypedArray_default = cloneTypedArray;

  // node_modules/lodash-es/_initCloneByTag.js
  var boolTag2 = "[object Boolean]";
  var dateTag2 = "[object Date]";
  var mapTag3 = "[object Map]";
  var numberTag2 = "[object Number]";
  var regexpTag2 = "[object RegExp]";
  var setTag3 = "[object Set]";
  var stringTag2 = "[object String]";
  var symbolTag2 = "[object Symbol]";
  var arrayBufferTag2 = "[object ArrayBuffer]";
  var dataViewTag3 = "[object DataView]";
  var float32Tag2 = "[object Float32Array]";
  var float64Tag2 = "[object Float64Array]";
  var int8Tag2 = "[object Int8Array]";
  var int16Tag2 = "[object Int16Array]";
  var int32Tag2 = "[object Int32Array]";
  var uint8Tag2 = "[object Uint8Array]";
  var uint8ClampedTag2 = "[object Uint8ClampedArray]";
  var uint16Tag2 = "[object Uint16Array]";
  var uint32Tag2 = "[object Uint32Array]";
  function initCloneByTag(object, tag, isDeep) {
    var Ctor = object.constructor;
    switch (tag) {
      case arrayBufferTag2:
        return cloneArrayBuffer_default(object);
      case boolTag2:
      case dateTag2:
        return new Ctor(+object);
      case dataViewTag3:
        return cloneDataView_default(object, isDeep);
      case float32Tag2:
      case float64Tag2:
      case int8Tag2:
      case int16Tag2:
      case int32Tag2:
      case uint8Tag2:
      case uint8ClampedTag2:
      case uint16Tag2:
      case uint32Tag2:
        return cloneTypedArray_default(object, isDeep);
      case mapTag3:
        return new Ctor();
      case numberTag2:
      case stringTag2:
        return new Ctor(object);
      case regexpTag2:
        return cloneRegExp_default(object);
      case setTag3:
        return new Ctor();
      case symbolTag2:
        return cloneSymbol_default(object);
    }
  }
  var initCloneByTag_default = initCloneByTag;

  // node_modules/lodash-es/_initCloneObject.js
  function initCloneObject(object) {
    return typeof object.constructor == "function" && !isPrototype_default(object) ? baseCreate_default(getPrototype_default(object)) : {};
  }
  var initCloneObject_default = initCloneObject;

  // node_modules/lodash-es/_baseIsMap.js
  var mapTag4 = "[object Map]";
  function baseIsMap(value) {
    return isObjectLike_default(value) && getTag_default(value) == mapTag4;
  }
  var baseIsMap_default = baseIsMap;

  // node_modules/lodash-es/isMap.js
  var nodeIsMap = nodeUtil_default && nodeUtil_default.isMap;
  var isMap = nodeIsMap ? baseUnary_default(nodeIsMap) : baseIsMap_default;
  var isMap_default = isMap;

  // node_modules/lodash-es/_baseIsSet.js
  var setTag4 = "[object Set]";
  function baseIsSet(value) {
    return isObjectLike_default(value) && getTag_default(value) == setTag4;
  }
  var baseIsSet_default = baseIsSet;

  // node_modules/lodash-es/isSet.js
  var nodeIsSet = nodeUtil_default && nodeUtil_default.isSet;
  var isSet = nodeIsSet ? baseUnary_default(nodeIsSet) : baseIsSet_default;
  var isSet_default = isSet;

  // node_modules/lodash-es/_baseClone.js
  var CLONE_DEEP_FLAG = 1;
  var CLONE_FLAT_FLAG = 2;
  var CLONE_SYMBOLS_FLAG = 4;
  var argsTag3 = "[object Arguments]";
  var arrayTag2 = "[object Array]";
  var boolTag3 = "[object Boolean]";
  var dateTag3 = "[object Date]";
  var errorTag2 = "[object Error]";
  var funcTag3 = "[object Function]";
  var genTag2 = "[object GeneratorFunction]";
  var mapTag5 = "[object Map]";
  var numberTag3 = "[object Number]";
  var objectTag4 = "[object Object]";
  var regexpTag3 = "[object RegExp]";
  var setTag5 = "[object Set]";
  var stringTag3 = "[object String]";
  var symbolTag3 = "[object Symbol]";
  var weakMapTag3 = "[object WeakMap]";
  var arrayBufferTag3 = "[object ArrayBuffer]";
  var dataViewTag4 = "[object DataView]";
  var float32Tag3 = "[object Float32Array]";
  var float64Tag3 = "[object Float64Array]";
  var int8Tag3 = "[object Int8Array]";
  var int16Tag3 = "[object Int16Array]";
  var int32Tag3 = "[object Int32Array]";
  var uint8Tag3 = "[object Uint8Array]";
  var uint8ClampedTag3 = "[object Uint8ClampedArray]";
  var uint16Tag3 = "[object Uint16Array]";
  var uint32Tag3 = "[object Uint32Array]";
  var cloneableTags = {};
  cloneableTags[argsTag3] = cloneableTags[arrayTag2] = cloneableTags[arrayBufferTag3] = cloneableTags[dataViewTag4] = cloneableTags[boolTag3] = cloneableTags[dateTag3] = cloneableTags[float32Tag3] = cloneableTags[float64Tag3] = cloneableTags[int8Tag3] = cloneableTags[int16Tag3] = cloneableTags[int32Tag3] = cloneableTags[mapTag5] = cloneableTags[numberTag3] = cloneableTags[objectTag4] = cloneableTags[regexpTag3] = cloneableTags[setTag5] = cloneableTags[stringTag3] = cloneableTags[symbolTag3] = cloneableTags[uint8Tag3] = cloneableTags[uint8ClampedTag3] = cloneableTags[uint16Tag3] = cloneableTags[uint32Tag3] = true;
  cloneableTags[errorTag2] = cloneableTags[funcTag3] = cloneableTags[weakMapTag3] = false;
  function baseClone(value, bitmask, customizer, key, object, stack) {
    var result, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
    if (customizer) {
      result = object ? customizer(value, key, object, stack) : customizer(value);
    }
    if (result !== void 0) {
      return result;
    }
    if (!isObject_default(value)) {
      return value;
    }
    var isArr = isArray_default(value);
    if (isArr) {
      result = initCloneArray_default(value);
      if (!isDeep) {
        return copyArray_default(value, result);
      }
    } else {
      var tag = getTag_default(value), isFunc = tag == funcTag3 || tag == genTag2;
      if (isBuffer_default(value)) {
        return cloneBuffer_default(value, isDeep);
      }
      if (tag == objectTag4 || tag == argsTag3 || isFunc && !object) {
        result = isFlat || isFunc ? {} : initCloneObject_default(value);
        if (!isDeep) {
          return isFlat ? copySymbolsIn_default(value, baseAssignIn_default(result, value)) : copySymbols_default(value, baseAssign_default(result, value));
        }
      } else {
        if (!cloneableTags[tag]) {
          return object ? value : {};
        }
        result = initCloneByTag_default(value, tag, isDeep);
      }
    }
    stack || (stack = new Stack_default());
    var stacked = stack.get(value);
    if (stacked) {
      return stacked;
    }
    stack.set(value, result);
    if (isSet_default(value)) {
      value.forEach(function(subValue) {
        result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
      });
    } else if (isMap_default(value)) {
      value.forEach(function(subValue, key2) {
        result.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
      });
    }
    var keysFunc = isFull ? isFlat ? getAllKeysIn_default : getAllKeys_default : isFlat ? keysIn_default : keys_default;
    var props = isArr ? void 0 : keysFunc(value);
    arrayEach_default(props || value, function(subValue, key2) {
      if (props) {
        key2 = subValue;
        subValue = value[key2];
      }
      assignValue_default(result, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
    });
    return result;
  }
  var baseClone_default = baseClone;

  // node_modules/lodash-es/cloneDeep.js
  var CLONE_DEEP_FLAG2 = 1;
  var CLONE_SYMBOLS_FLAG2 = 4;
  function cloneDeep(value) {
    return baseClone_default(value, CLONE_DEEP_FLAG2 | CLONE_SYMBOLS_FLAG2);
  }
  var cloneDeep_default = cloneDeep;

  // node_modules/lodash-es/_setCacheAdd.js
  var HASH_UNDEFINED3 = "__lodash_hash_undefined__";
  function setCacheAdd(value) {
    this.__data__.set(value, HASH_UNDEFINED3);
    return this;
  }
  var setCacheAdd_default = setCacheAdd;

  // node_modules/lodash-es/_setCacheHas.js
  function setCacheHas(value) {
    return this.__data__.has(value);
  }
  var setCacheHas_default = setCacheHas;

  // node_modules/lodash-es/_SetCache.js
  function SetCache(values2) {
    var index = -1, length = values2 == null ? 0 : values2.length;
    this.__data__ = new MapCache_default();
    while (++index < length) {
      this.add(values2[index]);
    }
  }
  SetCache.prototype.add = SetCache.prototype.push = setCacheAdd_default;
  SetCache.prototype.has = setCacheHas_default;
  var SetCache_default = SetCache;

  // node_modules/lodash-es/_arraySome.js
  function arraySome(array2, predicate) {
    var index = -1, length = array2 == null ? 0 : array2.length;
    while (++index < length) {
      if (predicate(array2[index], index, array2)) {
        return true;
      }
    }
    return false;
  }
  var arraySome_default = arraySome;

  // node_modules/lodash-es/_cacheHas.js
  function cacheHas(cache, key) {
    return cache.has(key);
  }
  var cacheHas_default = cacheHas;

  // node_modules/lodash-es/_equalArrays.js
  var COMPARE_PARTIAL_FLAG = 1;
  var COMPARE_UNORDERED_FLAG = 2;
  function equalArrays(array2, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array2.length, othLength = other.length;
    if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
      return false;
    }
    var arrStacked = stack.get(array2);
    var othStacked = stack.get(other);
    if (arrStacked && othStacked) {
      return arrStacked == other && othStacked == array2;
    }
    var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache_default() : void 0;
    stack.set(array2, other);
    stack.set(other, array2);
    while (++index < arrLength) {
      var arrValue = array2[index], othValue = other[index];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, arrValue, index, other, array2, stack) : customizer(arrValue, othValue, index, array2, other, stack);
      }
      if (compared !== void 0) {
        if (compared) {
          continue;
        }
        result = false;
        break;
      }
      if (seen) {
        if (!arraySome_default(other, function(othValue2, othIndex) {
          if (!cacheHas_default(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
            return seen.push(othIndex);
          }
        })) {
          result = false;
          break;
        }
      } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
        result = false;
        break;
      }
    }
    stack["delete"](array2);
    stack["delete"](other);
    return result;
  }
  var equalArrays_default = equalArrays;

  // node_modules/lodash-es/_mapToArray.js
  function mapToArray(map2) {
    var index = -1, result = Array(map2.size);
    map2.forEach(function(value, key) {
      result[++index] = [key, value];
    });
    return result;
  }
  var mapToArray_default = mapToArray;

  // node_modules/lodash-es/_setToArray.js
  function setToArray(set3) {
    var index = -1, result = Array(set3.size);
    set3.forEach(function(value) {
      result[++index] = value;
    });
    return result;
  }
  var setToArray_default = setToArray;

  // node_modules/lodash-es/_equalByTag.js
  var COMPARE_PARTIAL_FLAG2 = 1;
  var COMPARE_UNORDERED_FLAG2 = 2;
  var boolTag4 = "[object Boolean]";
  var dateTag4 = "[object Date]";
  var errorTag3 = "[object Error]";
  var mapTag6 = "[object Map]";
  var numberTag4 = "[object Number]";
  var regexpTag4 = "[object RegExp]";
  var setTag6 = "[object Set]";
  var stringTag4 = "[object String]";
  var symbolTag4 = "[object Symbol]";
  var arrayBufferTag4 = "[object ArrayBuffer]";
  var dataViewTag5 = "[object DataView]";
  var symbolProto3 = Symbol_default ? Symbol_default.prototype : void 0;
  var symbolValueOf2 = symbolProto3 ? symbolProto3.valueOf : void 0;
  function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
    switch (tag) {
      case dataViewTag5:
        if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
          return false;
        }
        object = object.buffer;
        other = other.buffer;
      case arrayBufferTag4:
        if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array_default(object), new Uint8Array_default(other))) {
          return false;
        }
        return true;
      case boolTag4:
      case dateTag4:
      case numberTag4:
        return eq_default(+object, +other);
      case errorTag3:
        return object.name == other.name && object.message == other.message;
      case regexpTag4:
      case stringTag4:
        return object == other + "";
      case mapTag6:
        var convert = mapToArray_default;
      case setTag6:
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG2;
        convert || (convert = setToArray_default);
        if (object.size != other.size && !isPartial) {
          return false;
        }
        var stacked = stack.get(object);
        if (stacked) {
          return stacked == other;
        }
        bitmask |= COMPARE_UNORDERED_FLAG2;
        stack.set(object, other);
        var result = equalArrays_default(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
        stack["delete"](object);
        return result;
      case symbolTag4:
        if (symbolValueOf2) {
          return symbolValueOf2.call(object) == symbolValueOf2.call(other);
        }
    }
    return false;
  }
  var equalByTag_default = equalByTag;

  // node_modules/lodash-es/_equalObjects.js
  var COMPARE_PARTIAL_FLAG3 = 1;
  var objectProto15 = Object.prototype;
  var hasOwnProperty12 = objectProto15.hasOwnProperty;
  function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG3, objProps = getAllKeys_default(object), objLength = objProps.length, othProps = getAllKeys_default(other), othLength = othProps.length;
    if (objLength != othLength && !isPartial) {
      return false;
    }
    var index = objLength;
    while (index--) {
      var key = objProps[index];
      if (!(isPartial ? key in other : hasOwnProperty12.call(other, key))) {
        return false;
      }
    }
    var objStacked = stack.get(object);
    var othStacked = stack.get(other);
    if (objStacked && othStacked) {
      return objStacked == other && othStacked == object;
    }
    var result = true;
    stack.set(object, other);
    stack.set(other, object);
    var skipCtor = isPartial;
    while (++index < objLength) {
      key = objProps[index];
      var objValue = object[key], othValue = other[key];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
      }
      if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
        result = false;
        break;
      }
      skipCtor || (skipCtor = key == "constructor");
    }
    if (result && !skipCtor) {
      var objCtor = object.constructor, othCtor = other.constructor;
      if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
        result = false;
      }
    }
    stack["delete"](object);
    stack["delete"](other);
    return result;
  }
  var equalObjects_default = equalObjects;

  // node_modules/lodash-es/_baseIsEqualDeep.js
  var COMPARE_PARTIAL_FLAG4 = 1;
  var argsTag4 = "[object Arguments]";
  var arrayTag3 = "[object Array]";
  var objectTag5 = "[object Object]";
  var objectProto16 = Object.prototype;
  var hasOwnProperty13 = objectProto16.hasOwnProperty;
  function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
    var objIsArr = isArray_default(object), othIsArr = isArray_default(other), objTag = objIsArr ? arrayTag3 : getTag_default(object), othTag = othIsArr ? arrayTag3 : getTag_default(other);
    objTag = objTag == argsTag4 ? objectTag5 : objTag;
    othTag = othTag == argsTag4 ? objectTag5 : othTag;
    var objIsObj = objTag == objectTag5, othIsObj = othTag == objectTag5, isSameTag = objTag == othTag;
    if (isSameTag && isBuffer_default(object)) {
      if (!isBuffer_default(other)) {
        return false;
      }
      objIsArr = true;
      objIsObj = false;
    }
    if (isSameTag && !objIsObj) {
      stack || (stack = new Stack_default());
      return objIsArr || isTypedArray_default(object) ? equalArrays_default(object, other, bitmask, customizer, equalFunc, stack) : equalByTag_default(object, other, objTag, bitmask, customizer, equalFunc, stack);
    }
    if (!(bitmask & COMPARE_PARTIAL_FLAG4)) {
      var objIsWrapped = objIsObj && hasOwnProperty13.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty13.call(other, "__wrapped__");
      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
        stack || (stack = new Stack_default());
        return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
      }
    }
    if (!isSameTag) {
      return false;
    }
    stack || (stack = new Stack_default());
    return equalObjects_default(object, other, bitmask, customizer, equalFunc, stack);
  }
  var baseIsEqualDeep_default = baseIsEqualDeep;

  // node_modules/lodash-es/_baseIsEqual.js
  function baseIsEqual(value, other, bitmask, customizer, stack) {
    if (value === other) {
      return true;
    }
    if (value == null || other == null || !isObjectLike_default(value) && !isObjectLike_default(other)) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep_default(value, other, bitmask, customizer, baseIsEqual, stack);
  }
  var baseIsEqual_default = baseIsEqual;

  // node_modules/lodash-es/_baseIsMatch.js
  var COMPARE_PARTIAL_FLAG5 = 1;
  var COMPARE_UNORDERED_FLAG3 = 2;
  function baseIsMatch(object, source, matchData, customizer) {
    var index = matchData.length, length = index, noCustomizer = !customizer;
    if (object == null) {
      return !length;
    }
    object = Object(object);
    while (index--) {
      var data = matchData[index];
      if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
        return false;
      }
    }
    while (++index < length) {
      data = matchData[index];
      var key = data[0], objValue = object[key], srcValue = data[1];
      if (noCustomizer && data[2]) {
        if (objValue === void 0 && !(key in object)) {
          return false;
        }
      } else {
        var stack = new Stack_default();
        if (customizer) {
          var result = customizer(objValue, srcValue, key, object, source, stack);
        }
        if (!(result === void 0 ? baseIsEqual_default(srcValue, objValue, COMPARE_PARTIAL_FLAG5 | COMPARE_UNORDERED_FLAG3, customizer, stack) : result)) {
          return false;
        }
      }
    }
    return true;
  }
  var baseIsMatch_default = baseIsMatch;

  // node_modules/lodash-es/_isStrictComparable.js
  function isStrictComparable(value) {
    return value === value && !isObject_default(value);
  }
  var isStrictComparable_default = isStrictComparable;

  // node_modules/lodash-es/_getMatchData.js
  function getMatchData(object) {
    var result = keys_default(object), length = result.length;
    while (length--) {
      var key = result[length], value = object[key];
      result[length] = [key, value, isStrictComparable_default(value)];
    }
    return result;
  }
  var getMatchData_default = getMatchData;

  // node_modules/lodash-es/_matchesStrictComparable.js
  function matchesStrictComparable(key, srcValue) {
    return function(object) {
      if (object == null) {
        return false;
      }
      return object[key] === srcValue && (srcValue !== void 0 || key in Object(object));
    };
  }
  var matchesStrictComparable_default = matchesStrictComparable;

  // node_modules/lodash-es/_baseMatches.js
  function baseMatches(source) {
    var matchData = getMatchData_default(source);
    if (matchData.length == 1 && matchData[0][2]) {
      return matchesStrictComparable_default(matchData[0][0], matchData[0][1]);
    }
    return function(object) {
      return object === source || baseIsMatch_default(object, source, matchData);
    };
  }
  var baseMatches_default = baseMatches;

  // node_modules/lodash-es/_baseHasIn.js
  function baseHasIn(object, key) {
    return object != null && key in Object(object);
  }
  var baseHasIn_default = baseHasIn;

  // node_modules/lodash-es/_hasPath.js
  function hasPath(object, path2, hasFunc) {
    path2 = castPath_default(path2, object);
    var index = -1, length = path2.length, result = false;
    while (++index < length) {
      var key = toKey_default(path2[index]);
      if (!(result = object != null && hasFunc(object, key))) {
        break;
      }
      object = object[key];
    }
    if (result || ++index != length) {
      return result;
    }
    length = object == null ? 0 : object.length;
    return !!length && isLength_default(length) && isIndex_default(key, length) && (isArray_default(object) || isArguments_default(object));
  }
  var hasPath_default = hasPath;

  // node_modules/lodash-es/hasIn.js
  function hasIn(object, path2) {
    return object != null && hasPath_default(object, path2, baseHasIn_default);
  }
  var hasIn_default = hasIn;

  // node_modules/lodash-es/_baseMatchesProperty.js
  var COMPARE_PARTIAL_FLAG6 = 1;
  var COMPARE_UNORDERED_FLAG4 = 2;
  function baseMatchesProperty(path2, srcValue) {
    if (isKey_default(path2) && isStrictComparable_default(srcValue)) {
      return matchesStrictComparable_default(toKey_default(path2), srcValue);
    }
    return function(object) {
      var objValue = get_default(object, path2);
      return objValue === void 0 && objValue === srcValue ? hasIn_default(object, path2) : baseIsEqual_default(srcValue, objValue, COMPARE_PARTIAL_FLAG6 | COMPARE_UNORDERED_FLAG4);
    };
  }
  var baseMatchesProperty_default = baseMatchesProperty;

  // node_modules/lodash-es/_baseProperty.js
  function baseProperty(key) {
    return function(object) {
      return object == null ? void 0 : object[key];
    };
  }
  var baseProperty_default = baseProperty;

  // node_modules/lodash-es/_basePropertyDeep.js
  function basePropertyDeep(path2) {
    return function(object) {
      return baseGet_default(object, path2);
    };
  }
  var basePropertyDeep_default = basePropertyDeep;

  // node_modules/lodash-es/property.js
  function property(path2) {
    return isKey_default(path2) ? baseProperty_default(toKey_default(path2)) : basePropertyDeep_default(path2);
  }
  var property_default2 = property;

  // node_modules/lodash-es/_baseIteratee.js
  function baseIteratee(value) {
    if (typeof value == "function") {
      return value;
    }
    if (value == null) {
      return identity_default;
    }
    if (typeof value == "object") {
      return isArray_default(value) ? baseMatchesProperty_default(value[0], value[1]) : baseMatches_default(value);
    }
    return property_default2(value);
  }
  var baseIteratee_default = baseIteratee;

  // node_modules/lodash-es/_createBaseFor.js
  function createBaseFor(fromRight) {
    return function(object, iteratee, keysFunc) {
      var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
      while (length--) {
        var key = props[fromRight ? length : ++index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }
  var createBaseFor_default = createBaseFor;

  // node_modules/lodash-es/_baseFor.js
  var baseFor = createBaseFor_default();
  var baseFor_default = baseFor;

  // node_modules/lodash-es/_baseForOwn.js
  function baseForOwn(object, iteratee) {
    return object && baseFor_default(object, iteratee, keys_default);
  }
  var baseForOwn_default = baseForOwn;

  // node_modules/lodash-es/_createBaseEach.js
  function createBaseEach(eachFunc, fromRight) {
    return function(collection, iteratee) {
      if (collection == null) {
        return collection;
      }
      if (!isArrayLike_default(collection)) {
        return eachFunc(collection, iteratee);
      }
      var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
      while (fromRight ? index-- : ++index < length) {
        if (iteratee(iterable[index], index, iterable) === false) {
          break;
        }
      }
      return collection;
    };
  }
  var createBaseEach_default = createBaseEach;

  // node_modules/lodash-es/_baseEach.js
  var baseEach = createBaseEach_default(baseForOwn_default);
  var baseEach_default = baseEach;

  // node_modules/lodash-es/now.js
  var now2 = function() {
    return root_default.Date.now();
  };
  var now_default = now2;

  // node_modules/lodash-es/defaults.js
  var objectProto17 = Object.prototype;
  var hasOwnProperty14 = objectProto17.hasOwnProperty;
  var defaults = baseRest_default(function(object, sources) {
    object = Object(object);
    var index = -1;
    var length = sources.length;
    var guard = length > 2 ? sources[2] : void 0;
    if (guard && isIterateeCall_default(sources[0], sources[1], guard)) {
      length = 1;
    }
    while (++index < length) {
      var source = sources[index];
      var props = keysIn_default(source);
      var propsIndex = -1;
      var propsLength = props.length;
      while (++propsIndex < propsLength) {
        var key = props[propsIndex];
        var value = object[key];
        if (value === void 0 || eq_default(value, objectProto17[key]) && !hasOwnProperty14.call(object, key)) {
          object[key] = source[key];
        }
      }
    }
    return object;
  });
  var defaults_default = defaults;

  // node_modules/lodash-es/_assignMergeValue.js
  function assignMergeValue(object, key, value) {
    if (value !== void 0 && !eq_default(object[key], value) || value === void 0 && !(key in object)) {
      baseAssignValue_default(object, key, value);
    }
  }
  var assignMergeValue_default = assignMergeValue;

  // node_modules/lodash-es/isArrayLikeObject.js
  function isArrayLikeObject(value) {
    return isObjectLike_default(value) && isArrayLike_default(value);
  }
  var isArrayLikeObject_default = isArrayLikeObject;

  // node_modules/lodash-es/_safeGet.js
  function safeGet(object, key) {
    if (key === "constructor" && typeof object[key] === "function") {
      return;
    }
    if (key == "__proto__") {
      return;
    }
    return object[key];
  }
  var safeGet_default = safeGet;

  // node_modules/lodash-es/toPlainObject.js
  function toPlainObject(value) {
    return copyObject_default(value, keysIn_default(value));
  }
  var toPlainObject_default = toPlainObject;

  // node_modules/lodash-es/_baseMergeDeep.js
  function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
    var objValue = safeGet_default(object, key), srcValue = safeGet_default(source, key), stacked = stack.get(srcValue);
    if (stacked) {
      assignMergeValue_default(object, key, stacked);
      return;
    }
    var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : void 0;
    var isCommon = newValue === void 0;
    if (isCommon) {
      var isArr = isArray_default(srcValue), isBuff = !isArr && isBuffer_default(srcValue), isTyped = !isArr && !isBuff && isTypedArray_default(srcValue);
      newValue = srcValue;
      if (isArr || isBuff || isTyped) {
        if (isArray_default(objValue)) {
          newValue = objValue;
        } else if (isArrayLikeObject_default(objValue)) {
          newValue = copyArray_default(objValue);
        } else if (isBuff) {
          isCommon = false;
          newValue = cloneBuffer_default(srcValue, true);
        } else if (isTyped) {
          isCommon = false;
          newValue = cloneTypedArray_default(srcValue, true);
        } else {
          newValue = [];
        }
      } else if (isPlainObject_default(srcValue) || isArguments_default(srcValue)) {
        newValue = objValue;
        if (isArguments_default(objValue)) {
          newValue = toPlainObject_default(objValue);
        } else if (!isObject_default(objValue) || isFunction_default(objValue)) {
          newValue = initCloneObject_default(srcValue);
        }
      } else {
        isCommon = false;
      }
    }
    if (isCommon) {
      stack.set(srcValue, newValue);
      mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
      stack["delete"](srcValue);
    }
    assignMergeValue_default(object, key, newValue);
  }
  var baseMergeDeep_default = baseMergeDeep;

  // node_modules/lodash-es/_baseMerge.js
  function baseMerge(object, source, srcIndex, customizer, stack) {
    if (object === source) {
      return;
    }
    baseFor_default(source, function(srcValue, key) {
      stack || (stack = new Stack_default());
      if (isObject_default(srcValue)) {
        baseMergeDeep_default(object, source, key, srcIndex, baseMerge, customizer, stack);
      } else {
        var newValue = customizer ? customizer(safeGet_default(object, key), srcValue, key + "", object, source, stack) : void 0;
        if (newValue === void 0) {
          newValue = srcValue;
        }
        assignMergeValue_default(object, key, newValue);
      }
    }, keysIn_default);
  }
  var baseMerge_default = baseMerge;

  // node_modules/lodash-es/_arrayIncludesWith.js
  function arrayIncludesWith(array2, value, comparator) {
    var index = -1, length = array2 == null ? 0 : array2.length;
    while (++index < length) {
      if (comparator(value, array2[index])) {
        return true;
      }
    }
    return false;
  }
  var arrayIncludesWith_default = arrayIncludesWith;

  // node_modules/lodash-es/last.js
  function last(array2) {
    var length = array2 == null ? 0 : array2.length;
    return length ? array2[length - 1] : void 0;
  }
  var last_default = last;

  // node_modules/lodash-es/_castFunction.js
  function castFunction(value) {
    return typeof value == "function" ? value : identity_default;
  }
  var castFunction_default = castFunction;

  // node_modules/lodash-es/forEach.js
  function forEach(collection, iteratee) {
    var func = isArray_default(collection) ? arrayEach_default : baseEach_default;
    return func(collection, castFunction_default(iteratee));
  }
  var forEach_default = forEach;

  // node_modules/lodash-es/_baseFilter.js
  function baseFilter(collection, predicate) {
    var result = [];
    baseEach_default(collection, function(value, index, collection2) {
      if (predicate(value, index, collection2)) {
        result.push(value);
      }
    });
    return result;
  }
  var baseFilter_default = baseFilter;

  // node_modules/lodash-es/filter.js
  function filter2(collection, predicate) {
    var func = isArray_default(collection) ? arrayFilter_default : baseFilter_default;
    return func(collection, baseIteratee_default(predicate, 3));
  }
  var filter_default3 = filter2;

  // node_modules/lodash-es/_createFind.js
  function createFind(findIndexFunc) {
    return function(collection, predicate, fromIndex) {
      var iterable = Object(collection);
      if (!isArrayLike_default(collection)) {
        var iteratee = baseIteratee_default(predicate, 3);
        collection = keys_default(collection);
        predicate = function(key) {
          return iteratee(iterable[key], key, iterable);
        };
      }
      var index = findIndexFunc(collection, predicate, fromIndex);
      return index > -1 ? iterable[iteratee ? collection[index] : index] : void 0;
    };
  }
  var createFind_default = createFind;

  // node_modules/lodash-es/findIndex.js
  var nativeMax2 = Math.max;
  function findIndex(array2, predicate, fromIndex) {
    var length = array2 == null ? 0 : array2.length;
    if (!length) {
      return -1;
    }
    var index = fromIndex == null ? 0 : toInteger_default(fromIndex);
    if (index < 0) {
      index = nativeMax2(length + index, 0);
    }
    return baseFindIndex_default(array2, baseIteratee_default(predicate, 3), index);
  }
  var findIndex_default = findIndex;

  // node_modules/lodash-es/find.js
  var find2 = createFind_default(findIndex_default);
  var find_default = find2;

  // node_modules/lodash-es/_baseMap.js
  function baseMap(collection, iteratee) {
    var index = -1, result = isArrayLike_default(collection) ? Array(collection.length) : [];
    baseEach_default(collection, function(value, key, collection2) {
      result[++index] = iteratee(value, key, collection2);
    });
    return result;
  }
  var baseMap_default = baseMap;

  // node_modules/lodash-es/map.js
  function map(collection, iteratee) {
    var func = isArray_default(collection) ? arrayMap_default : baseMap_default;
    return func(collection, baseIteratee_default(iteratee, 3));
  }
  var map_default = map;

  // node_modules/lodash-es/forIn.js
  function forIn(object, iteratee) {
    return object == null ? object : baseFor_default(object, castFunction_default(iteratee), keysIn_default);
  }
  var forIn_default = forIn;

  // node_modules/lodash-es/forOwn.js
  function forOwn(object, iteratee) {
    return object && baseForOwn_default(object, castFunction_default(iteratee));
  }
  var forOwn_default = forOwn;

  // node_modules/lodash-es/_baseGt.js
  function baseGt(value, other) {
    return value > other;
  }
  var baseGt_default = baseGt;

  // node_modules/lodash-es/_baseHas.js
  var objectProto18 = Object.prototype;
  var hasOwnProperty15 = objectProto18.hasOwnProperty;
  function baseHas(object, key) {
    return object != null && hasOwnProperty15.call(object, key);
  }
  var baseHas_default = baseHas;

  // node_modules/lodash-es/has.js
  function has(object, path2) {
    return object != null && hasPath_default(object, path2, baseHas_default);
  }
  var has_default = has;

  // node_modules/lodash-es/isString.js
  var stringTag5 = "[object String]";
  function isString2(value) {
    return typeof value == "string" || !isArray_default(value) && isObjectLike_default(value) && baseGetTag_default(value) == stringTag5;
  }
  var isString_default = isString2;

  // node_modules/lodash-es/_baseValues.js
  function baseValues(object, props) {
    return arrayMap_default(props, function(key) {
      return object[key];
    });
  }
  var baseValues_default = baseValues;

  // node_modules/lodash-es/values.js
  function values(object) {
    return object == null ? [] : baseValues_default(object, keys_default(object));
  }
  var values_default = values;

  // node_modules/lodash-es/isEmpty.js
  var mapTag7 = "[object Map]";
  var setTag7 = "[object Set]";
  var objectProto19 = Object.prototype;
  var hasOwnProperty16 = objectProto19.hasOwnProperty;
  function isEmpty(value) {
    if (value == null) {
      return true;
    }
    if (isArrayLike_default(value) && (isArray_default(value) || typeof value == "string" || typeof value.splice == "function" || isBuffer_default(value) || isTypedArray_default(value) || isArguments_default(value))) {
      return !value.length;
    }
    var tag = getTag_default(value);
    if (tag == mapTag7 || tag == setTag7) {
      return !value.size;
    }
    if (isPrototype_default(value)) {
      return !baseKeys_default(value).length;
    }
    for (var key in value) {
      if (hasOwnProperty16.call(value, key)) {
        return false;
      }
    }
    return true;
  }
  var isEmpty_default = isEmpty;

  // node_modules/lodash-es/isUndefined.js
  function isUndefined(value) {
    return value === void 0;
  }
  var isUndefined_default = isUndefined;

  // node_modules/lodash-es/_baseLt.js
  function baseLt(value, other) {
    return value < other;
  }
  var baseLt_default = baseLt;

  // node_modules/lodash-es/mapValues.js
  function mapValues(object, iteratee) {
    var result = {};
    iteratee = baseIteratee_default(iteratee, 3);
    baseForOwn_default(object, function(value, key, object2) {
      baseAssignValue_default(result, key, iteratee(value, key, object2));
    });
    return result;
  }
  var mapValues_default = mapValues;

  // node_modules/lodash-es/_baseExtremum.js
  function baseExtremum(array2, iteratee, comparator) {
    var index = -1, length = array2.length;
    while (++index < length) {
      var value = array2[index], current = iteratee(value);
      if (current != null && (computed === void 0 ? current === current && !isSymbol_default(current) : comparator(current, computed))) {
        var computed = current, result = value;
      }
    }
    return result;
  }
  var baseExtremum_default = baseExtremum;

  // node_modules/lodash-es/max.js
  function max2(array2) {
    return array2 && array2.length ? baseExtremum_default(array2, identity_default, baseGt_default) : void 0;
  }
  var max_default = max2;

  // node_modules/lodash-es/merge.js
  var merge = createAssigner_default(function(object, source, srcIndex) {
    baseMerge_default(object, source, srcIndex);
  });
  var merge_default3 = merge;

  // node_modules/lodash-es/min.js
  function min2(array2) {
    return array2 && array2.length ? baseExtremum_default(array2, identity_default, baseLt_default) : void 0;
  }
  var min_default = min2;

  // node_modules/lodash-es/minBy.js
  function minBy(array2, iteratee) {
    return array2 && array2.length ? baseExtremum_default(array2, baseIteratee_default(iteratee, 2), baseLt_default) : void 0;
  }
  var minBy_default = minBy;

  // node_modules/lodash-es/_baseSet.js
  function baseSet(object, path2, value, customizer) {
    if (!isObject_default(object)) {
      return object;
    }
    path2 = castPath_default(path2, object);
    var index = -1, length = path2.length, lastIndex = length - 1, nested = object;
    while (nested != null && ++index < length) {
      var key = toKey_default(path2[index]), newValue = value;
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        return object;
      }
      if (index != lastIndex) {
        var objValue = nested[key];
        newValue = customizer ? customizer(objValue, key, nested) : void 0;
        if (newValue === void 0) {
          newValue = isObject_default(objValue) ? objValue : isIndex_default(path2[index + 1]) ? [] : {};
        }
      }
      assignValue_default(nested, key, newValue);
      nested = nested[key];
    }
    return object;
  }
  var baseSet_default = baseSet;

  // node_modules/lodash-es/_basePickBy.js
  function basePickBy(object, paths, predicate) {
    var index = -1, length = paths.length, result = {};
    while (++index < length) {
      var path2 = paths[index], value = baseGet_default(object, path2);
      if (predicate(value, path2)) {
        baseSet_default(result, castPath_default(path2, object), value);
      }
    }
    return result;
  }
  var basePickBy_default = basePickBy;

  // node_modules/lodash-es/_baseSortBy.js
  function baseSortBy(array2, comparer) {
    var length = array2.length;
    array2.sort(comparer);
    while (length--) {
      array2[length] = array2[length].value;
    }
    return array2;
  }
  var baseSortBy_default = baseSortBy;

  // node_modules/lodash-es/_compareAscending.js
  function compareAscending(value, other) {
    if (value !== other) {
      var valIsDefined = value !== void 0, valIsNull = value === null, valIsReflexive = value === value, valIsSymbol = isSymbol_default(value);
      var othIsDefined = other !== void 0, othIsNull = other === null, othIsReflexive = other === other, othIsSymbol = isSymbol_default(other);
      if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
        return 1;
      }
      if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
        return -1;
      }
    }
    return 0;
  }
  var compareAscending_default = compareAscending;

  // node_modules/lodash-es/_compareMultiple.js
  function compareMultiple(object, other, orders) {
    var index = -1, objCriteria = object.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length;
    while (++index < length) {
      var result = compareAscending_default(objCriteria[index], othCriteria[index]);
      if (result) {
        if (index >= ordersLength) {
          return result;
        }
        var order2 = orders[index];
        return result * (order2 == "desc" ? -1 : 1);
      }
    }
    return object.index - other.index;
  }
  var compareMultiple_default = compareMultiple;

  // node_modules/lodash-es/_baseOrderBy.js
  function baseOrderBy(collection, iteratees, orders) {
    if (iteratees.length) {
      iteratees = arrayMap_default(iteratees, function(iteratee) {
        if (isArray_default(iteratee)) {
          return function(value) {
            return baseGet_default(value, iteratee.length === 1 ? iteratee[0] : iteratee);
          };
        }
        return iteratee;
      });
    } else {
      iteratees = [identity_default];
    }
    var index = -1;
    iteratees = arrayMap_default(iteratees, baseUnary_default(baseIteratee_default));
    var result = baseMap_default(collection, function(value, key, collection2) {
      var criteria = arrayMap_default(iteratees, function(iteratee) {
        return iteratee(value);
      });
      return { "criteria": criteria, "index": ++index, "value": value };
    });
    return baseSortBy_default(result, function(object, other) {
      return compareMultiple_default(object, other, orders);
    });
  }
  var baseOrderBy_default = baseOrderBy;

  // node_modules/lodash-es/_asciiSize.js
  var asciiSize = baseProperty_default("length");
  var asciiSize_default = asciiSize;

  // node_modules/lodash-es/_unicodeSize.js
  var rsAstralRange2 = "\\ud800-\\udfff";
  var rsComboMarksRange2 = "\\u0300-\\u036f";
  var reComboHalfMarksRange2 = "\\ufe20-\\ufe2f";
  var rsComboSymbolsRange2 = "\\u20d0-\\u20ff";
  var rsComboRange2 = rsComboMarksRange2 + reComboHalfMarksRange2 + rsComboSymbolsRange2;
  var rsVarRange2 = "\\ufe0e\\ufe0f";
  var rsAstral = "[" + rsAstralRange2 + "]";
  var rsCombo = "[" + rsComboRange2 + "]";
  var rsFitz = "\\ud83c[\\udffb-\\udfff]";
  var rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")";
  var rsNonAstral = "[^" + rsAstralRange2 + "]";
  var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
  var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
  var rsZWJ2 = "\\u200d";
  var reOptMod = rsModifier + "?";
  var rsOptVar = "[" + rsVarRange2 + "]?";
  var rsOptJoin = "(?:" + rsZWJ2 + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*";
  var rsSeq = rsOptVar + reOptMod + rsOptJoin;
  var rsSymbol = "(?:" + [rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
  var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
  function unicodeSize(string) {
    var result = reUnicode.lastIndex = 0;
    while (reUnicode.test(string)) {
      ++result;
    }
    return result;
  }
  var unicodeSize_default = unicodeSize;

  // node_modules/lodash-es/_stringSize.js
  function stringSize(string) {
    return hasUnicode_default(string) ? unicodeSize_default(string) : asciiSize_default(string);
  }
  var stringSize_default = stringSize;

  // node_modules/lodash-es/_basePick.js
  function basePick(object, paths) {
    return basePickBy_default(object, paths, function(value, path2) {
      return hasIn_default(object, path2);
    });
  }
  var basePick_default = basePick;

  // node_modules/lodash-es/pick.js
  var pick = flatRest_default(function(object, paths) {
    return object == null ? {} : basePick_default(object, paths);
  });
  var pick_default = pick;

  // node_modules/lodash-es/_baseRange.js
  var nativeCeil = Math.ceil;
  var nativeMax3 = Math.max;
  function baseRange(start2, end, step, fromRight) {
    var index = -1, length = nativeMax3(nativeCeil((end - start2) / (step || 1)), 0), result = Array(length);
    while (length--) {
      result[fromRight ? length : ++index] = start2;
      start2 += step;
    }
    return result;
  }
  var baseRange_default = baseRange;

  // node_modules/lodash-es/_createRange.js
  function createRange(fromRight) {
    return function(start2, end, step) {
      if (step && typeof step != "number" && isIterateeCall_default(start2, end, step)) {
        end = step = void 0;
      }
      start2 = toFinite_default(start2);
      if (end === void 0) {
        end = start2;
        start2 = 0;
      } else {
        end = toFinite_default(end);
      }
      step = step === void 0 ? start2 < end ? 1 : -1 : toFinite_default(step);
      return baseRange_default(start2, end, step, fromRight);
    };
  }
  var createRange_default = createRange;

  // node_modules/lodash-es/range.js
  var range = createRange_default();
  var range_default = range;

  // node_modules/lodash-es/_baseReduce.js
  function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
    eachFunc(collection, function(value, index, collection2) {
      accumulator = initAccum ? (initAccum = false, value) : iteratee(accumulator, value, index, collection2);
    });
    return accumulator;
  }
  var baseReduce_default = baseReduce;

  // node_modules/lodash-es/reduce.js
  function reduce(collection, iteratee, accumulator) {
    var func = isArray_default(collection) ? arrayReduce_default : baseReduce_default, initAccum = arguments.length < 3;
    return func(collection, baseIteratee_default(iteratee, 4), accumulator, initAccum, baseEach_default);
  }
  var reduce_default = reduce;

  // node_modules/lodash-es/size.js
  var mapTag8 = "[object Map]";
  var setTag8 = "[object Set]";
  function size(collection) {
    if (collection == null) {
      return 0;
    }
    if (isArrayLike_default(collection)) {
      return isString_default(collection) ? stringSize_default(collection) : collection.length;
    }
    var tag = getTag_default(collection);
    if (tag == mapTag8 || tag == setTag8) {
      return collection.size;
    }
    return baseKeys_default(collection).length;
  }
  var size_default2 = size;

  // node_modules/lodash-es/sortBy.js
  var sortBy = baseRest_default(function(collection, iteratees) {
    if (collection == null) {
      return [];
    }
    var length = iteratees.length;
    if (length > 1 && isIterateeCall_default(collection, iteratees[0], iteratees[1])) {
      iteratees = [];
    } else if (length > 2 && isIterateeCall_default(iteratees[0], iteratees[1], iteratees[2])) {
      iteratees = [iteratees[0]];
    }
    return baseOrderBy_default(collection, baseFlatten_default(iteratees, 1), []);
  });
  var sortBy_default = sortBy;

  // node_modules/lodash-es/_createSet.js
  var INFINITY4 = 1 / 0;
  var createSet = !(Set_default && 1 / setToArray_default(new Set_default([, -0]))[1] == INFINITY4) ? noop_default : function(values2) {
    return new Set_default(values2);
  };
  var createSet_default = createSet;

  // node_modules/lodash-es/_baseUniq.js
  var LARGE_ARRAY_SIZE2 = 200;
  function baseUniq(array2, iteratee, comparator) {
    var index = -1, includes = arrayIncludes_default, length = array2.length, isCommon = true, result = [], seen = result;
    if (comparator) {
      isCommon = false;
      includes = arrayIncludesWith_default;
    } else if (length >= LARGE_ARRAY_SIZE2) {
      var set3 = iteratee ? null : createSet_default(array2);
      if (set3) {
        return setToArray_default(set3);
      }
      isCommon = false;
      includes = cacheHas_default;
      seen = new SetCache_default();
    } else {
      seen = iteratee ? [] : result;
    }
    outer:
      while (++index < length) {
        var value = array2[index], computed = iteratee ? iteratee(value) : value;
        value = comparator || value !== 0 ? value : 0;
        if (isCommon && computed === computed) {
          var seenIndex = seen.length;
          while (seenIndex--) {
            if (seen[seenIndex] === computed) {
              continue outer;
            }
          }
          if (iteratee) {
            seen.push(computed);
          }
          result.push(value);
        } else if (!includes(seen, computed, comparator)) {
          if (seen !== result) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
    return result;
  }
  var baseUniq_default = baseUniq;

  // node_modules/lodash-es/union.js
  var union = baseRest_default(function(arrays) {
    return baseUniq_default(baseFlatten_default(arrays, 1, isArrayLikeObject_default, true));
  });
  var union_default = union;

  // node_modules/lodash-es/uniqueId.js
  var idCounter = 0;
  function uniqueId(prefix) {
    var id2 = ++idCounter;
    return toString_default(prefix) + id2;
  }
  var uniqueId_default = uniqueId;

  // node_modules/lodash-es/_baseZipObject.js
  function baseZipObject(props, values2, assignFunc) {
    var index = -1, length = props.length, valsLength = values2.length, result = {};
    while (++index < length) {
      var value = index < valsLength ? values2[index] : void 0;
      assignFunc(result, props[index], value);
    }
    return result;
  }
  var baseZipObject_default = baseZipObject;

  // node_modules/lodash-es/zipObject.js
  function zipObject(props, values2) {
    return baseZipObject_default(props || [], values2 || [], assignValue_default);
  }
  var zipObject_default = zipObject;

  // node_modules/dagre-d3-es/src/graphlib/index.js
  var graphlib_exports = {};
  __export(graphlib_exports, {
    Graph: () => Graph,
    version: () => version
  });

  // node_modules/dagre-d3-es/src/graphlib/graph.js
  var DEFAULT_EDGE_NAME = "\0";
  var GRAPH_NODE = "\0";
  var EDGE_KEY_DELIM = "";
  var Graph = class {
    /**
     * @param {GraphOptions} [opts] - Graph options.
     */
    constructor(opts = {}) {
      this._isDirected = Object.prototype.hasOwnProperty.call(opts, "directed") ? opts.directed : true;
      this._isMultigraph = Object.prototype.hasOwnProperty.call(opts, "multigraph") ? opts.multigraph : false;
      this._isCompound = Object.prototype.hasOwnProperty.call(opts, "compound") ? opts.compound : false;
      this._label = void 0;
      this._defaultNodeLabelFn = constant_default6(void 0);
      this._defaultEdgeLabelFn = constant_default6(void 0);
      this._nodes = {};
      if (this._isCompound) {
        this._parent = {};
        this._children = {};
        this._children[GRAPH_NODE] = {};
      }
      this._in = {};
      this._preds = {};
      this._out = {};
      this._sucs = {};
      this._edgeObjs = {};
      this._edgeLabels = {};
    }
    /* === Graph functions ========= */
    /**
     *
     * @returns {boolean} `true` if the graph is [directed](https://en.wikipedia.org/wiki/Directed_graph).
     * A directed graph treats the order of nodes in an edge as significant whereas an
     * [undirected](https://en.wikipedia.org/wiki/Graph_(mathematics)#Undirected_graph)
     * graph does not.
     * This example demonstrates the difference:
     *
     * @example
     *
     * ```js
     * var directed = new Graph({ directed: true });
     * directed.setEdge("a", "b", "my-label");
     * directed.edge("a", "b"); // returns "my-label"
     * directed.edge("b", "a"); // returns undefined
     *
     * var undirected = new Graph({ directed: false });
     * undirected.setEdge("a", "b", "my-label");
     * undirected.edge("a", "b"); // returns "my-label"
     * undirected.edge("b", "a"); // returns "my-label"
     * ```
     */
    isDirected() {
      return this._isDirected;
    }
    /**
     * @returns {boolean} `true` if the graph is a multigraph.
     */
    isMultigraph() {
      return this._isMultigraph;
    }
    /**
     * @returns {boolean} `true` if the graph is compound.
     */
    isCompound() {
      return this._isCompound;
    }
    /**
     * Sets the label for the graph to `label`.
     *
     * @param {GraphLabel} label - Label for the graph.
     * @returns {this}
     */
    setGraph(label) {
      this._label = label;
      return this;
    }
    /**
     * @returns {GraphLabel | undefined} the currently assigned label for the graph.
     * If no label has been assigned, returns `undefined`.
     *
     * @example
     *
     * ```js
     * var g = new Graph();
     * g.graph(); // returns undefined
     * g.setGraph("graph-label");
     *  g.graph(); // returns "graph-label"
     * ```
     */
    graph() {
      return this._label;
    }
    /* === Node functions ========== */
    /**
     * Sets a new default value that is assigned to nodes that are created without
     * a label.
     *
     * @param {typeof this._defaultNodeLabelFn | NodeLabel} newDefault - If a function,
     * it is called with the id of the node being created.
     * Otherwise, it is assigned as the label directly.
     * @returns {this}
     */
    setDefaultNodeLabel(newDefault) {
      if (!isFunction_default(newDefault)) {
        newDefault = constant_default6(newDefault);
      }
      this._defaultNodeLabelFn = newDefault;
      return this;
    }
    /**
     * @returns {number} the number of nodes in the graph.
     */
    nodeCount() {
      return this._nodeCount;
    }
    /**
     * @returns {NodeID[]} the ids of the nodes in the graph.
     *
     * @remarks
     * Use {@link node()} to get the label for each node.
     * Takes `O(|V|)` time.
     */
    nodes() {
      return keys_default(this._nodes);
    }
    /**
     * @returns {NodeID[]} those nodes in the graph that have no in-edges.
     * @remarks Takes `O(|V|)` time.
     */
    sources() {
      var self2 = this;
      return filter_default3(this.nodes(), function(v) {
        return isEmpty_default(self2._in[v]);
      });
    }
    /**
     * @returns {NodeID[]} those nodes in the graph that have no out-edges.
     * @remarks Takes `O(|V|)` time.
     */
    sinks() {
      var self2 = this;
      return filter_default3(this.nodes(), function(v) {
        return isEmpty_default(self2._out[v]);
      });
    }
    /**
     * Invokes setNode method for each node in `vs` list.
     *
     * @param {Collection<NodeID | number>} vs - List of node IDs to create/set.
     * @param {NodeLabel} [value] - If set, update all nodes with this value.
     * @returns {this}
     * @remarks Complexity: O(|names|).
     */
    setNodes(vs, value) {
      var args = arguments;
      var self2 = this;
      forEach_default(vs, function(v) {
        if (args.length > 1) {
          self2.setNode(v, value);
        } else {
          self2.setNode(v);
        }
      });
      return this;
    }
    /**
     * Creates or updates the value for the node `v` in the graph.
     *
     * @param {NodeID | number} v - ID of the node to create/set.
     * @param {NodeLabel} [value] - If supplied, it is set as the value for the node.
     * If not supplied and the node was created by this call then
     * {@link setDefaultNodeLabel} will be used to set the node's value.
     * @returns {this} the graph, allowing this to be chained with other functions.
     * @remarks Takes `O(1)` time.
     */
    setNode(v, value) {
      if (Object.prototype.hasOwnProperty.call(this._nodes, v)) {
        if (arguments.length > 1) {
          this._nodes[v] = value;
        }
        return this;
      }
      this._nodes[v] = arguments.length > 1 ? value : this._defaultNodeLabelFn(v);
      if (this._isCompound) {
        this._parent[v] = GRAPH_NODE;
        this._children[v] = {};
        this._children[GRAPH_NODE][v] = true;
      }
      this._in[v] = {};
      this._preds[v] = {};
      this._out[v] = {};
      this._sucs[v] = {};
      ++this._nodeCount;
      return this;
    }
    /**
     * Gets the label of node with specified name.
     *
     * @param {NodeID | number} v - Node ID.
     * @returns {NodeLabel | undefined} the label assigned to the node with the id `v`
     * if it is in the graph.
     * Otherwise returns `undefined`.
     * @remarks Takes `O(1)` time.
     */
    node(v) {
      return this._nodes[v];
    }
    /**
     * Detects whether graph has a node with specified name or not.
     *
     * @param {NodeID | number} v - Node ID.
     * @returns {boolean} Returns `true` the graph has a node with the id.
     * @remarks Takes `O(1)` time.
     */
    hasNode(v) {
      return Object.prototype.hasOwnProperty.call(this._nodes, v);
    }
    /**
     * Remove the node with the id `v` in the graph or do nothing if the node is
     * not in the graph.
     *
     * If the node was removed this function also removes any incident edges.
     *
     * @param {NodeID | number} v - Node ID to remove.
     * @returns {this} the graph, allowing this to be chained with other functions.
     * @remarks Takes `O(|E|)` time.
     */
    removeNode(v) {
      if (Object.prototype.hasOwnProperty.call(this._nodes, v)) {
        var removeEdge = (e) => this.removeEdge(this._edgeObjs[e]);
        delete this._nodes[v];
        if (this._isCompound) {
          this._removeFromParentsChildList(v);
          delete this._parent[v];
          forEach_default(this.children(v), (child) => {
            this.setParent(child);
          });
          delete this._children[v];
        }
        forEach_default(keys_default(this._in[v]), removeEdge);
        delete this._in[v];
        delete this._preds[v];
        forEach_default(keys_default(this._out[v]), removeEdge);
        delete this._out[v];
        delete this._sucs[v];
        --this._nodeCount;
      }
      return this;
    }
    /**
     * Sets the parent for `v` to `parent` if it is defined or removes the parent
     * for `v` if `parent` is undefined.
     *
     * @param {NodeID | number} v - Node ID to set the parent for.
     * @param {NodeID | number} [parent] - Parent node ID. If not defined, removes the parent.
     * @returns {this} the graph, allowing this to be chained with other functions.
     * @throws if the graph is not compound.
     * @throws if setting the parent would create a cycle.
     * @remarks Takes `O(1)` time.
     */
    setParent(v, parent) {
      if (!this._isCompound) {
        throw new Error("Cannot set parent in a non-compound graph");
      }
      if (isUndefined_default(parent)) {
        parent = GRAPH_NODE;
      } else {
        parent += "";
        for (var ancestor = parent; !isUndefined_default(ancestor); ancestor = this.parent(ancestor)) {
          if (ancestor === v) {
            throw new Error("Setting " + parent + " as parent of " + v + " would create a cycle");
          }
        }
        this.setNode(parent);
      }
      this.setNode(v);
      this._removeFromParentsChildList(v);
      this._parent[v] = parent;
      this._children[parent][v] = true;
      return this;
    }
    /**
     * @private
     * @param {NodeID | number} v - Node ID.
     */
    _removeFromParentsChildList(v) {
      delete this._children[this._parent[v]][v];
    }
    /**
     * Get parent node for node `v`.
     *
     * @param {NodeID | number} v - Node ID.
     * @returns {NodeID | undefined} the node that is a parent of node `v`
     * or `undefined` if node `v` does not have a parent or is not a member of
     * the graph.
     * Always returns `undefined` for graphs that are not compound.
     * @remarks Takes `O(1)` time.
     */
    parent(v) {
      if (this._isCompound) {
        var parent = this._parent[v];
        if (parent !== GRAPH_NODE) {
          return parent;
        }
      }
    }
    /**
     * Gets list of direct children of node v.
     *
     * @param {NodeID | number} [v] - Node ID. If not specified, gets nodes
     * with no parent (top-level nodes).
     * @returns {NodeID[] | undefined} all nodes that are children of node `v` or
     * `undefined` if node `v` is not in the graph.
     * Always returns `[]` for graphs that are not compound.
     * @remarks Takes `O(|V|)` time.
     */
    children(v) {
      if (isUndefined_default(v)) {
        v = GRAPH_NODE;
      }
      if (this._isCompound) {
        var children2 = this._children[v];
        if (children2) {
          return keys_default(children2);
        }
      } else if (v === GRAPH_NODE) {
        return this.nodes();
      } else if (this.hasNode(v)) {
        return [];
      }
    }
    /**
     * @param {NodeID | number} v - Node ID.
     * @returns {NodeID[] | undefined} all nodes that are predecessors of the
     * specified node or `undefined` if node `v` is not in the graph.
     * @remarks
     * Behavior is undefined for undirected graphs - use {@link neighbors} instead.
     * Takes `O(|V|)` time.
     */
    predecessors(v) {
      var predsV = this._preds[v];
      if (predsV) {
        return keys_default(predsV);
      }
    }
    /**
     * @param {NodeID | number} v - Node ID.
     * @returns {NodeID[] | undefined} all nodes that are successors of the
     * specified node or `undefined` if node `v` is not in the graph.
     * @remarks
     * Behavior is undefined for undirected graphs - use {@link neighbors} instead.
     * Takes `O(|V|)` time.
     */
    successors(v) {
      var sucsV = this._sucs[v];
      if (sucsV) {
        return keys_default(sucsV);
      }
    }
    /**
     * @param {NodeID | number} v - Node ID.
     * @returns {NodeID[] | undefined} all nodes that are predecessors or
     * successors of the specified node
     * or `undefined` if node `v` is not in the graph.
     * @remarks Takes `O(|V|)` time.
     */
    neighbors(v) {
      var preds = this.predecessors(v);
      if (preds) {
        return union_default(preds, this.successors(v));
      }
    }
    /**
     * @param {NodeID | number} v - Node ID.
     * @returns {boolean} True if the node is a leaf (has no successors), false otherwise.
     */
    isLeaf(v) {
      var neighbors;
      if (this.isDirected()) {
        neighbors = this.successors(v);
      } else {
        neighbors = this.neighbors(v);
      }
      return neighbors.length === 0;
    }
    /**
       * Creates new graph with nodes filtered via `filter`.
       * Edges incident to rejected node
       * are also removed.
       * 
       * In case of compound graph, if parent is rejected by `filter`,
       * than all its children are rejected too.
    
       * @param {(v: NodeID) => boolean} filter - Function that returns `true` for nodes to keep.
       * @returns {Graph<GraphLabel, NodeLabel, EdgeLabel>} A new graph containing only the nodes for which `filter` returns `true`.
       * @remarks Average-case complexity: O(|E|+|V|).
       */
    filterNodes(filter3) {
      var copy = new this.constructor({
        directed: this._isDirected,
        multigraph: this._isMultigraph,
        compound: this._isCompound
      });
      copy.setGraph(this.graph());
      var self2 = this;
      forEach_default(this._nodes, function(value, v) {
        if (filter3(v)) {
          copy.setNode(v, value);
        }
      });
      forEach_default(this._edgeObjs, function(e) {
        if (copy.hasNode(e.v) && copy.hasNode(e.w)) {
          copy.setEdge(e, self2.edge(e));
        }
      });
      var parents = {};
      function findParent(v) {
        var parent = self2.parent(v);
        if (parent === void 0 || copy.hasNode(parent)) {
          parents[v] = parent;
          return parent;
        } else if (parent in parents) {
          return parents[parent];
        } else {
          return findParent(parent);
        }
      }
      if (this._isCompound) {
        forEach_default(copy.nodes(), function(v) {
          copy.setParent(v, findParent(v));
        });
      }
      return copy;
    }
    /* === Edge functions ========== */
    /**
     * Sets a new default value that is assigned to edges that are created without
     * a label.
     *
     * @param {typeof this._defaultEdgeLabelFn | EdgeLabel} newDefault - If a function,
     * it is called with the parameters `(v, w, name)`.
     * Otherwise, it is assigned as the label directly.
     * @returns {this}
     */
    setDefaultEdgeLabel(newDefault) {
      if (!isFunction_default(newDefault)) {
        newDefault = constant_default6(newDefault);
      }
      this._defaultEdgeLabelFn = newDefault;
      return this;
    }
    /**
     * @returns {number} the number of edges in the graph.
     * @remarks Complexity: O(1).
     */
    edgeCount() {
      return this._edgeCount;
    }
    /**
     * Gets edges of the graph.
     *
     * @returns {EdgeObj[]} the {@link EdgeObj} for each edge in the graph.
     *
     * @remarks
     * In case of compound graph subgraphs are not considered.
     * Use {@link edge()} to get the label for each edge.
     * Takes `O(|E|)` time.
     */
    edges() {
      return values_default(this._edgeObjs);
    }
    /**
     * Establish an edges path over the nodes in nodes list.
     *
     * If some edge is already exists, it will update its label, otherwise it will
     * create an edge between pair of nodes with label provided or default label
     * if no label provided.
     *
     * @param {Collection<NodeID>} vs - List of node IDs to create edges between.
     * @param {EdgeLabel} [value] - If set, update all edges with this value.
     * @returns {this}
     * @remarks Complexity: O(|nodes|).
     */
    setPath(vs, value) {
      var self2 = this;
      var args = arguments;
      reduce_default(vs, function(v, w) {
        if (args.length > 1) {
          self2.setEdge(v, w, value);
        } else {
          self2.setEdge(v, w);
        }
        return w;
      });
      return this;
    }
    /**
     * Creates or updates the label for the edge (`v`, `w`) with the optionally
     * supplied `name`.
     *
     * @overload
     * @param {EdgeObj} arg0 - Edge object.
     * @param {EdgeLabel} [value] - If supplied, it is set as the label for the edge.
     * If not supplied and the edge was created by this call then
     * {@link setDefaultEdgeLabel} will be used to assign the edge's label.
     * @returns {this} the graph, allowing this to be chained with other functions.
     * @remarks Takes `O(1)` time.
     */
    /**
     * Creates or updates the label for the edge (`v`, `w`) with the optionally
     * supplied `name`.
     *
     * @overload
     * @param {NodeID | number} v - Source node ID. Number values will be coerced to strings.
     * @param {NodeID | number} w - Target node ID. Number values will be coerced to strings.
     * @param {EdgeLabel} [value] - If supplied, it is set as the label for the edge.
     * If not supplied and the edge was created by this call then
     * {@link setDefaultEdgeLabel} will be used to assign the edge's label.
     * @param {string | number} [name] - Edge name. Only useful with multigraphs.
     * @returns {this} the graph, allowing this to be chained with other functions.
     * @remarks Takes `O(1)` time.
     */
    setEdge() {
      var v, w, name, value;
      var valueSpecified = false;
      var arg0 = arguments[0];
      if (typeof arg0 === "object" && arg0 !== null && "v" in arg0) {
        v = arg0.v;
        w = arg0.w;
        name = arg0.name;
        if (arguments.length === 2) {
          value = arguments[1];
          valueSpecified = true;
        }
      } else {
        v = arg0;
        w = arguments[1];
        name = arguments[3];
        if (arguments.length > 2) {
          value = arguments[2];
          valueSpecified = true;
        }
      }
      v = "" + v;
      w = "" + w;
      if (!isUndefined_default(name)) {
        name = "" + name;
      }
      var e = edgeArgsToId(this._isDirected, v, w, name);
      if (Object.prototype.hasOwnProperty.call(this._edgeLabels, e)) {
        if (valueSpecified) {
          this._edgeLabels[e] = value;
        }
        return this;
      }
      if (!isUndefined_default(name) && !this._isMultigraph) {
        throw new Error("Cannot set a named edge when isMultigraph = false");
      }
      this.setNode(v);
      this.setNode(w);
      this._edgeLabels[e] = valueSpecified ? value : this._defaultEdgeLabelFn(v, w, name);
      var edgeObj = edgeArgsToObj(this._isDirected, v, w, name);
      v = edgeObj.v;
      w = edgeObj.w;
      Object.freeze(edgeObj);
      this._edgeObjs[e] = edgeObj;
      incrementOrInitEntry(this._preds[w], v);
      incrementOrInitEntry(this._sucs[v], w);
      this._in[w][e] = edgeObj;
      this._out[v][e] = edgeObj;
      this._edgeCount++;
      return this;
    }
    /**
     * Gets the label for the specified edge.
     *
     * @overload
     * @param {EdgeObj} v - Edge object.
     * @returns {EdgeLabel | undefined} the label for the edge (`v`, `w`) if the
     * graph has an edge between `v` and `w` with the optional `name`.
     * Returned `undefined` if there is no such edge in the graph.
     * @remarks
     * `v` and `w` can be interchanged for undirected graphs.
     * Takes `O(1)` time.
     */
    /**
     * Gets the label for the specified edge.
     *
     * @overload
     * @param {NodeID | number} v - Source node ID.
     * @param {NodeID | number} w - Target node ID.
     * @param {string | number} [name] - Edge name. Only useful with multigraphs.
     * @returns {EdgeLabel | undefined} the label for the edge (`v`, `w`) if the
     * graph has an edge between `v` and `w` with the optional `name`.
     * Returned `undefined` if there is no such edge in the graph.
     * @remarks
     * `v` and `w` can be interchanged for undirected graphs.
     * Takes `O(1)` time.
     */
    edge(v, w, name) {
      var e = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v, w, name);
      return this._edgeLabels[e];
    }
    /**
     * Detects whether the graph contains specified edge or not.
     *
     * @overload
     * @param {EdgeObj} v - Edge object.
     * @returns {boolean} `true` if the graph has an edge between `v` and `w`
     * with the optional `name`.
     * @remarks
     * `v` and `w` can be interchanged for undirected graphs.
     * No subgraphs are considered.
     * Takes `O(1)` time.
     */
    /**
     * Detects whether the graph contains specified edge or not.
     *
     * @overload
     * @param {NodeID | number} v - Source node ID.
     * @param {NodeID | number} w - Target node ID.
     * @param {string | number} [name] - Edge name. Only useful with multigraphs.
     * @returns {boolean} `true` if the graph has an edge between `v` and `w`
     * with the optional `name`.
     * @remarks
     * `v` and `w` can be interchanged for undirected graphs.
     * No subgraphs are considered.
     * Takes `O(1)` time.
     */
    hasEdge(v, w, name) {
      var e = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v, w, name);
      return Object.prototype.hasOwnProperty.call(this._edgeLabels, e);
    }
    /**
     * Removes the edge (`v`, `w`) if the graph has an edge between `v` and `w`
     * with the optional `name`. If not this function does nothing.
     *
     * @overload
     * @param {EdgeObj} v - Edge object.
     * @returns {this}
     * @remarks
     * `v` and `w` can be interchanged for undirected graphs.
     * No subgraphs are considered.
     * Takes `O(1)` time.
     */
    /**
     * Removes the edge (`v`, `w`) if the graph has an edge between `v` and `w`
     * with the optional `name`. If not this function does nothing.
     *
     * @overload
     * @param {NodeID | number} v - Source node ID.
     * @param {NodeID | number} w - Target node ID.
     * @param {string | number} [name] - Edge name. Only useful with multigraphs.
     * @returns {this}
     * @remarks
     * `v` and `w` can be interchanged for undirected graphs.
     * Takes `O(1)` time.
     */
    removeEdge(v, w, name) {
      var e = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v, w, name);
      var edge = this._edgeObjs[e];
      if (edge) {
        v = edge.v;
        w = edge.w;
        delete this._edgeLabels[e];
        delete this._edgeObjs[e];
        decrementOrRemoveEntry(this._preds[w], v);
        decrementOrRemoveEntry(this._sucs[v], w);
        delete this._in[w][e];
        delete this._out[v][e];
        this._edgeCount--;
      }
      return this;
    }
    /**
     * @param {NodeID | number} v - Target node ID.
     * @param {NodeID | number} [u] - Optionally filters edges down to just those
     * coming from node `u`.
     * @returns {EdgeObj[] | undefined} all edges that point to the node `v`.
     * Returns `undefined` if node `v` is not in the graph.
     * @remarks
     * Behavior is undefined for undirected graphs - use {@link nodeEdges} instead.
     * Takes `O(|E|)` time.
     */
    inEdges(v, u) {
      var inV = this._in[v];
      if (inV) {
        var edges = values_default(inV);
        if (!u) {
          return edges;
        }
        return filter_default3(edges, function(edge) {
          return edge.v === u;
        });
      }
    }
    /**
     * @param {NodeID | number} v - Target node ID.
     * @param {NodeID | number} [w] - Optionally filters edges down to just those
     * that point to `w`.
     * @returns {EdgeObj[] | undefined} all edges that point to the node `v`.
     * Returns `undefined` if node `v` is not in the graph.
     * @remarks
     * Behavior is undefined for undirected graphs - use {@link nodeEdges} instead.
     * Takes `O(|E|)` time.
     */
    outEdges(v, w) {
      var outV = this._out[v];
      if (outV) {
        var edges = values_default(outV);
        if (!w) {
          return edges;
        }
        return filter_default3(edges, function(edge) {
          return edge.w === w;
        });
      }
    }
    /**
     * @param {NodeID | number} v - Target Node ID.
     * @param {NodeID | number} [w] - If set, filters those edges down to just
     * those between nodes `v` and `w` regardless of direction
     * @returns {EdgeObj[] | undefined} all edges to or from node `v` regardless
     * of direction. Returns `undefined` if node `v` is not in the graph.
     * @remarks Takes `O(|E|)` time.
     */
    nodeEdges(v, w) {
      var inEdges = this.inEdges(v, w);
      if (inEdges) {
        return inEdges.concat(this.outEdges(v, w));
      }
    }
  };
  Graph.prototype._nodeCount = 0;
  Graph.prototype._edgeCount = 0;
  function incrementOrInitEntry(map2, k) {
    if (map2[k]) {
      map2[k]++;
    } else {
      map2[k] = 1;
    }
  }
  function decrementOrRemoveEntry(map2, k) {
    if (!--map2[k]) {
      delete map2[k];
    }
  }
  function edgeArgsToId(isDirected, v_, w_, name) {
    var v = "" + v_;
    var w = "" + w_;
    if (!isDirected && v > w) {
      var tmp = v;
      v = w;
      w = tmp;
    }
    return v + EDGE_KEY_DELIM + w + EDGE_KEY_DELIM + (isUndefined_default(name) ? DEFAULT_EDGE_NAME : name);
  }
  function edgeArgsToObj(isDirected, v_, w_, name) {
    var v = "" + v_;
    var w = "" + w_;
    if (!isDirected && v > w) {
      var tmp = v;
      v = w;
      w = tmp;
    }
    var edgeObj = { v, w };
    if (name) {
      edgeObj.name = name;
    }
    return edgeObj;
  }
  function edgeObjToId(isDirected, edgeObj) {
    return edgeArgsToId(isDirected, edgeObj.v, edgeObj.w, edgeObj.name);
  }

  // node_modules/dagre-d3-es/src/graphlib/index.js
  var version = "2.1.9-pre";

  // node_modules/dagre-d3-es/src/dagre/data/list.js
  var List = class {
    constructor() {
      var sentinel = {};
      sentinel._next = sentinel._prev = sentinel;
      this._sentinel = sentinel;
    }
    dequeue() {
      var sentinel = this._sentinel;
      var entry = sentinel._prev;
      if (entry !== sentinel) {
        unlink(entry);
        return entry;
      }
    }
    enqueue(entry) {
      var sentinel = this._sentinel;
      if (entry._prev && entry._next) {
        unlink(entry);
      }
      entry._next = sentinel._next;
      sentinel._next._prev = entry;
      sentinel._next = entry;
      entry._prev = sentinel;
    }
    toString() {
      var strs = [];
      var sentinel = this._sentinel;
      var curr = sentinel._prev;
      while (curr !== sentinel) {
        strs.push(JSON.stringify(curr, filterOutLinks));
        curr = curr._prev;
      }
      return "[" + strs.join(", ") + "]";
    }
  };
  function unlink(entry) {
    entry._prev._next = entry._next;
    entry._next._prev = entry._prev;
    delete entry._next;
    delete entry._prev;
  }
  function filterOutLinks(k, v) {
    if (k !== "_next" && k !== "_prev") {
      return v;
    }
  }

  // node_modules/dagre-d3-es/src/dagre/greedy-fas.js
  var DEFAULT_WEIGHT_FN = constant_default6(1);
  function greedyFAS(g2, weightFn) {
    if (g2.nodeCount() <= 1) {
      return [];
    }
    var state = buildState(g2, weightFn || DEFAULT_WEIGHT_FN);
    var results = doGreedyFAS(state.graph, state.buckets, state.zeroIdx);
    return flatten_default(
      map_default(results, function(e) {
        return g2.outEdges(e.v, e.w);
      })
    );
  }
  function doGreedyFAS(g2, buckets, zeroIdx) {
    var results = [];
    var sources = buckets[buckets.length - 1];
    var sinks = buckets[0];
    var entry;
    while (g2.nodeCount()) {
      while (entry = sinks.dequeue()) {
        removeNode(g2, buckets, zeroIdx, entry);
      }
      while (entry = sources.dequeue()) {
        removeNode(g2, buckets, zeroIdx, entry);
      }
      if (g2.nodeCount()) {
        for (var i = buckets.length - 2; i > 0; --i) {
          entry = buckets[i].dequeue();
          if (entry) {
            results = results.concat(removeNode(g2, buckets, zeroIdx, entry, true));
            break;
          }
        }
      }
    }
    return results;
  }
  function removeNode(g2, buckets, zeroIdx, entry, collectPredecessors) {
    var results = collectPredecessors ? [] : void 0;
    forEach_default(g2.inEdges(entry.v), function(edge) {
      var weight = g2.edge(edge);
      var uEntry = g2.node(edge.v);
      if (collectPredecessors) {
        results.push({ v: edge.v, w: edge.w });
      }
      uEntry.out -= weight;
      assignBucket(buckets, zeroIdx, uEntry);
    });
    forEach_default(g2.outEdges(entry.v), function(edge) {
      var weight = g2.edge(edge);
      var w = edge.w;
      var wEntry = g2.node(w);
      wEntry["in"] -= weight;
      assignBucket(buckets, zeroIdx, wEntry);
    });
    g2.removeNode(entry.v);
    return results;
  }
  function buildState(g2, weightFn) {
    var fasGraph = new Graph();
    var maxIn = 0;
    var maxOut = 0;
    forEach_default(g2.nodes(), function(v) {
      fasGraph.setNode(v, { v, in: 0, out: 0 });
    });
    forEach_default(g2.edges(), function(e) {
      var prevWeight = fasGraph.edge(e.v, e.w) || 0;
      var weight = weightFn(e);
      var edgeWeight = prevWeight + weight;
      fasGraph.setEdge(e.v, e.w, edgeWeight);
      maxOut = Math.max(maxOut, fasGraph.node(e.v).out += weight);
      maxIn = Math.max(maxIn, fasGraph.node(e.w)["in"] += weight);
    });
    var buckets = range_default(maxOut + maxIn + 3).map(function() {
      return new List();
    });
    var zeroIdx = maxIn + 1;
    forEach_default(fasGraph.nodes(), function(v) {
      assignBucket(buckets, zeroIdx, fasGraph.node(v));
    });
    return { graph: fasGraph, buckets, zeroIdx };
  }
  function assignBucket(buckets, zeroIdx, entry) {
    if (!entry.out) {
      buckets[0].enqueue(entry);
    } else if (!entry["in"]) {
      buckets[buckets.length - 1].enqueue(entry);
    } else {
      buckets[entry.out - entry["in"] + zeroIdx].enqueue(entry);
    }
  }

  // node_modules/dagre-d3-es/src/dagre/acyclic.js
  function run(g2) {
    var fas = g2.graph().acyclicer === "greedy" ? greedyFAS(g2, weightFn(g2)) : dfsFAS(g2);
    forEach_default(fas, function(e) {
      var label = g2.edge(e);
      g2.removeEdge(e);
      label.forwardName = e.name;
      label.reversed = true;
      g2.setEdge(e.w, e.v, label, uniqueId_default("rev"));
    });
    function weightFn(g3) {
      return function(e) {
        return g3.edge(e).weight;
      };
    }
  }
  function dfsFAS(g2) {
    var fas = [];
    var stack = {};
    var visited = {};
    function dfs3(v) {
      if (Object.prototype.hasOwnProperty.call(visited, v)) {
        return;
      }
      visited[v] = true;
      stack[v] = true;
      forEach_default(g2.outEdges(v), function(e) {
        if (Object.prototype.hasOwnProperty.call(stack, e.w)) {
          fas.push(e);
        } else {
          dfs3(e.w);
        }
      });
      delete stack[v];
    }
    forEach_default(g2.nodes(), dfs3);
    return fas;
  }
  function undo(g2) {
    forEach_default(g2.edges(), function(e) {
      var label = g2.edge(e);
      if (label.reversed) {
        g2.removeEdge(e);
        var forwardName = label.forwardName;
        delete label.reversed;
        delete label.forwardName;
        g2.setEdge(e.w, e.v, label, forwardName);
      }
    });
  }

  // node_modules/dagre-d3-es/src/dagre/util.js
  function addDummyNode(g2, type2, attrs, name) {
    var v;
    do {
      v = uniqueId_default(name);
    } while (g2.hasNode(v));
    attrs.dummy = type2;
    g2.setNode(v, attrs);
    return v;
  }
  function simplify(g2) {
    var simplified = new Graph().setGraph(g2.graph());
    forEach_default(g2.nodes(), function(v) {
      simplified.setNode(v, g2.node(v));
    });
    forEach_default(g2.edges(), function(e) {
      var simpleLabel = simplified.edge(e.v, e.w) || { weight: 0, minlen: 1 };
      var label = g2.edge(e);
      simplified.setEdge(e.v, e.w, {
        weight: simpleLabel.weight + label.weight,
        minlen: Math.max(simpleLabel.minlen, label.minlen)
      });
    });
    return simplified;
  }
  function asNonCompoundGraph(g2) {
    var simplified = new Graph({ multigraph: g2.isMultigraph() }).setGraph(g2.graph());
    forEach_default(g2.nodes(), function(v) {
      if (!g2.children(v).length) {
        simplified.setNode(v, g2.node(v));
      }
    });
    forEach_default(g2.edges(), function(e) {
      simplified.setEdge(e, g2.edge(e));
    });
    return simplified;
  }
  function intersectRect(rect2, point) {
    var x2 = rect2.x;
    var y2 = rect2.y;
    var dx = point.x - x2;
    var dy = point.y - y2;
    var w = rect2.width / 2;
    var h = rect2.height / 2;
    if (!dx && !dy) {
      throw new Error("Not possible to find intersection inside of the rectangle");
    }
    var sx, sy;
    if (Math.abs(dy) * w > Math.abs(dx) * h) {
      if (dy < 0) {
        h = -h;
      }
      sx = h * dx / dy;
      sy = h;
    } else {
      if (dx < 0) {
        w = -w;
      }
      sx = w;
      sy = w * dy / dx;
    }
    return { x: x2 + sx, y: y2 + sy };
  }
  function buildLayerMatrix(g2) {
    var layering = map_default(range_default(maxRank(g2) + 1), function() {
      return [];
    });
    forEach_default(g2.nodes(), function(v) {
      var node = g2.node(v);
      var rank2 = node.rank;
      if (!isUndefined_default(rank2)) {
        layering[rank2][node.order] = v;
      }
    });
    return layering;
  }
  function normalizeRanks(g2) {
    var min3 = min_default(
      map_default(g2.nodes(), function(v) {
        return g2.node(v).rank;
      })
    );
    forEach_default(g2.nodes(), function(v) {
      var node = g2.node(v);
      if (has_default(node, "rank")) {
        node.rank -= min3;
      }
    });
  }
  function removeEmptyRanks(g2) {
    var offset = min_default(
      map_default(g2.nodes(), function(v) {
        return g2.node(v).rank;
      })
    );
    var layers = [];
    forEach_default(g2.nodes(), function(v) {
      var rank2 = g2.node(v).rank - offset;
      if (!layers[rank2]) {
        layers[rank2] = [];
      }
      layers[rank2].push(v);
    });
    var delta = 0;
    var nodeRankFactor = g2.graph().nodeRankFactor;
    forEach_default(layers, function(vs, i) {
      if (isUndefined_default(vs) && i % nodeRankFactor !== 0) {
        --delta;
      } else if (delta) {
        forEach_default(vs, function(v) {
          g2.node(v).rank += delta;
        });
      }
    });
  }
  function addBorderNode(g2, prefix, rank2, order2) {
    var node = {
      width: 0,
      height: 0
    };
    if (arguments.length >= 4) {
      node.rank = rank2;
      node.order = order2;
    }
    return addDummyNode(g2, "border", node, prefix);
  }
  function maxRank(g2) {
    return max_default(
      map_default(g2.nodes(), function(v) {
        var rank2 = g2.node(v).rank;
        if (!isUndefined_default(rank2)) {
          return rank2;
        }
      })
    );
  }
  function partition(collection, fn) {
    var result = { lhs: [], rhs: [] };
    forEach_default(collection, function(value) {
      if (fn(value)) {
        result.lhs.push(value);
      } else {
        result.rhs.push(value);
      }
    });
    return result;
  }
  function time(name, fn) {
    var start2 = now_default();
    try {
      return fn();
    } finally {
      console.log(name + " time: " + (now_default() - start2) + "ms");
    }
  }
  function notime(name, fn) {
    return fn();
  }

  // node_modules/dagre-d3-es/src/dagre/add-border-segments.js
  function addBorderSegments(g2) {
    function dfs3(v) {
      var children2 = g2.children(v);
      var node = g2.node(v);
      if (children2.length) {
        forEach_default(children2, dfs3);
      }
      if (Object.prototype.hasOwnProperty.call(node, "minRank")) {
        node.borderLeft = [];
        node.borderRight = [];
        for (var rank2 = node.minRank, maxRank2 = node.maxRank + 1; rank2 < maxRank2; ++rank2) {
          addBorderNode2(g2, "borderLeft", "_bl", v, node, rank2);
          addBorderNode2(g2, "borderRight", "_br", v, node, rank2);
        }
      }
    }
    forEach_default(g2.children(), dfs3);
  }
  function addBorderNode2(g2, prop, prefix, sg, sgNode, rank2) {
    var label = { width: 0, height: 0, rank: rank2, borderType: prop };
    var prev = sgNode[prop][rank2 - 1];
    var curr = addDummyNode(g2, "border", label, prefix);
    sgNode[prop][rank2] = curr;
    g2.setParent(curr, sg);
    if (prev) {
      g2.setEdge(prev, curr, { weight: 1 });
    }
  }

  // node_modules/dagre-d3-es/src/dagre/coordinate-system.js
  function adjust(g2) {
    var rankDir = g2.graph().rankdir.toLowerCase();
    if (rankDir === "lr" || rankDir === "rl") {
      swapWidthHeight(g2);
    }
  }
  function undo2(g2) {
    var rankDir = g2.graph().rankdir.toLowerCase();
    if (rankDir === "bt" || rankDir === "rl") {
      reverseY(g2);
    }
    if (rankDir === "lr" || rankDir === "rl") {
      swapXY(g2);
      swapWidthHeight(g2);
    }
  }
  function swapWidthHeight(g2) {
    forEach_default(g2.nodes(), function(v) {
      swapWidthHeightOne(g2.node(v));
    });
    forEach_default(g2.edges(), function(e) {
      swapWidthHeightOne(g2.edge(e));
    });
  }
  function swapWidthHeightOne(attrs) {
    var w = attrs.width;
    attrs.width = attrs.height;
    attrs.height = w;
  }
  function reverseY(g2) {
    forEach_default(g2.nodes(), function(v) {
      reverseYOne(g2.node(v));
    });
    forEach_default(g2.edges(), function(e) {
      var edge = g2.edge(e);
      forEach_default(edge.points, reverseYOne);
      if (Object.prototype.hasOwnProperty.call(edge, "y")) {
        reverseYOne(edge);
      }
    });
  }
  function reverseYOne(attrs) {
    attrs.y = -attrs.y;
  }
  function swapXY(g2) {
    forEach_default(g2.nodes(), function(v) {
      swapXYOne(g2.node(v));
    });
    forEach_default(g2.edges(), function(e) {
      var edge = g2.edge(e);
      forEach_default(edge.points, swapXYOne);
      if (Object.prototype.hasOwnProperty.call(edge, "x")) {
        swapXYOne(edge);
      }
    });
  }
  function swapXYOne(attrs) {
    var x2 = attrs.x;
    attrs.x = attrs.y;
    attrs.y = x2;
  }

  // node_modules/dagre-d3-es/src/dagre/normalize.js
  function run2(g2) {
    g2.graph().dummyChains = [];
    forEach_default(g2.edges(), function(edge) {
      normalizeEdge(g2, edge);
    });
  }
  function normalizeEdge(g2, e) {
    var v = e.v;
    var vRank = g2.node(v).rank;
    var w = e.w;
    var wRank = g2.node(w).rank;
    var name = e.name;
    var edgeLabel = g2.edge(e);
    var labelRank = edgeLabel.labelRank;
    if (wRank === vRank + 1) return;
    g2.removeEdge(e);
    var attrs = void 0;
    var dummy, i;
    for (i = 0, ++vRank; vRank < wRank; ++i, ++vRank) {
      edgeLabel.points = [];
      attrs = {
        width: 0,
        height: 0,
        edgeLabel,
        edgeObj: e,
        rank: vRank
      };
      dummy = addDummyNode(g2, "edge", attrs, "_d");
      if (vRank === labelRank) {
        attrs.width = edgeLabel.width;
        attrs.height = edgeLabel.height;
        attrs.dummy = "edge-label";
        attrs.labelpos = edgeLabel.labelpos;
      }
      g2.setEdge(v, dummy, { weight: edgeLabel.weight }, name);
      if (i === 0) {
        g2.graph().dummyChains.push(dummy);
      }
      v = dummy;
    }
    g2.setEdge(v, w, { weight: edgeLabel.weight }, name);
  }
  function undo3(g2) {
    forEach_default(g2.graph().dummyChains, function(v) {
      var node = g2.node(v);
      var origLabel = node.edgeLabel;
      var w;
      g2.setEdge(node.edgeObj, origLabel);
      while (node.dummy) {
        w = g2.successors(v)[0];
        g2.removeNode(v);
        origLabel.points.push({ x: node.x, y: node.y });
        if (node.dummy === "edge-label") {
          origLabel.x = node.x;
          origLabel.y = node.y;
          origLabel.width = node.width;
          origLabel.height = node.height;
        }
        v = w;
        node = g2.node(v);
      }
    });
  }

  // node_modules/dagre-d3-es/src/dagre/rank/util.js
  function longestPath(g2) {
    var visited = {};
    function dfs3(v) {
      var label = g2.node(v);
      if (Object.prototype.hasOwnProperty.call(visited, v)) {
        return label.rank;
      }
      visited[v] = true;
      var rank2 = min_default(
        map_default(g2.outEdges(v), function(e) {
          return dfs3(e.w) - g2.edge(e).minlen;
        })
      );
      if (rank2 === Number.POSITIVE_INFINITY || // return value of _.map([]) for Lodash 3
      rank2 === void 0 || // return value of _.map([]) for Lodash 4
      rank2 === null) {
        rank2 = 0;
      }
      return label.rank = rank2;
    }
    forEach_default(g2.sources(), dfs3);
  }
  function slack(g2, e) {
    return g2.node(e.w).rank - g2.node(e.v).rank - g2.edge(e).minlen;
  }

  // node_modules/dagre-d3-es/src/dagre/rank/feasible-tree.js
  function feasibleTree(g2) {
    var t = new Graph({ directed: false });
    var start2 = g2.nodes()[0];
    var size2 = g2.nodeCount();
    t.setNode(start2, {});
    var edge, delta;
    while (tightTree(t, g2) < size2) {
      edge = findMinSlackEdge(t, g2);
      delta = t.hasNode(edge.v) ? slack(g2, edge) : -slack(g2, edge);
      shiftRanks(t, g2, delta);
    }
    return t;
  }
  function tightTree(t, g2) {
    function dfs3(v) {
      forEach_default(g2.nodeEdges(v), function(e) {
        var edgeV = e.v, w = v === edgeV ? e.w : edgeV;
        if (!t.hasNode(w) && !slack(g2, e)) {
          t.setNode(w, {});
          t.setEdge(v, w, {});
          dfs3(w);
        }
      });
    }
    forEach_default(t.nodes(), dfs3);
    return t.nodeCount();
  }
  function findMinSlackEdge(t, g2) {
    return minBy_default(g2.edges(), function(e) {
      if (t.hasNode(e.v) !== t.hasNode(e.w)) {
        return slack(g2, e);
      }
    });
  }
  function shiftRanks(t, g2, delta) {
    forEach_default(t.nodes(), function(v) {
      g2.node(v).rank += delta;
    });
  }

  // node_modules/dagre-d3-es/src/graphlib/alg/dijkstra.js
  var DEFAULT_WEIGHT_FUNC = constant_default6(1);

  // node_modules/dagre-d3-es/src/graphlib/alg/floyd-warshall.js
  var DEFAULT_WEIGHT_FUNC2 = constant_default6(1);

  // node_modules/dagre-d3-es/src/graphlib/alg/topsort.js
  topsort.CycleException = CycleException;
  function topsort(g2) {
    var visited = {};
    var stack = {};
    var results = [];
    function visit(node) {
      if (Object.prototype.hasOwnProperty.call(stack, node)) {
        throw new CycleException();
      }
      if (!Object.prototype.hasOwnProperty.call(visited, node)) {
        stack[node] = true;
        visited[node] = true;
        forEach_default(g2.predecessors(node), visit);
        delete stack[node];
        results.push(node);
      }
    }
    forEach_default(g2.sinks(), visit);
    if (size_default2(visited) !== g2.nodeCount()) {
      throw new CycleException();
    }
    return results;
  }
  function CycleException() {
  }
  CycleException.prototype = new Error();

  // node_modules/dagre-d3-es/src/graphlib/alg/dfs.js
  function dfs(g2, vs, order2) {
    if (!isArray_default(vs)) {
      vs = [vs];
    }
    var navigation = (g2.isDirected() ? g2.successors : g2.neighbors).bind(g2);
    var acc = [];
    var visited = {};
    forEach_default(vs, function(v) {
      if (!g2.hasNode(v)) {
        throw new Error("Graph does not have node: " + v);
      }
      doDfs(g2, v, order2 === "post", visited, navigation, acc);
    });
    return acc;
  }
  function doDfs(g2, v, postorder3, visited, navigation, acc) {
    if (!Object.prototype.hasOwnProperty.call(visited, v)) {
      visited[v] = true;
      if (!postorder3) {
        acc.push(v);
      }
      forEach_default(navigation(v), function(w) {
        doDfs(g2, w, postorder3, visited, navigation, acc);
      });
      if (postorder3) {
        acc.push(v);
      }
    }
  }

  // node_modules/dagre-d3-es/src/graphlib/alg/postorder.js
  function postorder(g2, vs) {
    return dfs(g2, vs, "post");
  }

  // node_modules/dagre-d3-es/src/graphlib/alg/preorder.js
  function preorder(g2, vs) {
    return dfs(g2, vs, "pre");
  }

  // node_modules/dagre-d3-es/src/dagre/rank/network-simplex.js
  networkSimplex.initLowLimValues = initLowLimValues;
  networkSimplex.initCutValues = initCutValues;
  networkSimplex.calcCutValue = calcCutValue;
  networkSimplex.leaveEdge = leaveEdge;
  networkSimplex.enterEdge = enterEdge;
  networkSimplex.exchangeEdges = exchangeEdges;
  function networkSimplex(g2) {
    g2 = simplify(g2);
    longestPath(g2);
    var t = feasibleTree(g2);
    initLowLimValues(t);
    initCutValues(t, g2);
    var e, f;
    while (e = leaveEdge(t)) {
      f = enterEdge(t, g2, e);
      exchangeEdges(t, g2, e, f);
    }
  }
  function initCutValues(t, g2) {
    var vs = postorder(t, t.nodes());
    vs = vs.slice(0, vs.length - 1);
    forEach_default(vs, function(v) {
      assignCutValue(t, g2, v);
    });
  }
  function assignCutValue(t, g2, child) {
    var childLab = t.node(child);
    var parent = childLab.parent;
    t.edge(child, parent).cutvalue = calcCutValue(t, g2, child);
  }
  function calcCutValue(t, g2, child) {
    var childLab = t.node(child);
    var parent = childLab.parent;
    var childIsTail = true;
    var graphEdge = g2.edge(child, parent);
    var cutValue = 0;
    if (!graphEdge) {
      childIsTail = false;
      graphEdge = g2.edge(parent, child);
    }
    cutValue = graphEdge.weight;
    forEach_default(g2.nodeEdges(child), function(e) {
      var isOutEdge = e.v === child, other = isOutEdge ? e.w : e.v;
      if (other !== parent) {
        var pointsToHead = isOutEdge === childIsTail, otherWeight = g2.edge(e).weight;
        cutValue += pointsToHead ? otherWeight : -otherWeight;
        if (isTreeEdge(t, child, other)) {
          var otherCutValue = t.edge(child, other).cutvalue;
          cutValue += pointsToHead ? -otherCutValue : otherCutValue;
        }
      }
    });
    return cutValue;
  }
  function initLowLimValues(tree, root3) {
    if (arguments.length < 2) {
      root3 = tree.nodes()[0];
    }
    dfsAssignLowLim(tree, {}, 1, root3);
  }
  function dfsAssignLowLim(tree, visited, nextLim, v, parent) {
    var low = nextLim;
    var label = tree.node(v);
    visited[v] = true;
    forEach_default(tree.neighbors(v), function(w) {
      if (!Object.prototype.hasOwnProperty.call(visited, w)) {
        nextLim = dfsAssignLowLim(tree, visited, nextLim, w, v);
      }
    });
    label.low = low;
    label.lim = nextLim++;
    if (parent) {
      label.parent = parent;
    } else {
      delete label.parent;
    }
    return nextLim;
  }
  function leaveEdge(tree) {
    return find_default(tree.edges(), function(e) {
      return tree.edge(e).cutvalue < 0;
    });
  }
  function enterEdge(t, g2, edge) {
    var v = edge.v;
    var w = edge.w;
    if (!g2.hasEdge(v, w)) {
      v = edge.w;
      w = edge.v;
    }
    var vLabel = t.node(v);
    var wLabel = t.node(w);
    var tailLabel = vLabel;
    var flip = false;
    if (vLabel.lim > wLabel.lim) {
      tailLabel = wLabel;
      flip = true;
    }
    var candidates = filter_default3(g2.edges(), function(edge2) {
      return flip === isDescendant(t, t.node(edge2.v), tailLabel) && flip !== isDescendant(t, t.node(edge2.w), tailLabel);
    });
    return minBy_default(candidates, function(edge2) {
      return slack(g2, edge2);
    });
  }
  function exchangeEdges(t, g2, e, f) {
    var v = e.v;
    var w = e.w;
    t.removeEdge(v, w);
    t.setEdge(f.v, f.w, {});
    initLowLimValues(t);
    initCutValues(t, g2);
    updateRanks(t, g2);
  }
  function updateRanks(t, g2) {
    var root3 = find_default(t.nodes(), function(v) {
      return !g2.node(v).parent;
    });
    var vs = preorder(t, root3);
    vs = vs.slice(1);
    forEach_default(vs, function(v) {
      var parent = t.node(v).parent, edge = g2.edge(v, parent), flipped = false;
      if (!edge) {
        edge = g2.edge(parent, v);
        flipped = true;
      }
      g2.node(v).rank = g2.node(parent).rank + (flipped ? edge.minlen : -edge.minlen);
    });
  }
  function isTreeEdge(tree, u, v) {
    return tree.hasEdge(u, v);
  }
  function isDescendant(tree, vLabel, rootLabel) {
    return rootLabel.low <= vLabel.lim && vLabel.lim <= rootLabel.lim;
  }

  // node_modules/dagre-d3-es/src/dagre/rank/index.js
  function rank(g2) {
    switch (g2.graph().ranker) {
      case "network-simplex":
        networkSimplexRanker(g2);
        break;
      case "tight-tree":
        tightTreeRanker(g2);
        break;
      case "longest-path":
        longestPathRanker(g2);
        break;
      default:
        networkSimplexRanker(g2);
    }
  }
  var longestPathRanker = longestPath;
  function tightTreeRanker(g2) {
    longestPath(g2);
    feasibleTree(g2);
  }
  function networkSimplexRanker(g2) {
    networkSimplex(g2);
  }

  // node_modules/dagre-d3-es/src/dagre/nesting-graph.js
  function run3(g2) {
    var root3 = addDummyNode(g2, "root", {}, "_root");
    var depths = treeDepths(g2);
    var height = max_default(values_default(depths)) - 1;
    var nodeSep = 2 * height + 1;
    g2.graph().nestingRoot = root3;
    forEach_default(g2.edges(), function(e) {
      g2.edge(e).minlen *= nodeSep;
    });
    var weight = sumWeights(g2) + 1;
    forEach_default(g2.children(), function(child) {
      dfs2(g2, root3, nodeSep, weight, height, depths, child);
    });
    g2.graph().nodeRankFactor = nodeSep;
  }
  function dfs2(g2, root3, nodeSep, weight, height, depths, v) {
    var children2 = g2.children(v);
    if (!children2.length) {
      if (v !== root3) {
        g2.setEdge(root3, v, { weight: 0, minlen: nodeSep });
      }
      return;
    }
    var top = addBorderNode(g2, "_bt");
    var bottom = addBorderNode(g2, "_bb");
    var label = g2.node(v);
    g2.setParent(top, v);
    label.borderTop = top;
    g2.setParent(bottom, v);
    label.borderBottom = bottom;
    forEach_default(children2, function(child) {
      dfs2(g2, root3, nodeSep, weight, height, depths, child);
      var childNode = g2.node(child);
      var childTop = childNode.borderTop ? childNode.borderTop : child;
      var childBottom = childNode.borderBottom ? childNode.borderBottom : child;
      var thisWeight = childNode.borderTop ? weight : 2 * weight;
      var minlen = childTop !== childBottom ? 1 : height - depths[v] + 1;
      g2.setEdge(top, childTop, {
        weight: thisWeight,
        minlen,
        nestingEdge: true
      });
      g2.setEdge(childBottom, bottom, {
        weight: thisWeight,
        minlen,
        nestingEdge: true
      });
    });
    if (!g2.parent(v)) {
      g2.setEdge(root3, top, { weight: 0, minlen: height + depths[v] });
    }
  }
  function treeDepths(g2) {
    var depths = {};
    function dfs3(v, depth) {
      var children2 = g2.children(v);
      if (children2 && children2.length) {
        forEach_default(children2, function(child) {
          dfs3(child, depth + 1);
        });
      }
      depths[v] = depth;
    }
    forEach_default(g2.children(), function(v) {
      dfs3(v, 1);
    });
    return depths;
  }
  function sumWeights(g2) {
    return reduce_default(
      g2.edges(),
      function(acc, e) {
        return acc + g2.edge(e).weight;
      },
      0
    );
  }
  function cleanup(g2) {
    var graphLabel = g2.graph();
    g2.removeNode(graphLabel.nestingRoot);
    delete graphLabel.nestingRoot;
    forEach_default(g2.edges(), function(e) {
      var edge = g2.edge(e);
      if (edge.nestingEdge) {
        g2.removeEdge(e);
      }
    });
  }

  // node_modules/dagre-d3-es/src/dagre/order/add-subgraph-constraints.js
  function addSubgraphConstraints(g2, cg, vs) {
    var prev = {}, rootPrev;
    forEach_default(vs, function(v) {
      var child = g2.parent(v), parent, prevChild;
      while (child) {
        parent = g2.parent(child);
        if (parent) {
          prevChild = prev[parent];
          prev[parent] = child;
        } else {
          prevChild = rootPrev;
          rootPrev = child;
        }
        if (prevChild && prevChild !== child) {
          cg.setEdge(prevChild, child);
          return;
        }
        child = parent;
      }
    });
  }

  // node_modules/dagre-d3-es/src/dagre/order/build-layer-graph.js
  function buildLayerGraph(g2, rank2, relationship) {
    var root3 = createRootNode(g2), result = new Graph({ compound: true }).setGraph({ root: root3 }).setDefaultNodeLabel(function(v) {
      return g2.node(v);
    });
    forEach_default(g2.nodes(), function(v) {
      var node = g2.node(v), parent = g2.parent(v);
      if (node.rank === rank2 || node.minRank <= rank2 && rank2 <= node.maxRank) {
        result.setNode(v);
        result.setParent(v, parent || root3);
        forEach_default(g2[relationship](v), function(e) {
          var u = e.v === v ? e.w : e.v, edge = result.edge(u, v), weight = !isUndefined_default(edge) ? edge.weight : 0;
          result.setEdge(u, v, { weight: g2.edge(e).weight + weight });
        });
        if (Object.prototype.hasOwnProperty.call(node, "minRank")) {
          result.setNode(v, {
            borderLeft: node.borderLeft[rank2],
            borderRight: node.borderRight[rank2]
          });
        }
      }
    });
    return result;
  }
  function createRootNode(g2) {
    var v;
    while (g2.hasNode(v = uniqueId_default("_root"))) ;
    return v;
  }

  // node_modules/dagre-d3-es/src/dagre/order/cross-count.js
  function crossCount(g2, layering) {
    var cc = 0;
    for (var i = 1; i < layering.length; ++i) {
      cc += twoLayerCrossCount(g2, layering[i - 1], layering[i]);
    }
    return cc;
  }
  function twoLayerCrossCount(g2, northLayer, southLayer) {
    var southPos = zipObject_default(
      southLayer,
      map_default(southLayer, function(v, i) {
        return i;
      })
    );
    var southEntries = flatten_default(
      map_default(northLayer, function(v) {
        return sortBy_default(
          map_default(g2.outEdges(v), function(e) {
            return { pos: southPos[e.w], weight: g2.edge(e).weight };
          }),
          "pos"
        );
      })
    );
    var firstIndex = 1;
    while (firstIndex < southLayer.length) firstIndex <<= 1;
    var treeSize = 2 * firstIndex - 1;
    firstIndex -= 1;
    var tree = map_default(new Array(treeSize), function() {
      return 0;
    });
    var cc = 0;
    forEach_default(
      // @ts-expect-error
      southEntries.forEach(function(entry) {
        var index = entry.pos + firstIndex;
        tree[index] += entry.weight;
        var weightSum = 0;
        while (index > 0) {
          if (index % 2) {
            weightSum += tree[index + 1];
          }
          index = index - 1 >> 1;
          tree[index] += entry.weight;
        }
        cc += entry.weight * weightSum;
      })
    );
    return cc;
  }

  // node_modules/dagre-d3-es/src/dagre/order/init-order.js
  function initOrder(g2) {
    var visited = {};
    var simpleNodes = filter_default3(g2.nodes(), function(v) {
      return !g2.children(v).length;
    });
    var maxRank2 = max_default(
      map_default(simpleNodes, function(v) {
        return g2.node(v).rank;
      })
    );
    var layers = map_default(range_default(maxRank2 + 1), function() {
      return [];
    });
    function dfs3(v) {
      if (has_default(visited, v)) return;
      visited[v] = true;
      var node = g2.node(v);
      layers[node.rank].push(v);
      forEach_default(g2.successors(v), dfs3);
    }
    var orderedVs = sortBy_default(simpleNodes, function(v) {
      return g2.node(v).rank;
    });
    forEach_default(orderedVs, dfs3);
    return layers;
  }

  // node_modules/dagre-d3-es/src/dagre/order/barycenter.js
  function barycenter(g2, movable) {
    return map_default(movable, function(v) {
      var inV = g2.inEdges(v);
      if (!inV.length) {
        return { v };
      } else {
        var result = reduce_default(
          inV,
          function(acc, e) {
            var edge = g2.edge(e), nodeU = g2.node(e.v);
            return {
              sum: acc.sum + edge.weight * nodeU.order,
              weight: acc.weight + edge.weight
            };
          },
          { sum: 0, weight: 0 }
        );
        return {
          v,
          barycenter: result.sum / result.weight,
          weight: result.weight
        };
      }
    });
  }

  // node_modules/dagre-d3-es/src/dagre/order/resolve-conflicts.js
  function resolveConflicts(entries, cg) {
    var mappedEntries = {};
    forEach_default(entries, function(entry, i) {
      var tmp = mappedEntries[entry.v] = {
        indegree: 0,
        in: [],
        out: [],
        vs: [entry.v],
        i
      };
      if (!isUndefined_default(entry.barycenter)) {
        tmp.barycenter = entry.barycenter;
        tmp.weight = entry.weight;
      }
    });
    forEach_default(cg.edges(), function(e) {
      var entryV = mappedEntries[e.v];
      var entryW = mappedEntries[e.w];
      if (!isUndefined_default(entryV) && !isUndefined_default(entryW)) {
        entryW.indegree++;
        entryV.out.push(mappedEntries[e.w]);
      }
    });
    var sourceSet = filter_default3(mappedEntries, function(entry) {
      return !entry.indegree;
    });
    return doResolveConflicts(sourceSet);
  }
  function doResolveConflicts(sourceSet) {
    var entries = [];
    function handleIn(vEntry) {
      return function(uEntry) {
        if (uEntry.merged) {
          return;
        }
        if (isUndefined_default(uEntry.barycenter) || isUndefined_default(vEntry.barycenter) || uEntry.barycenter >= vEntry.barycenter) {
          mergeEntries(vEntry, uEntry);
        }
      };
    }
    function handleOut(vEntry) {
      return function(wEntry) {
        wEntry["in"].push(vEntry);
        if (--wEntry.indegree === 0) {
          sourceSet.push(wEntry);
        }
      };
    }
    while (sourceSet.length) {
      var entry = sourceSet.pop();
      entries.push(entry);
      forEach_default(entry["in"].reverse(), handleIn(entry));
      forEach_default(entry.out, handleOut(entry));
    }
    return map_default(
      filter_default3(entries, function(entry2) {
        return !entry2.merged;
      }),
      function(entry2) {
        return pick_default(entry2, ["vs", "i", "barycenter", "weight"]);
      }
    );
  }
  function mergeEntries(target, source) {
    var sum = 0;
    var weight = 0;
    if (target.weight) {
      sum += target.barycenter * target.weight;
      weight += target.weight;
    }
    if (source.weight) {
      sum += source.barycenter * source.weight;
      weight += source.weight;
    }
    target.vs = source.vs.concat(target.vs);
    target.barycenter = sum / weight;
    target.weight = weight;
    target.i = Math.min(source.i, target.i);
    source.merged = true;
  }

  // node_modules/dagre-d3-es/src/dagre/order/sort.js
  function sort(entries, biasRight) {
    var parts = partition(entries, function(entry) {
      return Object.prototype.hasOwnProperty.call(entry, "barycenter");
    });
    var sortable = parts.lhs, unsortable = sortBy_default(parts.rhs, function(entry) {
      return -entry.i;
    }), vs = [], sum = 0, weight = 0, vsIndex = 0;
    sortable.sort(compareWithBias(!!biasRight));
    vsIndex = consumeUnsortable(vs, unsortable, vsIndex);
    forEach_default(sortable, function(entry) {
      vsIndex += entry.vs.length;
      vs.push(entry.vs);
      sum += entry.barycenter * entry.weight;
      weight += entry.weight;
      vsIndex = consumeUnsortable(vs, unsortable, vsIndex);
    });
    var result = { vs: flatten_default(vs) };
    if (weight) {
      result.barycenter = sum / weight;
      result.weight = weight;
    }
    return result;
  }
  function consumeUnsortable(vs, unsortable, index) {
    var last2;
    while (unsortable.length && (last2 = last_default(unsortable)).i <= index) {
      unsortable.pop();
      vs.push(last2.vs);
      index++;
    }
    return index;
  }
  function compareWithBias(bias) {
    return function(entryV, entryW) {
      if (entryV.barycenter < entryW.barycenter) {
        return -1;
      } else if (entryV.barycenter > entryW.barycenter) {
        return 1;
      }
      return !bias ? entryV.i - entryW.i : entryW.i - entryV.i;
    };
  }

  // node_modules/dagre-d3-es/src/dagre/order/sort-subgraph.js
  function sortSubgraph(g2, v, cg, biasRight) {
    var movable = g2.children(v);
    var node = g2.node(v);
    var bl = node ? node.borderLeft : void 0;
    var br = node ? node.borderRight : void 0;
    var subgraphs = {};
    if (bl) {
      movable = filter_default3(movable, function(w) {
        return w !== bl && w !== br;
      });
    }
    var barycenters = barycenter(g2, movable);
    forEach_default(barycenters, function(entry) {
      if (g2.children(entry.v).length) {
        var subgraphResult = sortSubgraph(g2, entry.v, cg, biasRight);
        subgraphs[entry.v] = subgraphResult;
        if (Object.prototype.hasOwnProperty.call(subgraphResult, "barycenter")) {
          mergeBarycenters(entry, subgraphResult);
        }
      }
    });
    var entries = resolveConflicts(barycenters, cg);
    expandSubgraphs(entries, subgraphs);
    var result = sort(entries, biasRight);
    if (bl) {
      result.vs = flatten_default([bl, result.vs, br]);
      if (g2.predecessors(bl).length) {
        var blPred = g2.node(g2.predecessors(bl)[0]), brPred = g2.node(g2.predecessors(br)[0]);
        if (!Object.prototype.hasOwnProperty.call(result, "barycenter")) {
          result.barycenter = 0;
          result.weight = 0;
        }
        result.barycenter = (result.barycenter * result.weight + blPred.order + brPred.order) / (result.weight + 2);
        result.weight += 2;
      }
    }
    return result;
  }
  function expandSubgraphs(entries, subgraphs) {
    forEach_default(entries, function(entry) {
      entry.vs = flatten_default(
        entry.vs.map(function(v) {
          if (subgraphs[v]) {
            return subgraphs[v].vs;
          }
          return v;
        })
      );
    });
  }
  function mergeBarycenters(target, other) {
    if (!isUndefined_default(target.barycenter)) {
      target.barycenter = (target.barycenter * target.weight + other.barycenter * other.weight) / (target.weight + other.weight);
      target.weight += other.weight;
    } else {
      target.barycenter = other.barycenter;
      target.weight = other.weight;
    }
  }

  // node_modules/dagre-d3-es/src/dagre/order/index.js
  function order(g2) {
    var maxRank2 = maxRank(g2), downLayerGraphs = buildLayerGraphs(g2, range_default(1, maxRank2 + 1), "inEdges"), upLayerGraphs = buildLayerGraphs(g2, range_default(maxRank2 - 1, -1, -1), "outEdges");
    var layering = initOrder(g2);
    assignOrder(g2, layering);
    var bestCC = Number.POSITIVE_INFINITY, best;
    for (var i = 0, lastBest = 0; lastBest < 4; ++i, ++lastBest) {
      sweepLayerGraphs(i % 2 ? downLayerGraphs : upLayerGraphs, i % 4 >= 2);
      layering = buildLayerMatrix(g2);
      var cc = crossCount(g2, layering);
      if (cc < bestCC) {
        lastBest = 0;
        best = cloneDeep_default(layering);
        bestCC = cc;
      }
    }
    assignOrder(g2, best);
  }
  function buildLayerGraphs(g2, ranks, relationship) {
    return map_default(ranks, function(rank2) {
      return buildLayerGraph(g2, rank2, relationship);
    });
  }
  function sweepLayerGraphs(layerGraphs, biasRight) {
    var cg = new Graph();
    forEach_default(layerGraphs, function(lg) {
      var root3 = lg.graph().root;
      var sorted = sortSubgraph(lg, root3, cg, biasRight);
      forEach_default(sorted.vs, function(v, i) {
        lg.node(v).order = i;
      });
      addSubgraphConstraints(lg, cg, sorted.vs);
    });
  }
  function assignOrder(g2, layering) {
    forEach_default(layering, function(layer) {
      forEach_default(layer, function(v, i) {
        g2.node(v).order = i;
      });
    });
  }

  // node_modules/dagre-d3-es/src/dagre/parent-dummy-chains.js
  function parentDummyChains(g2) {
    var postorderNums = postorder2(g2);
    forEach_default(g2.graph().dummyChains, function(v) {
      var node = g2.node(v);
      var edgeObj = node.edgeObj;
      var pathData = findPath(g2, postorderNums, edgeObj.v, edgeObj.w);
      var path2 = pathData.path;
      var lca = pathData.lca;
      var pathIdx = 0;
      var pathV = path2[pathIdx];
      var ascending2 = true;
      while (v !== edgeObj.w) {
        node = g2.node(v);
        if (ascending2) {
          while ((pathV = path2[pathIdx]) !== lca && g2.node(pathV).maxRank < node.rank) {
            pathIdx++;
          }
          if (pathV === lca) {
            ascending2 = false;
          }
        }
        if (!ascending2) {
          while (pathIdx < path2.length - 1 && g2.node(pathV = path2[pathIdx + 1]).minRank <= node.rank) {
            pathIdx++;
          }
          pathV = path2[pathIdx];
        }
        g2.setParent(v, pathV);
        v = g2.successors(v)[0];
      }
    });
  }
  function findPath(g2, postorderNums, v, w) {
    var vPath = [];
    var wPath = [];
    var low = Math.min(postorderNums[v].low, postorderNums[w].low);
    var lim = Math.max(postorderNums[v].lim, postorderNums[w].lim);
    var parent;
    var lca;
    parent = v;
    do {
      parent = g2.parent(parent);
      vPath.push(parent);
    } while (parent && (postorderNums[parent].low > low || lim > postorderNums[parent].lim));
    lca = parent;
    parent = w;
    while ((parent = g2.parent(parent)) !== lca) {
      wPath.push(parent);
    }
    return { path: vPath.concat(wPath.reverse()), lca };
  }
  function postorder2(g2) {
    var result = {};
    var lim = 0;
    function dfs3(v) {
      var low = lim;
      forEach_default(g2.children(v), dfs3);
      result[v] = { low, lim: lim++ };
    }
    forEach_default(g2.children(), dfs3);
    return result;
  }

  // node_modules/dagre-d3-es/src/dagre/position/bk.js
  function findType1Conflicts(g2, layering) {
    var conflicts = {};
    function visitLayer(prevLayer, layer) {
      var k0 = 0, scanPos = 0, prevLayerLength = prevLayer.length, lastNode = last_default(layer);
      forEach_default(layer, function(v, i) {
        var w = findOtherInnerSegmentNode(g2, v), k1 = w ? g2.node(w).order : prevLayerLength;
        if (w || v === lastNode) {
          forEach_default(layer.slice(scanPos, i + 1), function(scanNode) {
            forEach_default(g2.predecessors(scanNode), function(u) {
              var uLabel = g2.node(u), uPos = uLabel.order;
              if ((uPos < k0 || k1 < uPos) && !(uLabel.dummy && g2.node(scanNode).dummy)) {
                addConflict(conflicts, u, scanNode);
              }
            });
          });
          scanPos = i + 1;
          k0 = k1;
        }
      });
      return layer;
    }
    reduce_default(layering, visitLayer);
    return conflicts;
  }
  function findType2Conflicts(g2, layering) {
    var conflicts = {};
    function scan(south, southPos, southEnd, prevNorthBorder, nextNorthBorder) {
      var v;
      forEach_default(range_default(southPos, southEnd), function(i) {
        v = south[i];
        if (g2.node(v).dummy) {
          forEach_default(g2.predecessors(v), function(u) {
            var uNode = g2.node(u);
            if (uNode.dummy && (uNode.order < prevNorthBorder || uNode.order > nextNorthBorder)) {
              addConflict(conflicts, u, v);
            }
          });
        }
      });
    }
    function visitLayer(north, south) {
      var prevNorthPos = -1, nextNorthPos, southPos = 0;
      forEach_default(south, function(v, southLookahead) {
        if (g2.node(v).dummy === "border") {
          var predecessors = g2.predecessors(v);
          if (predecessors.length) {
            nextNorthPos = g2.node(predecessors[0]).order;
            scan(south, southPos, southLookahead, prevNorthPos, nextNorthPos);
            southPos = southLookahead;
            prevNorthPos = nextNorthPos;
          }
        }
        scan(south, southPos, south.length, nextNorthPos, north.length);
      });
      return south;
    }
    reduce_default(layering, visitLayer);
    return conflicts;
  }
  function findOtherInnerSegmentNode(g2, v) {
    if (g2.node(v).dummy) {
      return find_default(g2.predecessors(v), function(u) {
        return g2.node(u).dummy;
      });
    }
  }
  function addConflict(conflicts, v, w) {
    if (v > w) {
      var tmp = v;
      v = w;
      w = tmp;
    }
    if (!Object.prototype.hasOwnProperty.call(conflicts, v)) {
      Object.defineProperty(conflicts, v, {
        enumerable: true,
        configurable: true,
        value: {},
        writable: true
      });
    }
    var conflictsV = conflicts[v];
    Object.defineProperty(conflictsV, w, {
      enumerable: true,
      configurable: true,
      value: true,
      writable: true
    });
  }
  function hasConflict(conflicts, v, w) {
    if (v > w) {
      var tmp = v;
      v = w;
      w = tmp;
    }
    return !!conflicts[v] && Object.prototype.hasOwnProperty.call(conflicts[v], w);
  }
  function verticalAlignment(g2, layering, conflicts, neighborFn) {
    var root3 = {}, align2 = {}, pos = {};
    forEach_default(layering, function(layer) {
      forEach_default(layer, function(v, order2) {
        root3[v] = v;
        align2[v] = v;
        pos[v] = order2;
      });
    });
    forEach_default(layering, function(layer) {
      var prevIdx = -1;
      forEach_default(layer, function(v) {
        var ws = neighborFn(v);
        if (ws.length) {
          ws = sortBy_default(ws, function(w2) {
            return pos[w2];
          });
          var mp = (ws.length - 1) / 2;
          for (var i = Math.floor(mp), il = Math.ceil(mp); i <= il; ++i) {
            var w = ws[i];
            if (align2[v] === v && prevIdx < pos[w] && !hasConflict(conflicts, v, w)) {
              align2[w] = v;
              align2[v] = root3[v] = root3[w];
              prevIdx = pos[w];
            }
          }
        }
      });
    });
    return { root: root3, align: align2 };
  }
  function horizontalCompaction(g2, layering, root3, align2, reverseSep) {
    var xs = {}, blockG = buildBlockGraph(g2, layering, root3, reverseSep), borderType = reverseSep ? "borderLeft" : "borderRight";
    function iterate(setXsFunc, nextNodesFunc) {
      var stack = blockG.nodes();
      var elem = stack.pop();
      var visited = {};
      while (elem) {
        if (visited[elem]) {
          setXsFunc(elem);
        } else {
          visited[elem] = true;
          stack.push(elem);
          stack = stack.concat(nextNodesFunc(elem));
        }
        elem = stack.pop();
      }
    }
    function pass1(elem) {
      xs[elem] = blockG.inEdges(elem).reduce(function(acc, e) {
        return Math.max(acc, xs[e.v] + blockG.edge(e));
      }, 0);
    }
    function pass2(elem) {
      var min3 = blockG.outEdges(elem).reduce(function(acc, e) {
        return Math.min(acc, xs[e.w] - blockG.edge(e));
      }, Number.POSITIVE_INFINITY);
      var node = g2.node(elem);
      if (min3 !== Number.POSITIVE_INFINITY && node.borderType !== borderType) {
        xs[elem] = Math.max(xs[elem], min3);
      }
    }
    iterate(pass1, blockG.predecessors.bind(blockG));
    iterate(pass2, blockG.successors.bind(blockG));
    forEach_default(align2, function(v) {
      xs[v] = xs[root3[v]];
    });
    return xs;
  }
  function buildBlockGraph(g2, layering, root3, reverseSep) {
    var blockGraph = new Graph(), graphLabel = g2.graph(), sepFn = sep(graphLabel.nodesep, graphLabel.edgesep, reverseSep);
    forEach_default(layering, function(layer) {
      var u;
      forEach_default(layer, function(v) {
        var vRoot = root3[v];
        blockGraph.setNode(vRoot);
        if (u) {
          var uRoot = root3[u], prevMax = blockGraph.edge(uRoot, vRoot);
          blockGraph.setEdge(uRoot, vRoot, Math.max(sepFn(g2, v, u), prevMax || 0));
        }
        u = v;
      });
    });
    return blockGraph;
  }
  function findSmallestWidthAlignment(g2, xss) {
    return minBy_default(values_default(xss), function(xs) {
      var max3 = Number.NEGATIVE_INFINITY;
      var min3 = Number.POSITIVE_INFINITY;
      forIn_default(xs, function(x2, v) {
        var halfWidth = width(g2, v) / 2;
        max3 = Math.max(x2 + halfWidth, max3);
        min3 = Math.min(x2 - halfWidth, min3);
      });
      return max3 - min3;
    });
  }
  function alignCoordinates(xss, alignTo) {
    var alignToVals = values_default(alignTo), alignToMin = min_default(alignToVals), alignToMax = max_default(alignToVals);
    forEach_default(["u", "d"], function(vert) {
      forEach_default(["l", "r"], function(horiz) {
        var alignment = vert + horiz, xs = xss[alignment], delta;
        if (xs === alignTo) return;
        var xsVals = values_default(xs);
        delta = horiz === "l" ? alignToMin - min_default(xsVals) : alignToMax - max_default(xsVals);
        if (delta) {
          xss[alignment] = mapValues_default(xs, function(x2) {
            return x2 + delta;
          });
        }
      });
    });
  }
  function balance(xss, align2) {
    return mapValues_default(xss.ul, function(ignore, v) {
      if (align2) {
        return xss[align2.toLowerCase()][v];
      } else {
        var xs = sortBy_default(map_default(xss, v));
        return (xs[1] + xs[2]) / 2;
      }
    });
  }
  function positionX(g2) {
    var layering = buildLayerMatrix(g2);
    var conflicts = merge_default3(findType1Conflicts(g2, layering), findType2Conflicts(g2, layering));
    var xss = {};
    var adjustedLayering;
    forEach_default(["u", "d"], function(vert) {
      adjustedLayering = vert === "u" ? layering : values_default(layering).reverse();
      forEach_default(["l", "r"], function(horiz) {
        if (horiz === "r") {
          adjustedLayering = map_default(adjustedLayering, function(inner) {
            return values_default(inner).reverse();
          });
        }
        var neighborFn = (vert === "u" ? g2.predecessors : g2.successors).bind(g2);
        var align2 = verticalAlignment(g2, adjustedLayering, conflicts, neighborFn);
        var xs = horizontalCompaction(g2, adjustedLayering, align2.root, align2.align, horiz === "r");
        if (horiz === "r") {
          xs = mapValues_default(xs, function(x2) {
            return -x2;
          });
        }
        xss[vert + horiz] = xs;
      });
    });
    var smallestWidth = findSmallestWidthAlignment(g2, xss);
    alignCoordinates(xss, smallestWidth);
    return balance(xss, g2.graph().align);
  }
  function sep(nodeSep, edgeSep, reverseSep) {
    return function(g2, v, w) {
      var vLabel = g2.node(v);
      var wLabel = g2.node(w);
      var sum = 0;
      var delta;
      sum += vLabel.width / 2;
      if (Object.prototype.hasOwnProperty.call(vLabel, "labelpos")) {
        switch (vLabel.labelpos.toLowerCase()) {
          case "l":
            delta = -vLabel.width / 2;
            break;
          case "r":
            delta = vLabel.width / 2;
            break;
        }
      }
      if (delta) {
        sum += reverseSep ? delta : -delta;
      }
      delta = 0;
      sum += (vLabel.dummy ? edgeSep : nodeSep) / 2;
      sum += (wLabel.dummy ? edgeSep : nodeSep) / 2;
      sum += wLabel.width / 2;
      if (Object.prototype.hasOwnProperty.call(wLabel, "labelpos")) {
        switch (wLabel.labelpos.toLowerCase()) {
          case "l":
            delta = wLabel.width / 2;
            break;
          case "r":
            delta = -wLabel.width / 2;
            break;
        }
      }
      if (delta) {
        sum += reverseSep ? delta : -delta;
      }
      delta = 0;
      return sum;
    };
  }
  function width(g2, v) {
    return g2.node(v).width;
  }

  // node_modules/dagre-d3-es/src/dagre/position/index.js
  function position(g2) {
    g2 = asNonCompoundGraph(g2);
    positionY(g2);
    forOwn_default(positionX(g2), function(x2, v) {
      g2.node(v).x = x2;
    });
  }
  function positionY(g2) {
    var layering = buildLayerMatrix(g2);
    var rankSep = g2.graph().ranksep;
    var prevY = 0;
    forEach_default(layering, function(layer) {
      var maxHeight = max_default(
        map_default(layer, function(v) {
          return g2.node(v).height;
        })
      );
      forEach_default(layer, function(v) {
        g2.node(v).y = prevY + maxHeight / 2;
      });
      prevY += maxHeight + rankSep;
    });
  }

  // node_modules/dagre-d3-es/src/dagre/layout.js
  function layout(g2, opts) {
    var time2 = opts && opts.debugTiming ? time : notime;
    time2("layout", () => {
      var layoutGraph = time2("  buildLayoutGraph", () => buildLayoutGraph(g2));
      time2("  runLayout", () => runLayout(layoutGraph, time2));
      time2("  updateInputGraph", () => updateInputGraph(g2, layoutGraph));
    });
  }
  function runLayout(g2, time2) {
    time2("    makeSpaceForEdgeLabels", () => makeSpaceForEdgeLabels(g2));
    time2("    removeSelfEdges", () => removeSelfEdges(g2));
    time2("    acyclic", () => run(g2));
    time2("    nestingGraph.run", () => run3(g2));
    time2("    rank", () => rank(asNonCompoundGraph(g2)));
    time2("    injectEdgeLabelProxies", () => injectEdgeLabelProxies(g2));
    time2("    removeEmptyRanks", () => removeEmptyRanks(g2));
    time2("    nestingGraph.cleanup", () => cleanup(g2));
    time2("    normalizeRanks", () => normalizeRanks(g2));
    time2("    assignRankMinMax", () => assignRankMinMax(g2));
    time2("    removeEdgeLabelProxies", () => removeEdgeLabelProxies(g2));
    time2("    normalize.run", () => run2(g2));
    time2("    parentDummyChains", () => parentDummyChains(g2));
    time2("    addBorderSegments", () => addBorderSegments(g2));
    time2("    order", () => order(g2));
    time2("    insertSelfEdges", () => insertSelfEdges(g2));
    time2("    adjustCoordinateSystem", () => adjust(g2));
    time2("    position", () => position(g2));
    time2("    positionSelfEdges", () => positionSelfEdges(g2));
    time2("    removeBorderNodes", () => removeBorderNodes(g2));
    time2("    normalize.undo", () => undo3(g2));
    time2("    fixupEdgeLabelCoords", () => fixupEdgeLabelCoords(g2));
    time2("    undoCoordinateSystem", () => undo2(g2));
    time2("    translateGraph", () => translateGraph(g2));
    time2("    assignNodeIntersects", () => assignNodeIntersects(g2));
    time2("    reversePoints", () => reversePointsForReversedEdges(g2));
    time2("    acyclic.undo", () => undo(g2));
  }
  function updateInputGraph(inputGraph, layoutGraph) {
    forEach_default(inputGraph.nodes(), function(v) {
      var inputLabel = inputGraph.node(v);
      var layoutLabel = layoutGraph.node(v);
      if (inputLabel) {
        inputLabel.x = layoutLabel.x;
        inputLabel.y = layoutLabel.y;
        if (layoutGraph.children(v).length) {
          inputLabel.width = layoutLabel.width;
          inputLabel.height = layoutLabel.height;
        }
      }
    });
    forEach_default(inputGraph.edges(), function(e) {
      var inputLabel = inputGraph.edge(e);
      var layoutLabel = layoutGraph.edge(e);
      inputLabel.points = layoutLabel.points;
      if (Object.prototype.hasOwnProperty.call(layoutLabel, "x")) {
        inputLabel.x = layoutLabel.x;
        inputLabel.y = layoutLabel.y;
      }
    });
    inputGraph.graph().width = layoutGraph.graph().width;
    inputGraph.graph().height = layoutGraph.graph().height;
  }
  var graphNumAttrs = ["nodesep", "edgesep", "ranksep", "marginx", "marginy"];
  var graphDefaults = { ranksep: 50, edgesep: 20, nodesep: 50, rankdir: "tb" };
  var graphAttrs = ["acyclicer", "ranker", "rankdir", "align"];
  var nodeNumAttrs = ["width", "height"];
  var nodeDefaults = { width: 0, height: 0 };
  var edgeNumAttrs = ["minlen", "weight", "width", "height", "labeloffset"];
  var edgeDefaults = {
    minlen: 1,
    weight: 1,
    width: 0,
    height: 0,
    labeloffset: 10,
    labelpos: "r"
  };
  var edgeAttrs = ["labelpos"];
  function buildLayoutGraph(inputGraph) {
    var g2 = new Graph({ multigraph: true, compound: true });
    var graph = canonicalize(inputGraph.graph());
    g2.setGraph(
      merge_default3({}, graphDefaults, selectNumberAttrs(graph, graphNumAttrs), pick_default(graph, graphAttrs))
    );
    forEach_default(inputGraph.nodes(), function(v) {
      var node = canonicalize(inputGraph.node(v));
      g2.setNode(v, defaults_default(selectNumberAttrs(node, nodeNumAttrs), nodeDefaults));
      g2.setParent(v, inputGraph.parent(v));
    });
    forEach_default(inputGraph.edges(), function(e) {
      var edge = canonicalize(inputGraph.edge(e));
      g2.setEdge(
        e,
        merge_default3({}, edgeDefaults, selectNumberAttrs(edge, edgeNumAttrs), pick_default(edge, edgeAttrs))
      );
    });
    return g2;
  }
  function makeSpaceForEdgeLabels(g2) {
    var graph = g2.graph();
    graph.ranksep /= 2;
    forEach_default(g2.edges(), function(e) {
      var edge = g2.edge(e);
      edge.minlen *= 2;
      if (edge.labelpos.toLowerCase() !== "c") {
        if (graph.rankdir === "TB" || graph.rankdir === "BT") {
          edge.width += edge.labeloffset;
        } else {
          edge.height += edge.labeloffset;
        }
      }
    });
  }
  function injectEdgeLabelProxies(g2) {
    forEach_default(g2.edges(), function(e) {
      var edge = g2.edge(e);
      if (edge.width && edge.height) {
        var v = g2.node(e.v);
        var w = g2.node(e.w);
        var label = { rank: (w.rank - v.rank) / 2 + v.rank, e };
        addDummyNode(g2, "edge-proxy", label, "_ep");
      }
    });
  }
  function assignRankMinMax(g2) {
    var maxRank2 = 0;
    forEach_default(g2.nodes(), function(v) {
      var node = g2.node(v);
      if (node.borderTop) {
        node.minRank = g2.node(node.borderTop).rank;
        node.maxRank = g2.node(node.borderBottom).rank;
        maxRank2 = max_default(maxRank2, node.maxRank);
      }
    });
    g2.graph().maxRank = maxRank2;
  }
  function removeEdgeLabelProxies(g2) {
    forEach_default(g2.nodes(), function(v) {
      var node = g2.node(v);
      if (node.dummy === "edge-proxy") {
        g2.edge(node.e).labelRank = node.rank;
        g2.removeNode(v);
      }
    });
  }
  function translateGraph(g2) {
    var minX = Number.POSITIVE_INFINITY;
    var maxX = 0;
    var minY = Number.POSITIVE_INFINITY;
    var maxY = 0;
    var graphLabel = g2.graph();
    var marginX = graphLabel.marginx || 0;
    var marginY = graphLabel.marginy || 0;
    function getExtremes(attrs) {
      var x2 = attrs.x;
      var y2 = attrs.y;
      var w = attrs.width;
      var h = attrs.height;
      minX = Math.min(minX, x2 - w / 2);
      maxX = Math.max(maxX, x2 + w / 2);
      minY = Math.min(minY, y2 - h / 2);
      maxY = Math.max(maxY, y2 + h / 2);
    }
    forEach_default(g2.nodes(), function(v) {
      getExtremes(g2.node(v));
    });
    forEach_default(g2.edges(), function(e) {
      var edge = g2.edge(e);
      if (Object.prototype.hasOwnProperty.call(edge, "x")) {
        getExtremes(edge);
      }
    });
    minX -= marginX;
    minY -= marginY;
    forEach_default(g2.nodes(), function(v) {
      var node = g2.node(v);
      node.x -= minX;
      node.y -= minY;
    });
    forEach_default(g2.edges(), function(e) {
      var edge = g2.edge(e);
      forEach_default(edge.points, function(p) {
        p.x -= minX;
        p.y -= minY;
      });
      if (Object.prototype.hasOwnProperty.call(edge, "x")) {
        edge.x -= minX;
      }
      if (Object.prototype.hasOwnProperty.call(edge, "y")) {
        edge.y -= minY;
      }
    });
    graphLabel.width = maxX - minX + marginX;
    graphLabel.height = maxY - minY + marginY;
  }
  function assignNodeIntersects(g2) {
    forEach_default(g2.edges(), function(e) {
      var edge = g2.edge(e);
      var nodeV = g2.node(e.v);
      var nodeW = g2.node(e.w);
      var p1, p2;
      if (!edge.points) {
        edge.points = [];
        p1 = nodeW;
        p2 = nodeV;
      } else {
        p1 = edge.points[0];
        p2 = edge.points[edge.points.length - 1];
      }
      edge.points.unshift(intersectRect(nodeV, p1));
      edge.points.push(intersectRect(nodeW, p2));
    });
  }
  function fixupEdgeLabelCoords(g2) {
    forEach_default(g2.edges(), function(e) {
      var edge = g2.edge(e);
      if (Object.prototype.hasOwnProperty.call(edge, "x")) {
        if (edge.labelpos === "l" || edge.labelpos === "r") {
          edge.width -= edge.labeloffset;
        }
        switch (edge.labelpos) {
          case "l":
            edge.x -= edge.width / 2 + edge.labeloffset;
            break;
          case "r":
            edge.x += edge.width / 2 + edge.labeloffset;
            break;
        }
      }
    });
  }
  function reversePointsForReversedEdges(g2) {
    forEach_default(g2.edges(), function(e) {
      var edge = g2.edge(e);
      if (edge.reversed) {
        edge.points.reverse();
      }
    });
  }
  function removeBorderNodes(g2) {
    forEach_default(g2.nodes(), function(v) {
      if (g2.children(v).length) {
        var node = g2.node(v);
        var t = g2.node(node.borderTop);
        var b = g2.node(node.borderBottom);
        var l = g2.node(last_default(node.borderLeft));
        var r = g2.node(last_default(node.borderRight));
        node.width = Math.abs(r.x - l.x);
        node.height = Math.abs(b.y - t.y);
        node.x = l.x + node.width / 2;
        node.y = t.y + node.height / 2;
      }
    });
    forEach_default(g2.nodes(), function(v) {
      if (g2.node(v).dummy === "border") {
        g2.removeNode(v);
      }
    });
  }
  function removeSelfEdges(g2) {
    forEach_default(g2.edges(), function(e) {
      if (e.v === e.w) {
        var node = g2.node(e.v);
        if (!node.selfEdges) {
          node.selfEdges = [];
        }
        node.selfEdges.push({ e, label: g2.edge(e) });
        g2.removeEdge(e);
      }
    });
  }
  function insertSelfEdges(g2) {
    var layers = buildLayerMatrix(g2);
    forEach_default(layers, function(layer) {
      var orderShift = 0;
      forEach_default(layer, function(v, i) {
        var node = g2.node(v);
        node.order = i + orderShift;
        forEach_default(node.selfEdges, function(selfEdge) {
          addDummyNode(
            g2,
            "selfedge",
            {
              width: selfEdge.label.width,
              height: selfEdge.label.height,
              rank: node.rank,
              order: i + ++orderShift,
              e: selfEdge.e,
              label: selfEdge.label
            },
            "_se"
          );
        });
        delete node.selfEdges;
      });
    });
  }
  function positionSelfEdges(g2) {
    forEach_default(g2.nodes(), function(v) {
      var node = g2.node(v);
      if (node.dummy === "selfedge") {
        var selfNode = g2.node(node.e.v);
        var x2 = selfNode.x + selfNode.width / 2;
        var y2 = selfNode.y;
        var dx = node.x - x2;
        var dy = selfNode.height / 2;
        g2.setEdge(node.e, node.label);
        g2.removeNode(v);
        node.label.points = [
          { x: x2 + 2 * dx / 3, y: y2 - dy },
          { x: x2 + 5 * dx / 6, y: y2 - dy },
          { x: x2 + dx, y: y2 },
          { x: x2 + 5 * dx / 6, y: y2 + dy },
          { x: x2 + 2 * dx / 3, y: y2 + dy }
        ];
        node.label.x = node.x;
        node.label.y = node.y;
      }
    });
  }
  function selectNumberAttrs(obj, attrs) {
    return mapValues_default(pick_default(obj, attrs), Number);
  }
  function canonicalize(attrs) {
    var newAttrs = {};
    forEach_default(attrs, function(v, k) {
      newAttrs[k.toLowerCase()] = v;
    });
    return newAttrs;
  }

  // node_modules/dagre-d3-es/src/dagre-js/util.js
  function isSubgraph(g2, v) {
    return !!g2.children(v).length;
  }
  function edgeToId(e) {
    return escapeId(e.v) + ":" + escapeId(e.w) + ":" + escapeId(e.name);
  }
  var ID_DELIM = /:/g;
  function escapeId(str) {
    return str ? String(str).replace(ID_DELIM, "\\:") : "";
  }
  function applyStyle(dom, styleFn) {
    if (styleFn) {
      dom.attr("style", styleFn);
    }
  }
  function applyClass(dom, classFn, otherClasses) {
    if (classFn) {
      dom.attr("class", classFn).attr("class", otherClasses + " " + dom.attr("class"));
    }
  }
  function applyTransition(selection2, g2) {
    var graph = g2.graph();
    if (isPlainObject_default(graph)) {
      var transition2 = graph.transition;
      if (isFunction_default(transition2)) {
        return transition2(selection2);
      }
    }
    return selection2;
  }

  // node_modules/dagre-d3-es/src/dagre-js/arrows.js
  var arrows = {
    normal,
    vee,
    undirected
  };
  function setArrows(value) {
    arrows = value;
  }
  function normal(parent, id2, edge, type2) {
    var marker = parent.append("marker").attr("id", id2).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerUnits", "strokeWidth").attr("markerWidth", 8).attr("markerHeight", 6).attr("orient", "auto");
    var path2 = marker.append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").style("stroke-width", 1).style("stroke-dasharray", "1,0");
    applyStyle(path2, edge[type2 + "Style"]);
    if (edge[type2 + "Class"]) {
      path2.attr("class", edge[type2 + "Class"]);
    }
  }
  function vee(parent, id2, edge, type2) {
    var marker = parent.append("marker").attr("id", id2).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerUnits", "strokeWidth").attr("markerWidth", 8).attr("markerHeight", 6).attr("orient", "auto");
    var path2 = marker.append("path").attr("d", "M 0 0 L 10 5 L 0 10 L 4 5 z").style("stroke-width", 1).style("stroke-dasharray", "1,0");
    applyStyle(path2, edge[type2 + "Style"]);
    if (edge[type2 + "Class"]) {
      path2.attr("class", edge[type2 + "Class"]);
    }
  }
  function undirected(parent, id2, edge, type2) {
    var marker = parent.append("marker").attr("id", id2).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerUnits", "strokeWidth").attr("markerWidth", 8).attr("markerHeight", 6).attr("orient", "auto");
    var path2 = marker.append("path").attr("d", "M 0 5 L 10 5").style("stroke-width", 1).style("stroke-dasharray", "1,0");
    applyStyle(path2, edge[type2 + "Style"]);
    if (edge[type2 + "Class"]) {
      path2.attr("class", edge[type2 + "Class"]);
    }
  }

  // node_modules/dagre-d3-es/src/dagre-js/label/add-html-label.js
  function addHtmlLabel(root3, node) {
    var fo = root3.append("foreignObject").attr("width", "100000");
    var div = fo.append("xhtml:div");
    div.attr("xmlns", "http://www.w3.org/1999/xhtml");
    var label = node.label;
    switch (typeof label) {
      case "function":
        div.insert(label);
        break;
      case "object":
        div.insert(function() {
          return label;
        });
        break;
      default:
        div.html(label);
    }
    applyStyle(div, node.labelStyle);
    div.style("display", "inline-block");
    div.style("white-space", "nowrap");
    var client = div.node();
    fo.attr("width", client.offsetWidth).attr("height", client.offsetHeight);
    return fo;
  }

  // node_modules/dagre-d3-es/src/dagre-js/label/add-svg-label.js
  function addSVGLabel(root3, node) {
    var domNode = root3;
    domNode.node().appendChild(node.label);
    applyStyle(domNode, node.labelStyle);
    return domNode;
  }

  // node_modules/dagre-d3-es/src/dagre-js/label/add-text-label.js
  function addTextLabel(root3, node) {
    var domNode = root3.append("text");
    var lines = processEscapeSequences(node.label).split("\n");
    for (var i = 0; i < lines.length; i++) {
      domNode.append("tspan").attr("xml:space", "preserve").attr("dy", "1em").attr("x", "1").text(lines[i]);
    }
    applyStyle(domNode, node.labelStyle);
    return domNode;
  }
  function processEscapeSequences(text) {
    var newText = "";
    var escaped = false;
    var ch;
    for (var i = 0; i < text.length; ++i) {
      ch = text[i];
      if (escaped) {
        switch (ch) {
          case "n":
            newText += "\n";
            break;
          default:
            newText += ch;
        }
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else {
        newText += ch;
      }
    }
    return newText;
  }

  // node_modules/dagre-d3-es/src/dagre-js/label/add-label.js
  function addLabel(root3, node, location2) {
    var label = node.label;
    var labelSvg = root3.append("g");
    if (node.labelType === "svg") {
      addSVGLabel(labelSvg, node);
    } else if (typeof label !== "string" || node.labelType === "html") {
      addHtmlLabel(labelSvg, node);
    } else {
      addTextLabel(labelSvg, node);
    }
    var labelBBox = labelSvg.node().getBBox();
    var y2;
    switch (location2) {
      case "top":
        y2 = -node.height / 2;
        break;
      case "bottom":
        y2 = node.height / 2 - labelBBox.height;
        break;
      default:
        y2 = -labelBBox.height / 2;
    }
    labelSvg.attr("transform", "translate(" + -labelBBox.width / 2 + "," + y2 + ")");
    return labelSvg;
  }

  // node_modules/dagre-d3-es/src/dagre-js/create-clusters.js
  var createClusters = function(selection2, g2) {
    var clusters = g2.nodes().filter(function(v) {
      return isSubgraph(g2, v);
    });
    var svgClusters = selection2.selectAll("g.cluster").data(clusters, function(v) {
      return v;
    });
    applyTransition(svgClusters.exit(), g2).style("opacity", 0).remove();
    var enterSelection = svgClusters.enter().append("g").attr("class", "cluster").attr("id", function(v) {
      var node = g2.node(v);
      return node.id;
    }).style("opacity", 0).each(function(v) {
      var node = g2.node(v);
      var thisGroup = select_default2(this);
      select_default2(this).append("rect");
      var labelGroup = thisGroup.append("g").attr("class", "label");
      addLabel(labelGroup, node, node.clusterLabelPos);
    });
    svgClusters = svgClusters.merge(enterSelection);
    svgClusters = applyTransition(svgClusters, g2).style("opacity", 1);
    svgClusters.selectAll("rect").each(function(c) {
      var node = g2.node(c);
      var domCluster = select_default2(this);
      applyStyle(domCluster, node.style);
    });
    return svgClusters;
  };
  function setCreateClusters(value) {
    createClusters = value;
  }

  // node_modules/dagre-d3-es/src/dagre-js/create-edge-labels.js
  var createEdgeLabels = function(selection2, g2) {
    var svgEdgeLabels = selection2.selectAll("g.edgeLabel").data(g2.edges(), function(e) {
      return edgeToId(e);
    }).classed("update", true);
    svgEdgeLabels.exit().remove();
    svgEdgeLabels.enter().append("g").classed("edgeLabel", true).style("opacity", 0);
    svgEdgeLabels = selection2.selectAll("g.edgeLabel");
    svgEdgeLabels.each(function(e) {
      var root3 = select_default2(this);
      root3.select(".label").remove();
      var edge = g2.edge(e);
      var label = addLabel(root3, g2.edge(e), 0).classed("label", true);
      var bbox = label.node().getBBox();
      if (edge.labelId) {
        label.attr("id", edge.labelId);
      }
      if (!Object.prototype.hasOwnProperty.call(edge, "width")) {
        edge.width = bbox.width;
      }
      if (!Object.prototype.hasOwnProperty.call(edge, "height")) {
        edge.height = bbox.height;
      }
    });
    var exitSelection;
    if (svgEdgeLabels.exit) {
      exitSelection = svgEdgeLabels.exit();
    } else {
      exitSelection = svgEdgeLabels.selectAll(null);
    }
    applyTransition(exitSelection, g2).style("opacity", 0).remove();
    return svgEdgeLabels;
  };
  function setCreateEdgeLabels(value) {
    createEdgeLabels = value;
  }

  // node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-node.js
  function intersectNode(node, point) {
    return node.intersect(point);
  }

  // node_modules/dagre-d3-es/src/dagre-js/create-edge-paths.js
  var createEdgePaths = function(selection2, g2, arrows2) {
    var previousPaths = selection2.selectAll("g.edgePath").data(g2.edges(), function(e) {
      return edgeToId(e);
    }).classed("update", true);
    var newPaths = enter(previousPaths, g2);
    exit(previousPaths, g2);
    var svgPaths = previousPaths.merge !== void 0 ? previousPaths.merge(newPaths) : previousPaths;
    applyTransition(svgPaths, g2).style("opacity", 1);
    svgPaths.each(function(e) {
      var domEdge = select_default2(this);
      var edge = g2.edge(e);
      edge.elem = this;
      if (edge.id) {
        domEdge.attr("id", edge.id);
      }
      applyClass(
        domEdge,
        edge["class"],
        (domEdge.classed("update") ? "update " : "") + "edgePath"
      );
    });
    svgPaths.selectAll("path.path").each(function(e) {
      var edge = g2.edge(e);
      edge.arrowheadId = uniqueId_default("arrowhead");
      var domEdge = select_default2(this).attr("marker-end", function() {
        return "url(" + makeFragmentRef(location.href, edge.arrowheadId) + ")";
      }).style("fill", "none");
      applyTransition(domEdge, g2).attr("d", function(e2) {
        return calcPoints(g2, e2);
      });
      applyStyle(domEdge, edge.style);
    });
    svgPaths.selectAll("defs *").remove();
    svgPaths.selectAll("defs").each(function(e) {
      var edge = g2.edge(e);
      var arrowhead = arrows2[edge.arrowhead];
      arrowhead(select_default2(this), edge.arrowheadId, edge, "arrowhead");
    });
    return svgPaths;
  };
  function setCreateEdgePaths(value) {
    createEdgePaths = value;
  }
  function makeFragmentRef(url, fragmentId) {
    var baseUrl = url.split("#")[0];
    return baseUrl + "#" + fragmentId;
  }
  function calcPoints(g2, e) {
    var edge = g2.edge(e);
    var tail = g2.node(e.v);
    var head = g2.node(e.w);
    var points = edge.points.slice(1, edge.points.length - 1);
    points.unshift(intersectNode(tail, points[0]));
    points.push(intersectNode(head, points[points.length - 1]));
    return createLine(edge, points);
  }
  function createLine(edge, points) {
    var line = (line_default || svg.line)().x(function(d) {
      return d.x;
    }).y(function(d) {
      return d.y;
    });
    (line.curve || line.interpolate)(edge.curve);
    return line(points);
  }
  function getCoords(elem) {
    var bbox = elem.getBBox();
    var matrix = elem.ownerSVGElement.getScreenCTM().inverse().multiply(elem.getScreenCTM()).translate(bbox.width / 2, bbox.height / 2);
    return { x: matrix.e, y: matrix.f };
  }
  function enter(svgPaths, g2) {
    var svgPathsEnter = svgPaths.enter().append("g").attr("class", "edgePath").style("opacity", 0);
    svgPathsEnter.append("path").attr("class", "path").attr("d", function(e) {
      var edge = g2.edge(e);
      var sourceElem = g2.node(e.v).elem;
      var points = range_default(edge.points.length).map(function() {
        return getCoords(sourceElem);
      });
      return createLine(edge, points);
    });
    svgPathsEnter.append("defs");
    return svgPathsEnter;
  }
  function exit(svgPaths, g2) {
    var svgPathExit = svgPaths.exit();
    applyTransition(svgPathExit, g2).style("opacity", 0).remove();
  }

  // node_modules/dagre-d3-es/src/dagre-js/create-nodes.js
  var createNodes = function(selection2, g2, shapes2) {
    var simpleNodes = g2.nodes().filter(function(v) {
      return !isSubgraph(g2, v);
    });
    var svgNodes = selection2.selectAll("g.node").data(simpleNodes, function(v) {
      return v;
    }).classed("update", true);
    svgNodes.exit().remove();
    svgNodes.enter().append("g").attr("class", "node").style("opacity", 0);
    svgNodes = selection2.selectAll("g.node");
    svgNodes.each(function(v) {
      var node = g2.node(v);
      var thisGroup = select_default2(this);
      applyClass(
        thisGroup,
        node["class"],
        (thisGroup.classed("update") ? "update " : "") + "node"
      );
      thisGroup.select("g.label").remove();
      var labelGroup = thisGroup.append("g").attr("class", "label");
      var labelDom = addLabel(labelGroup, node);
      var shape = shapes2[node.shape];
      var bbox = pick_default(labelDom.node().getBBox(), "width", "height");
      node.elem = this;
      if (node.id) {
        thisGroup.attr("id", node.id);
      }
      if (node.labelId) {
        labelGroup.attr("id", node.labelId);
      }
      if (Object.prototype.hasOwnProperty.call(node, "width")) {
        bbox.width = node.width;
      }
      if (Object.prototype.hasOwnProperty.call(node, "height")) {
        bbox.height = node.height;
      }
      bbox.width += node.paddingLeft + node.paddingRight;
      bbox.height += node.paddingTop + node.paddingBottom;
      labelGroup.attr(
        "transform",
        "translate(" + (node.paddingLeft - node.paddingRight) / 2 + "," + (node.paddingTop - node.paddingBottom) / 2 + ")"
      );
      var root3 = select_default2(this);
      root3.select(".label-container").remove();
      var shapeSvg = shape(root3, bbox, node).classed("label-container", true);
      applyStyle(shapeSvg, node.style);
      var shapeBBox = shapeSvg.node().getBBox();
      node.width = shapeBBox.width;
      node.height = shapeBBox.height;
    });
    var exitSelection;
    if (svgNodes.exit) {
      exitSelection = svgNodes.exit();
    } else {
      exitSelection = svgNodes.selectAll(null);
    }
    applyTransition(exitSelection, g2).style("opacity", 0).remove();
    return svgNodes;
  };
  function setCreateNodes(value) {
    createNodes = value;
  }

  // node_modules/dagre-d3-es/src/dagre-js/position-clusters.js
  function positionClusters(selection2, g2) {
    var created = selection2.filter(function() {
      return !select_default2(this).classed("update");
    });
    function translate(v) {
      var node = g2.node(v);
      return "translate(" + node.x + "," + node.y + ")";
    }
    created.attr("transform", translate);
    applyTransition(selection2, g2).style("opacity", 1).attr("transform", translate);
    applyTransition(created.selectAll("rect"), g2).attr("width", function(v) {
      return g2.node(v).width;
    }).attr("height", function(v) {
      return g2.node(v).height;
    }).attr("x", function(v) {
      var node = g2.node(v);
      return -node.width / 2;
    }).attr("y", function(v) {
      var node = g2.node(v);
      return -node.height / 2;
    });
  }

  // node_modules/dagre-d3-es/src/dagre-js/position-edge-labels.js
  function positionEdgeLabels(selection2, g2) {
    var created = selection2.filter(function() {
      return !select_default2(this).classed("update");
    });
    function translate(e) {
      var edge = g2.edge(e);
      return Object.prototype.hasOwnProperty.call(edge, "x") ? "translate(" + edge.x + "," + edge.y + ")" : "";
    }
    created.attr("transform", translate);
    applyTransition(selection2, g2).style("opacity", 1).attr("transform", translate);
  }

  // node_modules/dagre-d3-es/src/dagre-js/position-nodes.js
  function positionNodes(selection2, g2) {
    var created = selection2.filter(function() {
      return !select_default2(this).classed("update");
    });
    function translate(v) {
      var node = g2.node(v);
      return "translate(" + node.x + "," + node.y + ")";
    }
    created.attr("transform", translate);
    applyTransition(selection2, g2).style("opacity", 1).attr("transform", translate);
  }

  // node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-ellipse.js
  function intersectEllipse(node, rx, ry, point) {
    var cx = node.x;
    var cy = node.y;
    var px = cx - point.x;
    var py = cy - point.y;
    var det = Math.sqrt(rx * rx * py * py + ry * ry * px * px);
    var dx = Math.abs(rx * ry * px / det);
    if (point.x < cx) {
      dx = -dx;
    }
    var dy = Math.abs(rx * ry * py / det);
    if (point.y < cy) {
      dy = -dy;
    }
    return { x: cx + dx, y: cy + dy };
  }

  // node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-circle.js
  function intersectCircle(node, rx, point) {
    return intersectEllipse(node, rx, rx, point);
  }

  // node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-line.js
  function intersectLine(p1, p2, q1, q2) {
    var a1, a2, b1, b2, c1, c2;
    var r1, r2, r3, r4;
    var denom, offset, num;
    var x2, y2;
    a1 = p2.y - p1.y;
    b1 = p1.x - p2.x;
    c1 = p2.x * p1.y - p1.x * p2.y;
    r3 = a1 * q1.x + b1 * q1.y + c1;
    r4 = a1 * q2.x + b1 * q2.y + c1;
    if (r3 !== 0 && r4 !== 0 && sameSign(r3, r4)) {
      return;
    }
    a2 = q2.y - q1.y;
    b2 = q1.x - q2.x;
    c2 = q2.x * q1.y - q1.x * q2.y;
    r1 = a2 * p1.x + b2 * p1.y + c2;
    r2 = a2 * p2.x + b2 * p2.y + c2;
    if (r1 !== 0 && r2 !== 0 && sameSign(r1, r2)) {
      return;
    }
    denom = a1 * b2 - a2 * b1;
    if (denom === 0) {
      return;
    }
    offset = Math.abs(denom / 2);
    num = b1 * c2 - b2 * c1;
    x2 = num < 0 ? (num - offset) / denom : (num + offset) / denom;
    num = a2 * c1 - a1 * c2;
    y2 = num < 0 ? (num - offset) / denom : (num + offset) / denom;
    return { x: x2, y: y2 };
  }
  function sameSign(r1, r2) {
    return r1 * r2 > 0;
  }

  // node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-polygon.js
  function intersectPolygon(node, polyPoints, point) {
    var x1 = node.x;
    var y1 = node.y;
    var intersections = [];
    var minX = Number.POSITIVE_INFINITY;
    var minY = Number.POSITIVE_INFINITY;
    polyPoints.forEach(function(entry) {
      minX = Math.min(minX, entry.x);
      minY = Math.min(minY, entry.y);
    });
    var left = x1 - node.width / 2 - minX;
    var top = y1 - node.height / 2 - minY;
    for (var i = 0; i < polyPoints.length; i++) {
      var p1 = polyPoints[i];
      var p2 = polyPoints[i < polyPoints.length - 1 ? i + 1 : 0];
      var intersect = intersectLine(
        node,
        point,
        { x: left + p1.x, y: top + p1.y },
        { x: left + p2.x, y: top + p2.y }
      );
      if (intersect) {
        intersections.push(intersect);
      }
    }
    if (!intersections.length) {
      console.log("NO INTERSECTION FOUND, RETURN NODE CENTER", node);
      return node;
    }
    if (intersections.length > 1) {
      intersections.sort(function(p, q) {
        var pdx = p.x - point.x;
        var pdy = p.y - point.y;
        var distp = Math.sqrt(pdx * pdx + pdy * pdy);
        var qdx = q.x - point.x;
        var qdy = q.y - point.y;
        var distq = Math.sqrt(qdx * qdx + qdy * qdy);
        return distp < distq ? -1 : distp === distq ? 0 : 1;
      });
    }
    return intersections[0];
  }

  // node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-rect.js
  function intersectRect2(node, point) {
    var x2 = node.x;
    var y2 = node.y;
    var dx = point.x - x2;
    var dy = point.y - y2;
    var w = node.width / 2;
    var h = node.height / 2;
    var sx, sy;
    if (Math.abs(dy) * w > Math.abs(dx) * h) {
      if (dy < 0) {
        h = -h;
      }
      sx = dy === 0 ? 0 : h * dx / dy;
      sy = h;
    } else {
      if (dx < 0) {
        w = -w;
      }
      sx = w;
      sy = dx === 0 ? 0 : w * dy / dx;
    }
    return { x: x2 + sx, y: y2 + sy };
  }

  // node_modules/dagre-d3-es/src/dagre-js/shapes.js
  var shapes = {
    rect,
    ellipse,
    circle,
    diamond
  };
  function setShapes(value) {
    shapes = value;
  }
  function rect(parent, bbox, node) {
    var shapeSvg = parent.insert("rect", ":first-child").attr("rx", node.rx).attr("ry", node.ry).attr("x", -bbox.width / 2).attr("y", -bbox.height / 2).attr("width", bbox.width).attr("height", bbox.height);
    node.intersect = function(point) {
      return intersectRect2(node, point);
    };
    return shapeSvg;
  }
  function ellipse(parent, bbox, node) {
    var rx = bbox.width / 2;
    var ry = bbox.height / 2;
    var shapeSvg = parent.insert("ellipse", ":first-child").attr("x", -bbox.width / 2).attr("y", -bbox.height / 2).attr("rx", rx).attr("ry", ry);
    node.intersect = function(point) {
      return intersectEllipse(node, rx, ry, point);
    };
    return shapeSvg;
  }
  function circle(parent, bbox, node) {
    var r = Math.max(bbox.width, bbox.height) / 2;
    var shapeSvg = parent.insert("circle", ":first-child").attr("x", -bbox.width / 2).attr("y", -bbox.height / 2).attr("r", r);
    node.intersect = function(point) {
      return intersectCircle(node, r, point);
    };
    return shapeSvg;
  }
  function diamond(parent, bbox, node) {
    var w = bbox.width * Math.SQRT2 / 2;
    var h = bbox.height * Math.SQRT2 / 2;
    var points = [
      { x: 0, y: -h },
      { x: -w, y: 0 },
      { x: 0, y: h },
      { x: w, y: 0 }
    ];
    var shapeSvg = parent.insert("polygon", ":first-child").attr(
      "points",
      points.map(function(p) {
        return p.x + "," + p.y;
      }).join(" ")
    );
    node.intersect = function(p) {
      return intersectPolygon(node, points, p);
    };
    return shapeSvg;
  }

  // node_modules/dagre-d3-es/src/dagre-js/render.js
  function render() {
    var fn = function(svg2, g2) {
      preProcessGraph(g2);
      var outputGroup = createOrSelectGroup(svg2, "output");
      var clustersGroup = createOrSelectGroup(outputGroup, "clusters");
      var edgePathsGroup = createOrSelectGroup(outputGroup, "edgePaths");
      var edgeLabels = createEdgeLabels(createOrSelectGroup(outputGroup, "edgeLabels"), g2);
      var nodes = createNodes(createOrSelectGroup(outputGroup, "nodes"), g2, shapes);
      layout(g2);
      positionNodes(nodes, g2);
      positionEdgeLabels(edgeLabels, g2);
      createEdgePaths(edgePathsGroup, g2, arrows);
      var clusters = createClusters(clustersGroup, g2);
      positionClusters(clusters, g2);
      postProcessGraph(g2);
    };
    fn.createNodes = function(value) {
      if (!arguments.length) return createNodes;
      setCreateNodes(value);
      return fn;
    };
    fn.createClusters = function(value) {
      if (!arguments.length) return createClusters;
      setCreateClusters(value);
      return fn;
    };
    fn.createEdgeLabels = function(value) {
      if (!arguments.length) return createEdgeLabels;
      setCreateEdgeLabels(value);
      return fn;
    };
    fn.createEdgePaths = function(value) {
      if (!arguments.length) return createEdgePaths;
      setCreateEdgePaths(value);
      return fn;
    };
    fn.shapes = function(value) {
      if (!arguments.length) return shapes;
      setShapes(value);
      return fn;
    };
    fn.arrows = function(value) {
      if (!arguments.length) return arrows;
      setArrows(value);
      return fn;
    };
    return fn;
  }
  var NODE_DEFAULT_ATTRS = {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    rx: 0,
    ry: 0,
    shape: "rect"
  };
  var EDGE_DEFAULT_ATTRS = {
    arrowhead: "normal",
    curve: linear_default
  };
  function preProcessGraph(g2) {
    g2.nodes().forEach((v) => {
      const node = g2.node(v);
      if (!Object.prototype.hasOwnProperty.call(node, "label") && !g2.children(v).length) {
        node.label = v;
      }
      if (Object.prototype.hasOwnProperty.call(node, "paddingX")) {
        defaults_default(node, {
          paddingLeft: node.paddingX,
          paddingRight: node.paddingX
        });
      }
      if (Object.prototype.hasOwnProperty.call(node, "paddingY")) {
        defaults_default(node, {
          paddingTop: node.paddingY,
          paddingBottom: node.paddingY
        });
      }
      if (Object.prototype.hasOwnProperty.call(node, "padding")) {
        defaults_default(node, {
          paddingLeft: node.padding,
          paddingRight: node.padding,
          paddingTop: node.padding,
          paddingBottom: node.padding
        });
      }
      defaults_default(node, NODE_DEFAULT_ATTRS);
      ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom"].forEach((k) => {
        node[k] = Number(node[k]);
      });
      if (Object.prototype.hasOwnProperty.call(node, "width")) {
        node._prevWidth = node.width;
      }
      if (Object.prototype.hasOwnProperty.call(node, "height")) {
        node._prevHeight = node.height;
      }
    });
    g2.edges().forEach(function(e) {
      var edge = g2.edge(e);
      if (!Object.prototype.hasOwnProperty.call(edge, "label")) {
        edge.label = "";
      }
      defaults_default(edge, EDGE_DEFAULT_ATTRS);
    });
  }
  function postProcessGraph(g2) {
    g2.nodes().forEach((v) => {
      var node = g2.node(v);
      if (Object.prototype.hasOwnProperty.call(node, "_prevWidth")) {
        node.width = node._prevWidth;
      } else {
        delete node.width;
      }
      if (Object.prototype.hasOwnProperty.call(node, "_prevHeight")) {
        node.height = node._prevHeight;
      } else {
        delete node.height;
      }
      delete node._prevWidth;
      delete node._prevHeight;
    });
  }
  function createOrSelectGroup(root3, name) {
    var selection2 = root3.select("g." + name);
    if (selection2.empty()) {
      selection2 = root3.append("g").attr("class", name);
    }
    return selection2;
  }

  // src/ainb.ts
  var AINB = class _AINB {
    nodes;
    constructor() {
      this.nodes = [];
    }
    static async from_file(filename) {
      const res = await fetch(filename);
      let data = await res.json();
      let v = Object.assign(new _AINB(), data);
      v.nodes = v.Nodes = v.Nodes.map((x2) => Node.from(x2));
      v.blackboard = flatten_links(v.Blackboard || {}, "Blackboard");
      v.io = {};
      for (const node of v.nodes) {
        for (const input of node.inputs) {
          if (!input.Sources) {
            let key = input["Node Index"];
            if (!(key in v.io)) {
              v.io[key] = [];
            }
            v.io[key].push(Object.assign({}, input, { index: node.index }));
          } else {
            for (const src of input.Sources) {
              let key = src["Node Index"];
              if (!(key in v.io)) {
                v.io[key] = [];
              }
              v.io[key].push(Object.assign({}, src, { index: node.index }));
            }
          }
        }
      }
      return v;
    }
  };
  var Link = class _Link {
    "Name";
    "Node Index";
    "Condition Min";
    "Condition Max";
    "Is Default";
    "Is Output";
    type;
    vartype;
    index;
    name;
    constructor() {
      this.type = "";
      this.index = -1;
      this.name = null;
      this.vartype = "";
    }
    static from(type2, vartype, data) {
      let v = Object.assign(new _Link(), data);
      v.type = type2;
      v.index = v["Node Index"];
      v.name = v["Name"];
      v.vartype = vartype;
      return v;
    }
    get is_output() {
      return this.vartype == "Outputs" && this["Is Output"];
    }
    get label() {
      if (this["Condition Min"] != void 0 && this["Condition Max"] != void 0) {
        let a = this["Condition Min"];
        let b = this["Condition Max"];
        return `[${a} - ${b}]`;
      }
      if (this["Is Default"]) {
        return "Default";
      }
      return this.Name;
    }
  };
  function flatten_links(values2, kind) {
    let out = [];
    for (const type2 of Object.keys(values2)) {
      for (const item of values2[type2]) {
        out.push(Link.from(type2, kind, item));
      }
    }
    return out;
  }
  var Node = class _Node {
    "Node Index";
    "Node Type";
    "Name";
    parameters;
    name;
    type;
    index;
    constructor() {
      this.index = -1;
      this.type = "";
    }
    static from(data) {
      let v = Object.assign(new _Node(), data);
      v.plugs = v.Plugs;
      v.parameters = v.Parameters;
      v.index = v["Node Index"];
      v.name = v["Name"];
      v.type = v["Node Type"];
      v.properties = flatten_links(v.Properties, "Properties");
      v.plugs = flatten_links(v.Plugs, "Plugs");
      v.inputs = flatten_links(v.Parameters.Inputs, "Inputs");
      v.outputs = flatten_links(v.Parameters.Outputs, "Outputs");
      return v;
    }
    get label() {
      if (this.name) {
        return `${this.name} ${this.index}`;
      }
      return `${this.type} ${this.index}`;
    }
  };

  // src/color.ts
  function HSVtoRGB(h, s, v) {
    var r, g2, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0:
        r = v, g2 = t, b = p;
        break;
      case 1:
        r = q, g2 = v, b = p;
        break;
      case 2:
        r = p, g2 = v, b = t;
        break;
      case 3:
        r = p, g2 = q, b = v;
        break;
      case 4:
        r = t, g2 = p, b = v;
        break;
      case 5:
        r = v, g2 = p, b = q;
        break;
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g2 * 255),
      b: Math.round(b * 255)
    };
  }
  function rgb2hex(c) {
    return "#" + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, "0")).join("");
  }
  function hsv2hex(h, s, v) {
    let rgb2 = HSVtoRGB(h, s, v);
    return rgb2hex(rgb2);
  }

  // src/main.ts
  split_es_default(["#side", "#graph"], { sizes: [20, 80], minSize: 200 });
  split_es_default(["#nodelist0", "#ainbfiles"], { sizes: [50, 50], minSize: 50, direction: "vertical" });
  var STYLE = {
    edge: {
      default: {
        color: "white",
        width: "2px"
      },
      focus: {
        output: {
          color: "#f1f180",
          // yellow-ish
          width: "3px"
        },
        input: {
          color: "#80f1f1",
          // blue-ish
          width: "3px"
        }
      }
    },
    node: {
      default: {
        color: "none",
        width: "0px"
      },
      focus: {
        color: "#f7e7ad",
        width: "2px"
      }
    }
  };
  var g = null;
  var zoom = null;
  var _n = "n";
  var ainb_files = [];
  var _filename = "";
  var BB = 314159;
  function $(x2) {
    return document.querySelector(x2);
  }
  var title = $("#title");
  var node_search = $("#node_search");
  var ainb_search = $("#ainb_search");
  var style = $("#style");
  var styleshow = $("#styleshow");
  if (title && node_search && ainb_search) {
    title.addEventListener("click", (_ev) => {
      title.remove();
    });
    node_search.addEventListener("input", node_search_term);
    ainb_search.addEventListener("input", ainb_search_term);
  }
  if (style && styleshow) {
    styleshow.addEventListener("mouseover", (_ev) => {
      style.style.visibility = "visible";
    });
    styleshow.addEventListener("mouseleave", (_ev) => {
      style.style.visibility = "hidden";
    });
    style.addEventListener("mouseleave", (_ev) => {
      style.style.visibility = "hidden";
    });
    style.addEventListener("mouseover", (_ev) => {
      style.style.visibility = "visible";
    });
  }
  function node_search_term() {
    let term = node_search.value.trim().toLowerCase();
    const els = [...nodelist.children];
    if (term.length == 0) {
      els.forEach((el) => el.style.display = "");
      return;
    }
    for (const el of els) {
      let t = !el.textContent.toLowerCase().includes(term) ? "none" : "";
      el.style.display = t;
    }
  }
  function ainb_search_term() {
    let term = ainb_search.value.trim().toLowerCase();
    const els = [...ainblist.children];
    if (term.length == 0) {
      els.forEach((el) => el.style.display = "");
      return;
    }
    for (const el of els) {
      let t = !el.textContent.toLowerCase().includes(term) ? "none" : "";
      el.style.display = t;
    }
  }
  async function load(filename) {
    return AINB.from_file(`ainb_as_json_v2.0/${filename}`);
  }
  function to_list(input) {
    return input.split(/\s+/).filter((v) => v.length);
  }
  function $txt(t, className = void 0) {
    const el = document.createElement("div");
    el.textContent = t;
    if (className) {
      el.classList.add(...to_list(className));
    }
    return el;
  }
  function $span(t, className = void 0) {
    const el = document.createElement("span");
    el.textContent = t;
    if (className) {
      el.classList.add(...to_list(className));
    }
    return el;
  }
  function $li(els, className = void 0) {
    const el = document.createElement("li");
    if (className) {
      el.classList.add(...to_list(className));
    }
    if (!Array.isArray(els)) {
      els = [els];
    }
    el.append(...els);
    return el;
  }
  function $node(id2, className = void 0) {
    const el = document.createElement("span");
    el.textContent = `node: ${id2}`;
    if (className) {
      el.classList.add(...to_list(className));
    }
    el.addEventListener("click", (ev) => {
      scroll_to_node("n" + id2);
      ev.stopPropagation();
      ev.preventDefault();
    });
    return el;
  }
  function addSection(links, el, header, key, ainb, _node) {
    if (!links || !links.length) {
      return;
    }
    el.append($txt(header, "section"));
    let outputs = ainb.io[_node.index] || [];
    let k = 0;
    for (const item of links) {
      const ref = outputs.find((v) => v["Output Index"] == k);
      let strike = !item.is_output && key == "Outputs" && !ref ? "strike" : "";
      let parts = [$span(`${item.Name} : `, strike), $span(`${item.type}`, `typename ${strike}`)];
      if (item["Default Value"] !== void 0) {
        parts.push($span(` = ${item["Default Value"]} (default)`, "typevalue"));
      }
      if (key == "Outputs") {
        if (ref) {
          parts.push($span(" "));
          parts.push($node(ref.index, `nodelink ${strike}`));
          if (ref.name) {
            parts.push($span(" " + ref.name, `typevalue ${strike}`));
          }
        }
      }
      if (key == "Inputs") {
        if (item["Node Index"] >= 0) {
          parts.push($span(" "));
          parts.push($node(item["Node Index"], "nodelink"));
        }
      }
      if (item.Sources && item.Sources.length) {
        let ul = document.createElement("ul");
        for (const src of item.Sources) {
          let idx = src["Node Index"];
          let odx = src["Output Index"];
          let name = ainb.nodes[idx].outputs[odx].name;
          ul.appendChild($li([
            $span(name + " "),
            $node(idx, "nodelink"),
            $span(` index: ${odx}`, "typevalue")
          ]));
        }
        parts.push(ul);
      }
      el.append($li(parts, "item"));
      k += 1;
    }
  }
  function create_node(node, ainb) {
    const el = document.createElement("div");
    el.classList.add("nodedata");
    if (node.name) {
      el.appendChild($txt(`${node.name} (${node.index})`, "header"));
    } else {
      el.appendChild($txt(`${node.type} (${node.index})`, "header"));
    }
    addSection(node.properties, el, "Properties", "Properties", ainb, node);
    addSection(node.inputs, el, "Inputs", "Inputs", ainb, node);
    addSection(node.outputs, el, "Outputs", "Outputs", ainb, node);
    return el;
  }
  function node_color(node) {
    let s = 0.95;
    let v = 0.55;
    switch (node.type) {
      case "Element_Expression":
        return hsv2hex(1 / 16, s, v);
      case "Element_F32Selector":
        return hsv2hex(2 / 16, s, v);
      case "Element_ModuleIF_Output_Bool":
        return hsv2hex(3 / 16, s, v);
      case "Element_ModuleIF_Input_Bool":
        return hsv2hex(4 / 16, s, v);
      case "Element_SplitTiming":
        return hsv2hex(5 / 16, s, v);
      case "Element_S32Selector":
        return hsv2hex(6 / 16, s, v);
      case "Element_Sequential":
        return hsv2hex(7 / 16, s, v);
      case "Element_BoolSelector":
        return hsv2hex(8 / 16, s, v);
      case "Element_Simultaneous":
        return hsv2hex(9 / 16, s, v);
      default:
        break;
    }
    s = 0.95;
    v = 0.45;
    let ncolors = 8;
    if (node.name.startsWith("Operate")) {
      return hsv2hex(0 / ncolors, s, v);
    }
    if (node.name.startsWith("Execute")) {
      return hsv2hex(1 / ncolors, s, v);
    }
    if (node.name.startsWith("Query")) {
      return hsv2hex(2 / ncolors, s, v);
    }
    if (node.name.startsWith("ActorLogic")) {
      return hsv2hex(3 / ncolors, s, v);
    }
    if (node.name.startsWith("OneShot")) {
      return hsv2hex(4 / ncolors, s, v);
    }
    if (node.name.startsWith("Hold")) {
      return hsv2hex(5 / ncolors, s, v);
    }
    if (node.name.startsWith("Selector")) {
      return hsv2hex(6 / ncolors, s, v);
    }
    if (node.name.startsWith("Trigger")) {
      return hsv2hex(7 / ncolors, s, v);
    }
    return "#63718e";
  }
  async function load_json(filename) {
    const res = await fetch(filename);
    return res.json();
  }
  async function main() {
    ainb_files = await load_json("index.json");
    for (const file of ainb_files) {
      ainblist.append(ainb_link(file));
    }
    ainb_search_term();
    const url = new URL(window.location);
    let filename = url.searchParams.get("file");
    let node = url.searchParams.get("node");
    if (!filename) {
      filename = ainb_files[0] + ".json";
    }
    await show_graph(filename);
    if (node) {
      scroll_to_node(node);
    }
  }
  function ainb_link(filename) {
    const el = document.createElement("li");
    el.textContent = filename;
    el.classList.add("listitem");
    el.addEventListener("click", (ev) => {
      show_graph(filename + ".json");
      ev.stopPropagation();
      ev.preventDefault();
    });
    return el;
  }
  function scroll_to_node(id2) {
    let el = selectAll_default2("g.node").filter((v) => {
      return v == id2;
    });
    let x2 = el.node().transform.baseVal[0].matrix.e;
    let y2 = el.node().transform.baseVal[0].matrix.f;
    let svg2 = select_default2("svg");
    zoom.scaleTo(svg2, 1);
    svg2.transition().duration(1e3).call(zoom.translateTo, x2, y2);
    set_url("", id2);
  }
  function node_set_border(id2, color2, width2) {
    let el = selectAll_default2("g.node").filter((v) => {
      return v == id2;
    });
    el.select("rect").style("stroke", color2).style("stroke-width", width2);
  }
  function edge_set_border(id2, color2, width2) {
    let el = selectAll_default2("g.edgePath").filter((v) => {
      return v.name == id2;
    });
    el.select("path").style("stroke", color2).style("stroke-width", width2).style("fill", "color");
    el.select("marker").select("path").style("fill", color2);
    el = selectAll_default2("g.edgeLabel").filter((v) => {
      return v.name == id2;
    });
    el.select("tspan").style("fill", color2);
  }
  function focus_node(id2) {
    node_set_border(id2, STYLE.node.focus.color, STYLE.node.focus.width);
    const edges = g.edges().filter((e) => e.v == id2 || e.w == id2);
    for (const edge of edges) {
      const io = edge.v == id2 ? STYLE.edge.focus.output : STYLE.edge.focus.input;
      edge_set_border(edge.name, io.color, io.width);
    }
  }
  function unfocus_node(id2) {
    node_set_border(id2, STYLE.node.default.color, STYLE.node.default.width);
    const edges = g.edges().filter((e) => e.v == id2 || e.w == id2);
    for (const edge of edges) {
      edge_set_border(edge.name, STYLE.edge.default.color, STYLE.edge.default.width);
    }
  }
  function node_link(node) {
    const el = document.createElement("li");
    const id2 = _n + node.index;
    el.textContent = node.label;
    el.classList.add("listitem");
    el.addEventListener("click", (_ev) => {
      scroll_to_node(id2);
    });
    el.addEventListener("mouseover", (_ev) => {
      focus_node(id2);
    });
    el.addEventListener("mouseleave", (_ev) => {
      unfocus_node(id2);
    });
    return el;
  }
  async function show_graph(filename) {
    _filename = filename;
    const ainb = await load(filename);
    raw.setAttribute("href", `ainb_as_json_v2.0/${filename}`);
    if (g) {
      g.nodes().forEach((id2) => g.removeNode(id2));
    }
    g = new graphlib_exports.Graph({ multigraph: true }).setGraph({});
    g.graph().ranksep = ranksep.value;
    g.graph().nodesep = nodesep.value;
    g.graph().ranker = ranker.value;
    g.graph().rankdir = rankdir.value;
    g.graph().align = align.value;
    g.setDefaultEdgeLabel(function() {
      return {};
    });
    let edges = /* @__PURE__ */ new Set();
    const setEdge = (source, target, options) => {
      const s = `n${source}`;
      const t = `n${target}`;
      const key = `${s}-${t}-${options.label}`;
      if (edges.has(key)) {
        return;
      }
      g.setEdge(s, t, options, key);
    };
    const style2 = "stroke: white; fill: none; stroke-width: 2px;";
    const curve = linear_default;
    const labelStyle = "fill: white; stroke-width: 0px; font-family: sans-serif; font-size: 1.1em;";
    const arrowheadStyle = "fill: white;";
    nodelist.replaceChildren();
    nodelist.append($txt(filename));
    for (const node of ainb.nodes) {
      let nodeStyle = `fill: ${node_color(node)};`;
      nodelist.appendChild(node_link(node));
      g.setNode(_n + node.index, { label: create_node(node, ainb), style: nodeStyle, rx: 13, ry: 13 });
      for (const link of node.inputs) {
        if (!link.Sources) {
          if (link.index !== void 0 && link.index >= 0) {
            setEdge(link.index, node.index, {
              label: link.label,
              style: style2,
              curve,
              labelStyle,
              arrowheadStyle
            });
          } else if (link["Blackboard Index"] >= 0) {
            setEdge(BB, node.index, {
              label: link.label,
              style: style2,
              curve,
              labelStyle,
              arrowheadStyle
            });
          }
        } else {
          for (const src of link.Sources) {
            let idx = src["Node Index"];
            let label = link.label;
            if (idx >= 0) {
              const odx = src["Output Index"];
              if (odx >= 0 && ainb.nodes && ainb.nodes[idx] && ainb.nodes[idx].outputs && ainb.nodes[idx].outputs[odx] && ainb.nodes[idx].outputs[odx].name) {
                label = ainb.nodes[idx].outputs[odx].name;
              }
              setEdge(idx, node.index, {
                label,
                style: style2,
                curve,
                labelStyle,
                arrowheadStyle
              });
            }
          }
        }
      }
      for (const kind of Object.keys(node.Properties)) {
        for (const item of node.Properties[kind]) {
          if (item["Blackboard Index"] >= 0) {
            setEdge(BB, node.index, {
              label: item.name,
              style: style2,
              curve,
              labelStyle,
              arrowheadStyle
            });
          }
        }
      }
    }
    if (ainb.blackboard.length) {
      let nodeStyle = `fill: rgb(200,40,40);`;
      const el = document.createElement("div");
      el.classList.add("nodedata");
      el.append($txt("Blackboard", "header"));
      addSection(ainb.blackboard, el, "Outputs", "Blackboard", ainb, {});
      g.setNode(`n${BB}`, { label: el, style: nodeStyle, rx: 13, ry: 13 });
    }
    for (const node of ainb.nodes) {
      for (const plug of node.plugs) {
        if (plug.type == "Child" && plug.index >= 0) {
          setEdge(node.index, plug.index, {
            label: plug.label,
            style: style2,
            curve,
            labelStyle,
            arrowheadStyle
          });
        }
      }
    }
    var svg2 = select_default2("svg"), inner = svg2.select("g");
    zoom = zoom_default2().on("zoom", (event) => {
      inner.attr("transform", event.transform);
    });
    svg2.call(zoom);
    var render2 = new render();
    render2(inner, g);
    svg2.selectAll("g.node").each(function(v) {
      this.addEventListener("mousedown", (ev) => {
        ev.stopPropagation();
      });
      this.addEventListener("mouseover", (ev) => {
        ev.stopPropagation();
        focus_node(v);
      });
      this.addEventListener("mouseleave", (ev) => {
        ev.stopPropagation();
        unfocus_node(v);
      });
      this.addEventListener("click", (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        scroll_to_node(v);
      });
      this.addEventListener("dblclick", (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
      });
    });
    const { width: width2, height } = inner.node().getBBox();
    let rect2 = document.getElementsByTagName("svg")[0].getBoundingClientRect();
    if (width2 && height) {
      const scale = Math.min(rect2.width / width2, rect2.height / height) * 0.95;
      zoom.scaleTo(svg2, scale);
      zoom.translateTo(svg2, width2 / 2, height / 2);
    }
    node_search_term();
    set_url(filename);
  }
  function set_url(filename = "", node = "") {
    const url = new URL(window.location);
    if (node == "") {
      url.searchParams.delete("node");
    } else {
      url.searchParams.set("node", node);
    }
    if (filename != "") {
      url.searchParams.set("file", filename);
    }
    window.history.pushState({}, "", url.toString());
  }
  ranker.addEventListener("change", (ev) => {
    show_graph(_filename);
  });
  rankdir.addEventListener("change", (ev) => {
    show_graph(_filename);
  });
  align.addEventListener("change", (ev) => {
    show_graph(_filename);
  });
  ranksep.addEventListener("input", (ev) => {
    show_graph(_filename);
  });
  nodesep.addEventListener("input", (ev) => {
    show_graph(_filename);
  });
  main();
})();
/*! Bundled license information:

lodash-es/lodash.js:
  (**
   * @license
   * Lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="es" -o ./`
   * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   *)
*/
//# sourceMappingURL=main.js.map
