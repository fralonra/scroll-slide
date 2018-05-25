const currentSlide = Symbol('currentSlide');
const doc = Symbol('doc');
const dotList = Symbol('dotList');
const duration = Symbol('duration');
const handleDotClick = Symbol('handleDotClick');
const handleKeyboard = Symbol('handleKeyboard');
const handleMouseWheel = Symbol('handleMouseWheel');
const handleResize = Symbol('handleResize');
const handleTouchMove = Symbol('handleTouchMove');
const handleTouchStart = Symbol('handleTouchStart');
const isTouching = Symbol('isTouching');
const lastAniTime = Symbol('lastAniTime');
const option = Symbol('option');
const paginator = Symbol('paginator');
const scrollInSlide = Symbol('scrollInSlide');
const touchStartY = Symbol('touchStartY');
const win = Symbol('win');
const wrapper = Symbol('wrapper');

const defaultDuration = 1000;
const classNamePrefix = 'scroll-slide';

class Scroll {
  constructor (opt = {}) {
    this._initOption(opt);
    this._initView();
    this._initGlobalEvent();
  }

  // PUBLIC
  add (el, index = -1) {
    const self = this;
    const oldSlides = self[option].slides;
    const newSlides = [];
    if (index < 0 || index > oldSlides.length) index = oldSlides.length;

    self._initSlide(el, index);

    self[option].slides = insert(self[option].slides, index, el);
    if (index <= self[currentSlide]) {
      const top = self._prevSlidesHeight(++self[currentSlide]);
      self[wrapper].style.top = `${-top}px`;
    }

    if (self[option].paginator !== 'none') {
      self._addDot(index);
      if (index <= self[currentSlide]) { self._changePaginator(self[currentSlide] - 1, self[currentSlide]); }
    }
  }

  current () {
    return this[currentSlide];
  }

  remove (index) {
    if (index >= this[option].slides.length - 1) return;

    if (index === this[currentSlide]) {
      if (index === this[option].slides.length - 1) { this.scrollTo(0); }
    }

    if (index < this[currentSlide]) {
      this.scrollTo(this[currentSlide] - 1);
    }

    if (this[option].paginator !== 'none') {
      this._removeDot(index);
      if (index <= this[currentSlide]) { this._changePaginator(this[currentSlide] - 1, this[currentSlide]); }
    }

    this[wrapper].removeChild(this[option].slides[index]);
    this[option].slides = this[option].slides.filter((s, i, arr) => i !== index);
  }

  scrollDown () {
    const self = this;

    const slides = self[option].slides;
    if (self._isLastSlide() && !self[option].loop) { return; }

    const nextSlide = self._isLastSlide() ?
      0 : self[currentSlide] + 1;
    const multiPages = self._isSlideMutiPages(self[currentSlide]);
    const top = strToNum(self[wrapper].style.top);
    const newTopDiff = !multiPages ?
      slides[self[currentSlide]].clientHeight :
      (slides[self[currentSlide]].clientHeight - self[scrollInSlide] > self[option].viewport.clientHeight ?
        self[option].viewport.clientHeight :
        slides[self[currentSlide]].clientHeight - self[scrollInSlide]);

    const canMultiScrollToNext = multiPages && self[scrollInSlide] + newTopDiff === slides[self[currentSlide]].clientHeight;
    self[wrapper].style.top =
      ((self._isLastSlide() && !multiPages) ||
      (self._isLastSlide() && canMultiScrollToNext)) ?
        '0px' : `${top - newTopDiff}px`;

    if (!multiPages || canMultiScrollToNext) {
      self._changePaginator(self[currentSlide], nextSlide);
      self._setCurrentSlide(nextSlide);
      if (self[scrollInSlide] !== 0) self[scrollInSlide] = 0;
    } else if (multiPages) {
      self[scrollInSlide] += newTopDiff;
    }
  }

  scrollTo (index = 0) {
    const length = this[option].slides.length - 1;
    if (index < 0) index = length;
    else if (index > length) index = 0;
    const top = index === 0 ? 0 : this._prevSlidesHeight(index);
    this[wrapper].style.top = `${-top}px`;
    if (this[currentSlide] !== index) { this._changePaginator(this[currentSlide], index); }

    const callback = index !== this[currentSlide];
    this._setCurrentSlide(index, callback);
    if (this[scrollInSlide] !== 0) this[scrollInSlide] = 0;
  }

