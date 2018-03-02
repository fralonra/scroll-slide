(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
(function (global){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var aniDuration = Symbol('aniDuration');
var currentSlide = Symbol('currentSlide');
var doc = Symbol('doc');
var handleKeyboard = Symbol('handleKeyboard');
var handleMouseWheel = Symbol('handleMouseWheel');
var handleTouchMove = Symbol('handleTouchMove');
var handleTouchStart = Symbol('handleTouchStart');
var isTouching = Symbol('isTouching');
var lastAniTime = Symbol('lastAniTime');
var option = Symbol('option');
var scrollInSlide = Symbol('scrollInSlide');
var touchStartY = Symbol('touchStartY');
var win = Symbol('win');
var wrapper = Symbol('wrapper');

var defaultAniDuration = 1000;
var classNamePrefix = 'scroll-slide';

var Scroll = function () {
  function Scroll() {
    var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Scroll);

    var self = this;

    self[option] = {
      aniDuration: defaultAniDuration + 'ms',
      idleTime: 200,
      loop: true,
      keyboard: true,
      slides: [],
      viewport: null
    };
    self[aniDuration] = defaultAniDuration;
    self[currentSlide] = 0;
    self[doc] = null;
    self[isTouching] = false;
    self[lastAniTime] = 0;
    self[scrollInSlide] = 0;
    self[touchStartY] = 0;
    self[win] = null;
    self[wrapper] = null;

    Object.keys(opt).forEach(function (k) {
      self[option][k] = opt[k];
    });

    var slides = Array.from(self[option].slides);
    slides.forEach(function (s) {
      if (s instanceof Element) {} else throw Error('section must be an instance of Element');
    });

    self[doc] = slides[0].ownerDocument;
    self[win] = self[doc].defaultView;

    var viewport = self[option].viewport;
    if (viewport === null) {
      viewport = self[doc].getElementByTagName('body')[0];
    }
    viewport.classList.add(classNamePrefix + '-viewport');
    viewport.style.position = 'relative';
    viewport.style.height = '100%';
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
    if (self[option].keyboard) {
      self[doc].addEventListener('keydown', function (e) {
        self[handleKeyboard](e);
      });
    }

    self[wrapper] = self[doc].createElement('div');
    self[wrapper].classList.add(classNamePrefix + '-wrapper');
    self[wrapper].style.position = 'relative';
    self[wrapper].style.top = '0';

    var d = String(self[option].aniDuration);
    var duration = d.match(/^\d+s$/) ? d : d.match(/^\d+$/) ? d + 's' : '1s';
    self[wrapper].style.transition = 'all ' + duration + ' ease 0s';
    self[aniDuration] = timeToMsNum(d);

    slides.forEach(function (s) {
      self._initSlide(s);
    });
    moveEl(self[wrapper], viewport);
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
      oldSlides.forEach(function (s, i, arr) {
        if (i === index) newSlides.push(el);
        newSlides.push(s);
      });
      if (index === oldSlides.length) newSlides.push(el);

      self[option].slides = newSlides;
    }
  }, {
    key: 'remove',
    value: function remove(index) {
      this[wrapper].removeChild(this[option].slides[index]);
      this[option].slides = this[option].slides.filter(function (s, i, arr) {
        return i !== index;
      });

      if (index === this[currentSlide]) this.scrollDownTo(0);
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
      var newTopDiff = !multiPages ? slides[self[currentSlide]].clientHeight : slides[self[currentSlide]].getAttribute('full') === 'true' ? self[option].viewport.clientHeight : slides[self[currentSlide]].clientHeight - self[scrollInSlide];

      self[wrapper].style.top = self._isLastSlide() ? 0 : top - newTopDiff;

      if (!multiPages || multiPages && self[scrollInSlide] + newTopDiff === slides[self[currentSlide]].clientHeight) {
        self[currentSlide] = nextSlide;
        if (self[scrollInSlide] !== 0) self[scrollInSlide] = 0;
      } else if (multiPages) {
        self[scrollInSlide] += newTopDiff;
      }
    }
  }, {
    key: 'scrollDownTo',
    value: function scrollDownTo() {
      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      var top = index === 0 ? 0 : this._prevSlidesHeight(index);
      this[wrapper].style.top = top;
      this[currentSlide] = index;
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
      self[wrapper].style.top = self._isFirstSlide() ? slides[slides.length - 1].clientHeight - self[wrapper].clientHeight : self[scrollInSlide] === 0 ? top + slides[lastSlide].clientHeight : top + self[scrollInSlide];

      if (self[scrollInSlide] === 0) {
        self[currentSlide] = lastSlide;
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
        el.style.height = this[option].viewport.clientHeight;
      }
    }

    // PRIVATE

  }, {
    key: '_initSlide',
    value: function _initSlide(el) {
      var i = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      el.classList.add(classNamePrefix + '-slide');
      if (el.getAttribute('full') === 'true') {
        var originHeight = el.clientHeight;
        el.style.height = Math.ceil(originHeight / this[option].viewport.clientHeight) * this[option].viewport.clientHeight;
      }
      moveEl(el, this[wrapper], i);
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
    key: '_prevSlidesHeight',
    value: function _prevSlidesHeight() {
      var i = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this[currentSlide];

      var self = this;
      var index = 0;
      return self[option].slides.reduce(function (a, b) {
        return index++ === 0 ? a.clientHeight : i > index - 1 ? a + b.clientHeight : a;
      });
    }
  }, {
    key: handleKeyboard,
    value: function value(e) {
      e.preventDefault();

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
      if (now - self[lastAniTime] < self[option].idleTime + self[aniDuration]) return;

      var delta = e.wheelDelta || -e.detail;
      if (delta < 0) {
        self.scrollDown();
      } else {
        self.scrollUp();
      }

      self[lastAniTime] = now;
    }
  }, {
    key: handleTouchMove,
    value: function value(e) {
      e.preventDefault();

      var self = this;
      if (!self[isTouching]) return;

      var now = new Date().getTime();
      if (now - self[lastAniTime] < self[option].idleTime + self[aniDuration]) return;

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

function moveEl(el, to) {
  var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  var childList = to.hasChildNodes() ? to.childNodes : [];

  if (i === null || i === childList.length) return to.appendChild(el);

  return to.insertBefore(el, childList[i]);
}

function strToNum(str) {
  return Number(str.split(/[^\d-]+/)[0]);
}

function timeToMsNum(time) {
  return time.match(/^\d+ms$/) ? Number(time.split('ms')[0]) : time.match(/^\d+s$/) ? Number(time.split('s')[0]) * 1000 : defaultAniDuration;
}

// GLOBAL
function scroll(opt) {
  return new Scroll(opt);
}

global.Scroll = Scroll;
global.scroll = scroll;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
