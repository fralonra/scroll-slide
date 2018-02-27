(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
(function (global){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var aniDuration = Symbol('aniDuration');
var currentSection = Symbol('currentSection');
var doc = Symbol('doc');
var handleMouseWheel = Symbol('handleMouseWheel');
var lastAniTime = Symbol('lastAniTime');
var option = Symbol('option');
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
      container: null,
      direction: 'vertical',
      idleTime: 200,
      loop: true,
      paginator: false,
      sections: []
    };
    self[aniDuration] = defaultAniDuration;
    self[currentSection] = 0;
    self[doc] = null;
    self[lastAniTime] = 0;
    self[win] = null;
    self[wrapper] = null;

    Object.keys(opt).forEach(function (k) {
      self[option][k] = opt[k];
    });

    var sections = self[option].sections;
    if (sections.length < 2) throw Error('sections must be more than 2');
    sections.forEach(function (s) {
      if (s instanceof Element) {} else throw Error('section must be an instance of Element');
    });

    self[doc] = sections[0].ownerDocument;
    self[win] = self[doc].defaultView;

    var container = self[option].container;
    if (container === null) {
      container = self[doc].getElementByTagName('body')[0];
    }
    container.style.position = 'relative';
    container.style.height = '100%';
    container.style.overflow = 'hidden';
    container.addEventListener('DOMMouseScroll', function (e) {
      self[handleMouseWheel](e);
    });
    container.addEventListener('mousewheel', function (e) {
      self[handleMouseWheel](e);
    });

    self[wrapper] = self[doc].createElement('div');
    self[wrapper].style.display = 'flex';
    self[wrapper].style['flex-flow'] = self[option].direction === 'horizontal' ? 'row' : 'column';
    self[wrapper].style.position = 'relative';
    self[wrapper].style.top = '0';

    var d = String(self[option].aniDuration);
    var duration = d.match(/^\d+s$/) ? d : d.match(/^\d+$/) ? d + 's' : '1s';
    self[wrapper].style.transition = 'top ' + duration + ' ease 0s';
    self[aniDuration] = timeToMsNum(d);

    sections.forEach(function (s) {
      if (s.getAttribute('full')) {
        s.style.flex = '0 0 ' + container.clientHeight;
      }
      moveEl(s, self[wrapper]);
    });
    moveEl(self[wrapper], container);
  }

  // PUBLIC


  _createClass(Scroll, [{
    key: 'scrollDown',
    value: function scrollDown() {
      var self = this;

      var sections = self[option].sections;
      if (self[currentSection] === sections.length - 1 && !self[option].loop) return;

      var top = strToNum(self[wrapper].style.top);
      self[wrapper].style.top = self[currentSection] === sections.length - 1 ? 0 : top - sections[self[currentSection]].clientHeight;

      if (++self[currentSection] > sections.length - 1) {
        self[currentSection] = 0;
      }
    }
  }, {
    key: 'scrollUp',
    value: function scrollUp() {
      var self = this;

      if (self[currentSection] === 0 && !self[option].loop) return;

      var sections = self[option].sections;
      var top = strToNum(self[wrapper].style.top);
      self[wrapper].style.top = self[currentSection] === 0 ? sections[sections.length - 1].clientHeight - self[wrapper].clientHeight : top + sections[self[currentSection] - 1].clientHeight;

      if (--self[currentSection] < 0) {
        self[currentSection] = sections.length - 1;
      }
    }

    // PRIVATE

  }, {
    key: handleMouseWheel,
    value: function value(e) {
      var self = this;
      var now = new Date().getTime();
      if (now - self[lastAniTime] < self[option].idleTime + self[aniDuration]) {
        return e.preventDefault();
      }

      var delta = e.wheelDelta || -e.detail;
      if (delta < 0) {
        self.scrollDown();
      } else {
        self.scrollUp();
      }

      self[lastAniTime] = now;
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