  scrollUp () {
    const self = this;

    if (self._isFirstSlide() && !self[option].loop) { return; }

    const slides = self[option].slides;
    const lastSlide = self._isFirstSlide() ?
      slides.length - 1 : self[currentSlide] - 1;
    const multiPages = self._isSlideMutiPages(self[currentSlide]);
    const top = strToNum(self[wrapper].style.top);
    self[wrapper].style.top =
      self._isFirstSlide() ?
        `${slides[slides.length - 1].clientHeight - self[wrapper].clientHeight}px` :
        (self[scrollInSlide] === 0 ?
          `${top + slides[lastSlide].clientHeight}px` :
          `${top + self[scrollInSlide]}px`);

    if (self[scrollInSlide] === 0) {
      self._changePaginator(self[currentSlide], lastSlide);
      self._setCurrentSlide(lastSlide);
    } else {
      self[scrollInSlide] = 0;
    }
  }

  toggleFull (el) {
    if (el.getAttribute('full') === 'true') {
      el.removeAttribute('full');
      el.style.height = '';
    } else {
      el.setAttribute('full', 'true');
      el.style.height = `${this[option].viewport.clientHeight}px`;
    }
  }

  // PRIVATE
  _changePaginator (oldDot, newDot) {
    const self = this;
    if (self[option].paginator === 'none') return;
    self[dotList].forEach((d, i, arr) => {
      if (newDot === i) {
        d.classList.add(`${classNamePrefix}-paginator-dot-active`);
        d.style.background = self[option].dotActiveColor;
      } else if (oldDot === i) {
        d.classList.remove(`${classNamePrefix}-paginator-dot-active`);
        d.style.background = self[option].dotColor;
      }
    });
  }

  _addDot (index = 0) {
    this._initDot(index);

    this[dotList].forEach((d, i, arr) => {
      if (i > index) d.setAttribute('index', Number(d.getAttribute('index')) + 1);
    });
    this._initPaginatorTop();
  }

  _removeDot (index = 0) {
    const dot = this[dotList][index];
    this[paginator].removeChild(dot);
    this[dotList].forEach((d, i, arr) => {
      if (i > index) d.setAttribute('index', i - 1);
    });
    this[dotList].splice(index, 1);
    this._initPaginatorTop();
  }

