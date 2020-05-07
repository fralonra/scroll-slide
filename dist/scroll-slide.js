(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Scroll = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  var classNamePrefix = 'scroll-slide';
  var defaultOpt = {
    autoHeight: true,
    duration: 1000,
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

  var Scroll = /*#__PURE__*/function () {
    function Scroll() {
      var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, Scroll);

      this._initOption(opt);

      this._initView();

      this._initGlobalEvent();
    }

    _createClass(Scroll, [{
      key: "add",
      value: function add(el) {
        var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
        var oldSlides = this._option.slides;
        if (index < 0 || index > oldSlides.length) index = oldSlides.length;

        this._initSlide(el, index);

        insert(this._option.slides, index, el);

        if (index <= this._currentSlide) {
          translateY(this._wrapper, -this._prevSlidesHeight(++this._currentSlide));
        }

        if (this._option.paginator !== 'none') {
          this._addDot(index);

          if (index <= this._currentSlide) {
            this._changePaginator(this._currentSlide - 1, this._currentSlide);
          }
        }
      }
    }, {
      key: "current",
      value: function current() {
        return this._currentSlide;
      }
    }, {
      key: "remove",
      value: function remove(index) {
        if (index >= this._option.slides.length - 1) return;

        this._wrapper.removeChild(this._option.slides[index]);

        this._option.slides.splice(index, 1);

        if (index === this._currentSlide && index === this._option.slides.length - 1) {
          this.scrollTo(0);
        } else if (index < this._currentSlide) {
          this.scrollTo(this._currentSlide - 1);
        }

        if (this._option.paginator !== 'none') {
          this._removeDot(index);

          if (index <= this._currentSlide) {
            this._changePaginator(this._currentSlide - 1, this._currentSlide);
          }
        }
      }
    }, {
      key: "scrollDown",
      value: function scrollDown() {
        var slides = this._option.slides;
        if (this._isLastSlide() && !this._option.loop) return;
        var nextSlide = this._isLastSlide() ? 0 : this._currentSlide + 1;

        var multiPages = this._isSlideMutiPages(this._currentSlide);

        var newTopDiff = !multiPages ? slides[this._currentSlide].clientHeight : slides[this._currentSlide].clientHeight - this._scrollInSlide > this._option.viewport.clientHeight ? this._option.viewport.clientHeight : slides[this._currentSlide].clientHeight - this._scrollInSlide;
        var canMultiScrollToNext = multiPages && this._scrollInSlide + newTopDiff === slides[this._currentSlide].clientHeight;
        translateY(this._wrapper, this._isLastSlide() && !multiPages || this._isLastSlide() && canMultiScrollToNext ? 0 : this.top - newTopDiff);

        if (!multiPages || canMultiScrollToNext) {
          this._changePaginator(this._currentSlide, nextSlide);

          this._setCurrentSlide(nextSlide);

          if (this._scrollInSlide !== 0) this._scrollInSlide = 0;
        } else if (multiPages) {
          this._scrollInSlide += newTopDiff;
        }
      }
    }, {
      key: "scrollTo",
      value: function scrollTo() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var length = this._option.slides.length - 1;
        if (index < 0) index = length;else if (index > length) index = 0;
        translateY(this._wrapper, index === 0 ? 0 : -this._prevSlidesHeight(index));

        if (this._currentSlide !== index) {
          this._changePaginator(this._currentSlide, index);
        }

        this._setCurrentSlide(index);

        if (this._scrollInSlide !== 0) this._scrollInSlide = 0;
      }
    }, {
      key: "scrollUp",
      value: function scrollUp() {
        if (this._isFirstSlide() && !this._option.loop) return;
        var slides = this._option.slides;
        var lastSlide = this._isFirstSlide() ? slides.length - 1 : this._currentSlide - 1;
        translateY(this._wrapper, this._isFirstSlide() ? slides[slides.length - 1].clientHeight - this._wrapper.clientHeight : this._scrollInSlide === 0 ? this.top + slides[lastSlide].clientHeight : this.top + this._scrollInSlide);

        if (this._scrollInSlide === 0) {
          this._changePaginator(this._currentSlide, lastSlide);

          this._setCurrentSlide(lastSlide);
        } else {
          this._scrollInSlide = 0;
        }
      }
    }, {
      key: "toggleFull",
      value: function toggleFull(el) {
        if (el.getAttribute('data-full') === 'true') {
          el.removeAttribute('data-full');
          el.style.height = '';
        } else {
          el.setAttribute('data-full', 'true');
          el.style.height = "".concat(this._option.viewport.clientHeight, "px");
        }
      }
    }, {
      key: "_changePaginator",
      value: function _changePaginator(oldDot, newDot) {
        var _this = this;

        if (this._option.paginator === 'none') return;

        this._dotList.forEach(function (d, i, arr) {
          if (newDot === i) {
            d.classList.add("".concat(classNamePrefix, "-paginator-dot-active"));
            d.style.backgroundColor = _this._option.dotActiveColor;
          } else if (oldDot === i) {
            d.classList.remove("".concat(classNamePrefix, "-paginator-dot-active"));
            d.style.backgroundColor = _this._option.dotColor;
          }
        });
      }
    }, {
      key: "_addDot",
      value: function _addDot() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

        this._initDot(index);

        this._dotList.forEach(function (d, i, arr) {
          if (i > index) {
            d.setAttribute('slide-index', Number(d.getAttribute('slide-index')) + 1);
          }
        });

        this._initPaginatorTop();
      }
    }, {
      key: "_removeDot",
      value: function _removeDot() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var dot = this._dotList[index];

        this._paginator.removeChild(dot);

        this._dotList.forEach(function (d, i, arr) {
          if (i > index) d.setAttribute('slide-index', i - 1);
        });

        this._dotList.splice(index, 1);

        this._initPaginatorTop();
      }
    }, {
      key: "_initOption",
      value: function _initOption() {
        var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this._currentSlide = 0;
        this._dotList = null;
        this._isTouching = false;
        this._lastAnimeTime = 0;
        this._paginator = null;
        this._scrollInSlide = 0;
        this._touchStartY = 0;
        this._wrapper = null;
        this._option = _objectSpread2(_objectSpread2({}, defaultOpt), opt);

        if (!Array.isArray(this._option.slides)) {
          this._option.slides = Array.from(this._option.slides);
        }

        if (this._option.paginator !== 'none' && this._option.paginator !== 'left' && this._option.paginator !== 'right') {
          this._option.paginator = 'none';
        }
      }
    }, {
      key: "_initDot",
      value: function _initDot() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var dot = document.createElement('div');
        dot.setAttribute('slide-index', index);
        dot.classList.add("".concat(classNamePrefix, "-paginator-dot"));
        dot.style.width = '0.75rem';
        dot.style.height = '0.75rem';
        dot.style.backgroundColor = this._option.dotColor;
        dot.style.margin = '0.5rem auto';
        dot.style.borderRadius = '50%';
        dot.style.transition = 'all 0.5s ease 0s';
        dot.style.cursor = 'pointer';

        if (index === this._currentSlide) {
          dot.classList.add("".concat(classNamePrefix, "-paginator-dot-active"));
          dot.style.backgroundColor = this._option.dotActiveColor;
        }

        insert(this._dotList, index, dot);
        moveEl(dot, this._paginator, index);
      }
    }, {
      key: "_initDotList",
      value: function _initDotList() {
        this._dotList = [];

        for (var i = 0, len = this._option.slides.length; i < len; i++) {
          this._initDot(i);
        }
      }
    }, {
      key: "_initFullHeight",
      value: function _initFullHeight(el) {
        el.style.height = "".concat(this._option.viewport.clientHeight, "px");
      }
    }, {
      key: "_initGlobalEvent",
      value: function _initGlobalEvent() {
        var _this2 = this;

        if (this._option.autoHeight) {
          window.addEventListener('resize', function (e) {
            _this2._handleResize(e);

            _this2._wrapper.style.transitionDuration = '0s';

            _this2.scrollTo(_this2._currentSlide);

            setTimeout(function () {
              _this2._wrapper.style.transitionDuration = "".concat(_this2._option.duration, "ms");
            }, 1);
          });
        }

        if (this._option.keyboard) {
          document.addEventListener('keydown', function (e) {
            _this2._handleKeyboard(e);
          });
        }
      }
    }, {
      key: "_initPaginator",
      value: function _initPaginator() {
        var _this3 = this;

        this._paginator = document.createElement('div');

        this._paginator.classList.add("".concat(classNamePrefix, "-paginator"));

        this._paginator.style.position = 'absolute';
        this._paginator.style[this._option.paginator] = "".concat(this._wrapper.clientWidth * 0.05, "px");

        this._paginator.addEventListener('click', function (e) {
          _this3._handleDotClick(e);
        });

        this._initDotList();

        this._option.viewport.appendChild(this._paginator);

        this._paginator.style.top = '50%';

        this._initPaginatorTop();
      }
    }, {
      key: "_initPaginatorTop",
      value: function _initPaginatorTop() {
        this._paginator.style.marginTop = "".concat(-this._paginator.clientHeight / 2, "px");
      }
    }, {
      key: "_initSlide",
      value: function _initSlide(el) {
        var i = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        el.classList.add("".concat(classNamePrefix, "-slide"));
        el.style.overflow = 'hidden';

        if (el.getAttribute('data-full') === 'true') {
          this._initFullHeight(el);
        }

        moveEl(el, this._wrapper, i);
      }
    }, {
      key: "_initSlides",
      value: function _initSlides() {
        var _this4 = this;

        this._option.slides.forEach(function (s) {
          _this4._initSlide(s);
        });
      }
    }, {
      key: "_isFirstSlide",
      value: function _isFirstSlide() {
        return this._currentSlide === 0;
      }
    }, {
      key: "_isLastSlide",
      value: function _isLastSlide() {
        return this._currentSlide === this._option.slides.length - 1;
      }
    }, {
      key: "_isSlideOnTop",
      value: function _isSlideOnTop() {
        return this.top === this._prevSlidesHeight();
      }
    }, {
      key: "_isSlideMutiPages",
      value: function _isSlideMutiPages(i) {
        return this._option.slides[i].clientHeight > this._option.viewport.clientHeight;
      }
    }, {
      key: "_initView",
      value: function _initView() {
        var _this5 = this;

        var viewport = this._option.viewport || document.body;
        viewport.classList.add("".concat(classNamePrefix, "-viewport"));
        viewport.style.position = 'relative';

        if (viewport.style.height === '') {
          viewport.style.height = '100%';
        }

        viewport.style.overflow = 'hidden';
        viewport.addEventListener('wheel', function (e) {
          _this5._handleMouseWheel(e);
        });
        viewport.addEventListener('touchstart', function (e) {
          _this5._handleTouchStart(e);
        });
        this._wrapper = document.createElement('div');

        this._wrapper.classList.add("".concat(classNamePrefix, "-wrapper"));

        this._wrapper.style.position = 'relative';
        this._wrapper.style.top = '0px';
        this._wrapper.style.transition = "all ".concat(this._option.duration, "ms ease 0s");
        viewport.appendChild(this._wrapper);

        this._initSlides();

        if (this._option.paginator !== 'none') {
          this._initPaginator();
        }
      }
    }, {
      key: "_prevSlidesHeight",
      value: function _prevSlidesHeight() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._currentSlide;
        var heights = 0;

        this._option.slides.forEach(function (s, i, arr) {
          if (index <= i) return;
          heights += s.clientHeight;
        });

        return heights;
      }
    }, {
      key: "_setCurrentSlide",
      value: function _setCurrentSlide(val) {
        if (val === this._currentSlide) return;
        this._currentSlide = val;

        if (typeof this._option.onScroll === 'function') {
          this._option.onScroll(this._currentSlide);
        }
      }
    }, {
      key: "_handleDotClick",
      value: function _handleDotClick(e) {
        e.preventDefault();
        var index = Number(e.target.getAttribute('slide-index')) || 0;
        if (index === this._currentSlide) return;
        this.scrollTo(index);
      }
    }, {
      key: "_handleKeyboard",
      value: function _handleKeyboard(e) {
        switch (e.key) {
          case 'ArrowDown':
          case 'PageDown':
            this.scrollDown();
            break;

          case 'ArrowUp':
          case 'PageUp':
            this.scrollUp();
            break;
        }
      }
    }, {
      key: "_handleMouseWheel",
      value: function _handleMouseWheel(e) {
        e.preventDefault();
        var now = new Date().getTime();

        if (now - this._lastAnimeTime < this._option.idleTime + this._option.duration) {
          return;
        }

        var delta = e.wheelDelta || -e.detail;

        if (delta < 0) {
          this.scrollDown();
        } else {
          this.scrollUp();
        }

        this._lastAnimeTime = now;
      }
    }, {
      key: "_handleResize",
      value: function _handleResize(e) {
        this._initSlides();
      }
    }, {
      key: "_handleTouchMove",
      value: function _handleTouchMove(e) {
        e.preventDefault();
        if (!this._isTouching) return;
        var now = new Date().getTime();

        if (now - this._lastAnimeTime < this._option.idleTime + this._option.duration) {
          return;
        }

        if (e.touches && e.touches.length) {
          var delta = this._touchStartY - e.touches[0].pageY;
          if (Math.abs(delta) < 50) return;

          if (delta < 0) {
            this.scrollDown();
          } else {
            this.scrollUp();
          }

          e.target.removeEventListener('touchmove', this._handleTouchMove);
          this._lastAnimeTime = now;
        }

        this._touchStartY = 0;
        this._isTouching = false;
      }
    }, {
      key: "_handleTouchStart",
      value: function _handleTouchStart(e) {
        var _this6 = this;

        if (e.touches && e.touches.length) {
          this._isTouching = true;
          this._touchStartY = e.touches[0].pageY;

          this._option.viewport.addEventListener('touchmove', function (e) {
            _this6._handleTouchMove(e);
          });
        }
      }
    }, {
      key: "top",
      get: function get() {
        if (!this._wrapper || !this._wrapper.style.transform) return 0;
        return parseFloat(this._wrapper.style.transform.split('translateY(')[1].split(')')[0]);
      }
    }]);

    return Scroll;
  }();

  function insert(arr, index, el) {
    if (index >= arr.length) {
      arr.push(el);
    } else {
      arr.splice(index, 0, el);
    }
  }

  function moveEl(el, to) {
    var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var childList = to.children;

    if (i === null || i === childList.length) {
      to.appendChild(el);
    } else {
      to.insertBefore(el, childList[i]);
    }
  }

  function translateY(el, y) {
    el.style.transform = "translateY(".concat(y, "px)");
  }

  return Scroll;

})));
