(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
(function (global){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var currentSlide = Symbol('currentSlide');
var doc = Symbol('doc');
var dotList = Symbol('dotList');
var duration = Symbol('duration');
var handleDotClick = Symbol('handleDotClick');
var handleKeyboard = Symbol('handleKeyboard');
var handleMouseWheel = Symbol('handleMouseWheel');
var handleResize = Symbol('handleResize');
var handleTouchMove = Symbol('handleTouchMove');
var handleTouchStart = Symbol('handleTouchStart');
var isTouching = Symbol('isTouching');
var lastAniTime = Symbol('lastAniTime');
var option = Symbol('option');
var paginator = Symbol('paginator');
var scrollInSlide = Symbol('scrollInSlide');
var touchStartY = Symbol('touchStartY');
var win = Symbol('win');
var wrapper = Symbol('wrapper');

var defaultDuration = 1000;
var classNamePrefix = 'scroll-slide';

var Scroll = function () {
  function Scroll() {
    var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Scroll);

    this._initOption(opt);
    this._initView();
    this._initGlobalEvent();
  }

  // PUBLIC


  _createClass(Scroll, [{
    key: 'add',
    value: function add(el) {
      var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;

      var self = this;
      var oldSlides = self[option].slides;
      var newSlides = [];
      if (index < 0 || index > oldSlides.length) index = oldSlides.length;

      self._initSlide(el, index);

      self[option].slides = insert(self[option].slides, index, el);
      if (index <= self[currentSlide]) {
        var top = self._prevSlidesHeight(++self[currentSlide]);
        self[wrapper].style.top = -top + 'px';
      }

      if (self[option].paginator !== 'none') {
        self._addDot(index);
        if (index <= self[currentSlide]) self._changePaginator(self[currentSlide] - 1, self[currentSlide]);
      }
    }
  }, {
    key: 'current',
    value: function current() {
      return this[currentSlide];
    }
  }, {
    key: 'remove',
    value: function remove(index) {
      if (index >= this[option].slides.length - 1) return;

      if (index === this[currentSlide]) {
        if (index === this[option].slides.length - 1) this.scrollTo(0);
      }

      if (index < this[currentSlide]) {
        this.scrollTo(this[currentSlide] - 1);
      }

      if (this[option].paginator !== 'none') {
        this._removeDot(index);
        if (index <= this[currentSlide]) this._changePaginator(this[currentSlide] - 1, this[currentSlide]);
      }

      this[wrapper].removeChild(this[option].slides[index]);
      this[option].slides = this[option].slides.filter(function (s, i, arr) {
        return i !== index;
      });
    }
  }, {
    key: 'scrollDown',
    value: function scrollDown() {
      var self = this;

      var slides = self[option].slides;
      if (self._isLastSlide() && !self[option].loop) return;

      var nextSlide = self._isLastSlide() ? 0 : self[currentSlide] + 1;
      var multiPages = self._isSlideMutiPages(self[currentSlide]);
      var top = strToNum(self[wrapper].style.top);
      var newTopDiff = !multiPages ? slides[self[currentSlide]].clientHeight : slides[self[currentSlide]].clientHeight - self[scrollInSlide] > self[option].viewport.clientHeight ? self[option].viewport.clientHeight : slides[self[currentSlide]].clientHeight - self[scrollInSlide];

      var canMultiScrollToNext = multiPages && self[scrollInSlide] + newTopDiff === slides[self[currentSlide]].clientHeight;
      self[wrapper].style.top = self._isLastSlide() && !multiPages || self._isLastSlide() && canMultiScrollToNext ? '0px' : top - newTopDiff + 'px';

      if (!multiPages || canMultiScrollToNext) {
        self._changePaginator(self[currentSlide], nextSlide);
        self._setCurrentSlide(nextSlide);
        if (self[scrollInSlide] !== 0) self[scrollInSlide] = 0;
      } else if (multiPages) {
        self[scrollInSlide] += newTopDiff;
      }
    }
  }, {
    key: 'scrollTo',
    value: function scrollTo() {
      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      var length = this[option].slides.length - 1;
      if (index < 0) index = length;else if (index > length) index = 0;
      var top = index === 0 ? 0 : this._prevSlidesHeight(index);
      this[wrapper].style.top = -top + 'px';
      if (this[currentSlide] !== index) this._changePaginator(this[currentSlide], index);

      var callback = index === this[currentSlide] ? false : true;
      this._setCurrentSlide(index, callback);
      if (this[scrollInSlide] !== 0) this[scrollInSlide] = 0;
    }
  }, {
    key: 'scrollUp',
    value: function scrollUp() {
      var self = this;

      if (self._isFirstSlide() && !self[option].loop) return;

      var slides = self[option].slides;
      var lastSlide = self._isFirstSlide() ? slides.length - 1 : self[currentSlide] - 1;
      var multiPages = self._isSlideMutiPages(self[currentSlide]);
      var top = strToNum(self[wrapper].style.top);
      self[wrapper].style.top = self._isFirstSlide() ? slides[slides.length - 1].clientHeight - self[wrapper].clientHeight + 'px' : self[scrollInSlide] === 0 ? top + slides[lastSlide].clientHeight + 'px' : top + self[scrollInSlide] + 'px';

      if (self[scrollInSlide] === 0) {
        self._changePaginator(self[currentSlide], lastSlide);
        self._setCurrentSlide(lastSlide);
      } else {
        self[scrollInSlide] = 0;
      }
    }
  }, {
    key: 'toggleFull',
    value: function toggleFull(el) {
      if (el.getAttribute('full') === 'true') {
        el.removeAttribute('full');
        el.style.height = '';
      } else {
        el.setAttribute('full', 'true');
        el.style.height = this[option].viewport.clientHeight + 'px';
      }
    }

    // PRIVATE

  }, {
    key: '_changePaginator',
    value: function _changePaginator(oldDot, newDot) {
      var self = this;
      if (self[option].paginator === 'none') return;
      self[dotList].forEach(function (d, i, arr) {
        if (newDot === i) {
          d.classList.add(classNamePrefix + '-paginator-dot-active');
          d.style.background = self[option].dotActiveColor;
        } else if (oldDot === i) {
          d.classList.remove(classNamePrefix + '-paginator-dot-active');
          d.style.background = self[option].dotColor;
        }
      });
    }
  }, {
    key: '_addDot',
    value: function _addDot() {
      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      this._initDot(index);

      this[dotList].forEach(function (d, i, arr) {
        if (i > index) d.setAttribute('index', Number(d.getAttribute('index')) + 1);
      });
      this._initPaginatorTop();
    }
  }, {
    key: '_removeDot',
    value: function _removeDot() {
      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      var dot = this[dotList][index];
      this[paginator].removeChild(dot);
      this[dotList].forEach(function (d, i, arr) {
        if (i > index) d.setAttribute('index', i - 1);
      });
      this[dotList].splice(index, 1);
      this._initPaginatorTop();
    }
  }, {
    key: '_initOption',
    value: function _initOption() {
      var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var defaultOpt = {
        autoHeight: true,
        duration: defaultDuration,
        dotColor: '#e1e1e1',
        dotActiveColor: '#6687ff',
        idleTime: 200,
        loop: true,
        keyboard: true,
        paginator: 'none',
        slides: [],
        viewport: null,
        onScroll: null
      };
      this[currentSlide] = 0;
      this[doc] = global.document;
      this[dotList] = null;
      this[isTouching] = false;
      this[lastAniTime] = 0;
      this[paginator] = null;
      this[scrollInSlide] = 0;
      this[touchStartY] = 0;
      this[win] = global;
      this[wrapper] = null;

      this[option] = Object.assign(defaultOpt, opt);
      this[duration] = this[option].duration;
    }
  }, {
    key: '_initDot',
    value: function _initDot() {
      var _this = this;

      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      var dot = this[doc].createElement('div');
      dot.setAttribute('index', index);
      dot.classList.add(classNamePrefix + '-paginator-dot');
      dot.style.width = '0.75rem';
      dot.style.height = '0.75rem';
      dot.style.background = this[option].dotColor;
      dot.style.margin = '0.5rem auto';
      dot.style.borderRadius = '50%';
      dot.style.transition = 'all 0.5s ease 0s';
      dot.style.cursor = 'pointer';

      if (index === this[currentSlide]) {
        dot.classList.add(classNamePrefix + '-paginator-dot-active');
        dot.style.background = this[option].dotActiveColor;
      }

      dot.addEventListener('click', function (e) {
        _this[handleDotClick](e);
      });

      this[dotList] = insert(this[dotList], index, dot);
      moveEl(dot, this[paginator], index);
    }
  }, {
    key: '_initDotList',
    value: function _initDotList() {
      var _this2 = this;

      this[dotList] = [];
      this[option].slides.forEach(function (s, i, arr) {
        _this2._initDot(i);
      });
    }
  }, {
    key: '_initFullHeight',
    value: function _initFullHeight(el) {
      el.style.height = this[option].viewport.clientHeight + 'px';
    }
  }, {
    key: '_initGlobalEvent',
    value: function _initGlobalEvent() {
      var self = this;

      if (self[option].autoHeight) {
        window.addEventListener('resize', function (e) {
          self[handleResize](e);

          self[wrapper].style.transitionDuration = '0s';
          self.scrollTo(self[currentSlide]);
          setTimeout(function () {
            self[wrapper].style.transitionDuration = genDurationText(String(self[duration]));
          }, 1);
        });
      }

      if (self[option].keyboard) {
        self[doc].addEventListener('keydown', function (e) {
          self[handleKeyboard](e);
        });
      }
    }
  }, {
    key: '_initPaginator',
    value: function _initPaginator() {
      var pos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this[option].paginator;

      var p = this[paginator];
      p.classList.add(classNamePrefix + '-paginator');
      p.style.position = 'absolute';
      p.style[pos] = this[wrapper].clientWidth * 0.05 + 'px';

      this._initDotList();

      this[option].viewport.appendChild(p);
      p.style.top = '50%';
      this._initPaginatorTop();
    }
  }, {
    key: '_initPaginatorTop',
    value: function _initPaginatorTop() {
      var top = this[paginator].clientHeight / 2;
      this[paginator].style.marginTop = -top + 'px';
    }
  }, {
    key: '_initSlide',
    value: function _initSlide(el) {
      var i = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      el.classList.add(classNamePrefix + '-slide');
      el.style.overflow = 'hidden';
      if (el.getAttribute('full') === 'true') {
        this._initFullHeight(el);
      }
      moveEl(el, this[wrapper], i);
    }
  }, {
    key: '_initSlides',
    value: function _initSlides() {
      var _this3 = this;

      this[option].slides = Array.from(this[option].slides);
      var slides = this[option].slides;
      slides.forEach(function (s) {
        if (s instanceof Element) {} else throw Error('section must be an instance of Element');
      });
      slides.forEach(function (s) {
        _this3._initSlide(s);
      });
      moveEl(this[wrapper], this[option].viewport);
    }
  }, {
    key: '_isFirstSlide',
    value: function _isFirstSlide() {
      return this[currentSlide] === 0;
    }
  }, {
    key: '_isLastSlide',
    value: function _isLastSlide() {
      return this[currentSlide] === this[option].slides.length - 1;
    }
  }, {
    key: '_isSlideOnTop',
    value: function _isSlideOnTop() {
      return strToNum(this[wrapper].style.top) === this._prevSlidesHeight();
    }
  }, {
    key: '_isSlideMutiPages',
    value: function _isSlideMutiPages(i) {
      return this[option].slides[i].clientHeight > this[option].viewport.clientHeight;
    }
  }, {
    key: '_initView',
    value: function _initView() {
      var self = this;

      var viewport = self[option].viewport;
      if (viewport === null) {
        viewport = self[doc].getElementByTagName('body')[0];
      }
      viewport.classList.add(classNamePrefix + '-viewport');
      viewport.style.position = 'relative';
      if (viewport.style.height === '') viewport.style.height = '100%';
      viewport.style.overflow = 'hidden';
      viewport.addEventListener('DOMMouseScroll', function (e) {
        self[handleMouseWheel](e);
      });
      viewport.addEventListener('mousewheel', function (e) {
        self[handleMouseWheel](e);
      });
      viewport.addEventListener('touchstart', function (e) {
        self[handleTouchStart](e);
      });

      self[wrapper] = self[doc].createElement('div');
      self[wrapper].classList.add(classNamePrefix + '-wrapper');
      self[wrapper].style.position = 'relative';
      self[wrapper].style.top = '0px';

      var durationText = genDurationText(String(self[duration]));
      self[wrapper].style.transition = 'all ' + durationText + ' ease 0s';

      self._initSlides();

      if (self[option].paginator !== 'none' && self[option].paginator !== 'left' && self[option].paginator !== 'right') self[option].paginator = 'none';
      if (self[option].paginator !== 'none') {
        viewport.style.position = 'relative';
        self[paginator] = this[doc].createElement('div');
        self._initPaginator();
      }
    }
  }, {
    key: '_prevSlidesHeight',
    value: function _prevSlidesHeight() {
      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this[currentSlide];

      var self = this;
      var heights = 0;
      self[option].slides.forEach(function (s, i, arr) {
        if (index <= i) return;
        heights += s.clientHeight;
      });
      return heights;
    }
  }, {
    key: '_setCurrentSlide',
    value: function _setCurrentSlide(val) {
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      this[currentSlide] = val;
      if (callback && typeof this[option].onScroll === 'function') {
        this[option].onScroll(this[currentSlide]);
      }
    }
  }, {
    key: handleDotClick,
    value: function value(e) {
      e.preventDefault();

      var index = Number(e.target.getAttribute('index')) || 0;
      if (index === this[currentSlide]) return;

      this.scrollTo(index);
    }
  }, {
    key: handleKeyboard,
    value: function value(e) {
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
          this.scrollDown();
          break;
        case 'ArrowUp':
        case 'PageUp':
          this.scrollUp();
          break;
        default:
          return;
      }
    }
  }, {
    key: handleMouseWheel,
    value: function value(e) {
      e.preventDefault();

      var self = this;
      var now = new Date().getTime();
      if (now - self[lastAniTime] < self[option].idleTime + self[duration]) return;

      var delta = e.wheelDelta || -e.detail;
      if (delta < 0) {
        self.scrollDown();
      } else {
        self.scrollUp();
      }

      self[lastAniTime] = now;
    }
  }, {
    key: handleResize,
    value: function value(e) {
      this._initSlides();
    }
  }, {
    key: handleTouchMove,
    value: function value(e) {
      e.preventDefault();

      var self = this;
      if (!self[isTouching]) return;

      var now = new Date().getTime();
      if (now - self[lastAniTime] < self[option].idleTime + self[duration]) return;

      if (e.touches && e.touches.length) {
        var delta = self[touchStartY] - e.touches[0].pageY;
        if (Math.abs(delta) < 50) return;
        if (delta < 0) {
          self.scrollDown();
        } else {
          self.scrollUp();
        }
        e.target.removeEventListener('touchmove', self[handleTouchMove]);

        self[lastAniTime] = now;
      }

      self[touchStartY] = 0;
      self[isTouching] = false;
    }
  }, {
    key: handleTouchStart,
    value: function value(e) {
      e.preventDefault();

      var self = this;
      if (e.touches && e.touches.length) {
        self[isTouching] = true;
        self[touchStartY] = e.touches[0].pageY;
        self[option].viewport.addEventListener('touchmove', function (e) {
          self[handleTouchMove](e);
        });
      }
    }
  }]);

  return Scroll;
}();

function genDurationText(duration) {
  return duration.match(/^\d+$/) ? duration + 'ms' : defaultDuration + 'ms';
}

function insert(arr, index, el) {
  var newArr = [];
  arr.forEach(function (a, i, array) {
    if (i === index) newArr.push(el);
    newArr.push(a);
  });
  if (index === arr.length) newArr.push(el);
  return newArr;
}

function moveEl(el, to) {
  var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  var childList = to.hasChildNodes() ? to.childNodes : [];

  if (i === null || i === childList.length) return to.appendChild(el);

  return to.insertBefore(el, childList[i]);
}

function strToNum(str) {
  return Number(str.split(/[^\d-]+/)[0]);
}

// GLOBAL
function scroll(opt) {
  return new Scroll(opt);
}

global.Scroll = Scroll;
global.scroll = scroll;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