  _initOption (opt = {}) {
    const defaultOpt = {
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

  _initDot (index = 0) {
    const dot = this[doc].createElement('div');
    dot.setAttribute('index', index);
    dot.classList.add(`${classNamePrefix}-paginator-dot`);
    dot.style.width = '0.75rem';
    dot.style.height = '0.75rem';
    dot.style.background = this[option].dotColor;
    dot.style.margin = '0.5rem auto';
    dot.style.borderRadius = '50%';
    dot.style.transition = 'all 0.5s ease 0s';
    dot.style.cursor = 'pointer';

    if (index === this[currentSlide]) {
      dot.classList.add(`${classNamePrefix}-paginator-dot-active`);
      dot.style.background = this[option].dotActiveColor;
    }

    dot.addEventListener('click', (e) => {
      this[handleDotClick](e);
    });

    this[dotList] = insert(this[dotList], index, dot);
    moveEl(dot, this[paginator], index);
  }

  _initDotList () {
    this[dotList] = [];
    this[option].slides.forEach((s, i, arr) => {
      this._initDot(i);
    });
  }

  _initFullHeight (el) {
    el.style.height = `${this[option].viewport.clientHeight}px`;
  }

  _initGlobalEvent () {
    const self = this;

    if (self[option].autoHeight) {
      window.addEventListener('resize', (e) => {
        self[handleResize](e);

        self[wrapper].style.transitionDuration = '0s';
        self.scrollTo(self[currentSlide]);
        setTimeout(() => {
          self[wrapper].style.transitionDuration = genDurationText(String(self[duration]));
        }, 1);
      });
    }

    if (self[option].keyboard) {
      self[doc].addEventListener('keydown', (e) => {
        self[handleKeyboard](e);
      });
    }
  }

  _initPaginator (pos = this[option].paginator) {
    const p = this[paginator];
    p.classList.add(`${classNamePrefix}-paginator`);
    p.style.position = 'absolute';
    p.style[pos] = `${this[wrapper].clientWidth * 0.05}px`;

    this._initDotList();

    this[option].viewport.appendChild(p);
    p.style.top = '50%';
    this._initPaginatorTop();
  }

  _initPaginatorTop () {
    const top = this[paginator].clientHeight / 2;
    this[paginator].style.marginTop = `${-top}px`;
  }

  _initSlide (el, i = null) {
    el.classList.add(`${classNamePrefix}-slide`);
    el.style.overflow = 'hidden';
    if (el.getAttribute('full') === 'true') {
      this._initFullHeight(el);
    }
    moveEl(el, this[wrapper], i);
  }

  _initSlides () {
    this[option].slides = Array.from(this[option].slides);
    const slides = this[option].slides;
    slides.forEach(s => {
      this._initSlide(s);
    });
    moveEl(this[wrapper], this[option].viewport);
  }

  _isFirstSlide () {
    return this[currentSlide] === 0;
  }

  _isLastSlide () {
    return this[currentSlide] === this[option].slides.length - 1;
  }

  _isSlideOnTop () {
    return strToNum(this[wrapper].style.top) === this._prevSlidesHeight();
  }

  _isSlideMutiPages (i) {
    return this[option].slides[i].clientHeight > this[option].viewport.clientHeight;
  }

  _initView () {
    const self = this;

    let viewport = self[option].viewport;
    if (viewport === null) {
      viewport = self[doc].getElementByTagName('body')[0];
    }
    viewport.classList.add(`${classNamePrefix}-viewport`);
    viewport.style.position = 'relative';
    if (viewport.style.height === '') { viewport.style.height = '100%'; }
    viewport.style.overflow = 'hidden';
    viewport.addEventListener('DOMMouseScroll', (e) => {
      self[handleMouseWheel](e);
    });
    viewport.addEventListener('mousewheel', (e) => {
      self[handleMouseWheel](e);
    });
    viewport.addEventListener('touchstart', (e) => {
      self[handleTouchStart](e);
    });

    self[wrapper] = self[doc].createElement('div');
    self[wrapper].classList.add(`${classNamePrefix}-wrapper`);
    self[wrapper].style.position = 'relative';
    self[wrapper].style.top = '0px';

    const durationText = genDurationText(String(self[duration]));
    self[wrapper].style.transition = `all ${durationText} ease 0s`;

    self._initSlides();

    if (self[option].paginator !== 'none' &&
        self[option].paginator !== 'left' &&
        self[option].paginator !== 'right') { self[option].paginator = 'none'; }
    if (self[option].paginator !== 'none') {
      viewport.style.position = 'relative';
      self[paginator] = this[doc].createElement('div');
      self._initPaginator();
    }
  }

  _prevSlidesHeight (index = this[currentSlide]) {
    const self = this;
    let heights = 0;
    self[option].slides.forEach((s, i, arr) => {
      if (index <= i) return;
      heights += s.clientHeight;
    });
    return heights;
  }

  _setCurrentSlide (val, callback = true) {
    this[currentSlide] = val;
    if (callback && typeof this[option].onScroll === 'function') {
      this[option].onScroll(this[currentSlide]);
    }
  }

  [handleDotClick] (e) {
    e.preventDefault();

    const index = Number(e.target.getAttribute('index')) || 0;
    if (index === this[currentSlide]) return;

    this.scrollTo(index);
  }

  [handleKeyboard] (e) {
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
    }
  }

  [handleMouseWheel] (e) {
    e.preventDefault();

    const self = this;
    const now = new Date().getTime();
    if (now - self[lastAniTime] < self[option].idleTime + self[duration]) { return; }

    const delta = e.wheelDelta || -e.detail;
    if (delta < 0) {
      self.scrollDown();
    } else {
      self.scrollUp();
    }

    self[lastAniTime] = now;
  }

  [handleResize] (e) {
    this._initSlides();
  }

  [handleTouchMove] (e) {
    e.preventDefault();

    const self = this;
    if (!self[isTouching]) return;

    const now = new Date().getTime();
    if (now - self[lastAniTime] < self[option].idleTime + self[duration]) { return; }

    if (e.touches && e.touches.length) {
      const delta = self[touchStartY] - e.touches[0].pageY;
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

  [handleTouchStart] (e) {
    e.preventDefault();

    const self = this;
    if (e.touches && e.touches.length) {
      self[isTouching] = true;
      self[touchStartY] = e.touches[0].pageY;
      self[option].viewport.addEventListener('touchmove', (e) => {
        self[handleTouchMove](e);
      });
    }
  }
}

function genDurationText (duration) {
  return duration.match(/^\d+$/) ?
    `${duration}ms` :
    `${defaultDuration}ms`;
}

function insert (arr, index, el) {
  const newArr = [];
  arr.forEach((a, i, array) => {
    if (i === index) newArr.push(el);
    newArr.push(a);
  });
  if (index === arr.length) newArr.push(el);
  return newArr;
}

function moveEl (el, to, i = null) {
  const childList = to.hasChildNodes() ? to.childNodes : [];

  if (i === null || i === childList.length) { return to.appendChild(el); }

  return to.insertBefore(el, childList[i]);
}

function strToNum (str) {
  return Number(str.split(/[^\d-]+/)[0]);
}

module.exports = Scroll;
