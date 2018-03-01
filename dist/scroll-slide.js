(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
(function (global){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var aniDuration = Symbol('aniDuration');
var currentSlide = Symbol('currentSlide');
var doc = Symbol('doc');
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

var Scroll = function () {
  function Scroll() {
    var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Scroll);

    var self = this;

    self[option] = {
      aniDuration: defaultAniDuration + 'ms',
      viewport: null,
      idleTime: 200,
      loop: true,
      paginator: false,
      slides: []
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

    var slides = self[option].slides;
    slides.forEach(function (s) {
      if (s instanceof Element) {} else throw Error('section must be an instance of Element');
    });

    self[doc] = slides[0].ownerDocument;
    self[win] = self[doc].defaultView;

    var viewport = self[option].viewport;
    if (viewport === null) {
      viewport = self[doc].getElementByTagName('body')[0];
    }
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

    self[wrapper] = self[doc].createElement('div');
    self[wrapper].style.position = 'relative';
    self[wrapper].style.top = '0';

    var d = String(self[option].aniDuration);
    var duration = d.match(/^\d+s$/) ? d : d.match(/^\d+$/) ? d + 's' : '1s';
    self[wrapper].style.transition = 'all ' + duration + ' ease 0s';
    self[aniDuration] = timeToMsNum(d);

    slides.forEach(function (s) {
      if (s.getAttribute('full') === 'true') {
        var originHeight = s.clientHeight;
        s.style.height = Math.ceil(originHeight / viewport.clientHeight) * viewport.clientHeight;
      }
      moveEl(s, self[wrapper]);
    });
    moveEl(self[wrapper], viewport);
  }

  // PUBLIC


  _createClass(Scroll, [{
    key: 'add',
    value: function add(el) {
      var i = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;

      if (i === -1) i = self[option].slides.length;
    }
  }, {
    key: 'remove',
    value: function remove(i) {}
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
        el.style.flex = '';
      } else {
        el.setAttribute('full', 'true');
        el.style.flex = '0 0 ' + this[option].viewport.clientHeight;
      }
    }

    // PRIVATE

  }, {
    key: '_isFirstSlide',
    value: function _isFirstSlide() {
      return this[currentSlide] === 0;
    }
  }, {
    key: '_isLastSlide',
    value: function _isLastSlide() {
      // console.log(this[currentSlide], this[option].slides.length);
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
      var self = this;
      var index = 0;
      return Array.from(self[option].slides).reduce(function (a, b) {
        return index++ === 0 ? a.clientHeight : self[currentSlide] > index - 1 ? a + b.clientHeight : a;
      });
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
  to.appendChild(el);
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
