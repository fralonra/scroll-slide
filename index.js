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
    const oldSlides = self._option.slides;
    if (index < 0 || index > oldSlides.length) index = oldSlides.length;

    self._initSlide(el, index);

    self._option.slides = insert(self._option.slides, index, el);
    if (index <= self._currentSlide) {
      const top = self._prevSlidesHeight(++self._currentSlide);
      self._wrapper.style.top = `${-top}px`;
    }

    if (self._option.paginator !== 'none') {
      self._addDot(index);
      if (index <= self._currentSlide) { self._changePaginator(self._currentSlide - 1, self._currentSlide); }
    }
  }

  current () {
    return this._currentSlide;
  }

  remove (index) {
    if (index >= this._option.slides.length - 1) return;

    if (index === this._currentSlide) {
      if (index === this._option.slides.length - 1) { this.scrollTo(0); }
    }

    if (index < this._currentSlide) {
      this.scrollTo(this._currentSlide - 1);
    }

    if (this._option.paginator !== 'none') {
      this._removeDot(index);
      if (index <= this._currentSlide) { this._changePaginator(this._currentSlide - 1, this._currentSlide); }
    }

    this._wrapper.removeChild(this._option.slides[index]);
    this._option.slides = this._option.slides.filter((s, i, arr) => i !== index);
  }

  scrollDown () {
    const self = this;

    const slides = self._option.slides;
    if (self._isLastSlide() && !self._option.loop) { return; }

    const nextSlide = self._isLastSlide() ?
      0 : self._currentSlide + 1;
    const multiPages = self._isSlideMutiPages(self._currentSlide);
    const top = strToNum(self._wrapper.style.top);
    const newTopDiff = !multiPages ?
      slides[self._currentSlide].clientHeight :
      (slides[self._currentSlide].clientHeight - self._scrollInSlide > self._option.viewport.clientHeight ?
        self._option.viewport.clientHeight :
        slides[self._currentSlide].clientHeight - self._scrollInSlide);

    const canMultiScrollToNext = multiPages && self._scrollInSlide + newTopDiff === slides[self._currentSlide].clientHeight;
    self._wrapper.style.top =
      ((self._isLastSlide() && !multiPages) ||
      (self._isLastSlide() && canMultiScrollToNext)) ?
        '0px' : `${top - newTopDiff}px`;

    if (!multiPages || canMultiScrollToNext) {
      self._changePaginator(self._currentSlide, nextSlide);
      self._setCurrentSlide(nextSlide);
      if (self._scrollInSlide !== 0) self._scrollInSlide = 0;
    } else if (multiPages) {
      self._scrollInSlide += newTopDiff;
    }
  }

  scrollTo (index = 0) {
    const length = this._option.slides.length - 1;
    if (index < 0) index = length;
    else if (index > length) index = 0;
    const top = index === 0 ? 0 : this._prevSlidesHeight(index);
    this._wrapper.style.top = `${-top}px`;
    if (this._currentSlide !== index) { this._changePaginator(this._currentSlide, index); }

    const callback = index !== this._currentSlide;
    this._setCurrentSlide(index, callback);
    if (this._scrollInSlide !== 0) this._scrollInSlide = 0;
  }

  scrollUp () {
    const self = this;

    if (self._isFirstSlide() && !self._option.loop) { return; }

    const slides = self._option.slides;
    const lastSlide = self._isFirstSlide() ?
      slides.length - 1 : self._currentSlide - 1;
    const top = strToNum(self._wrapper.style.top);
    self._wrapper.style.top =
      self._isFirstSlide() ?
        `${slides[slides.length - 1].clientHeight - self._wrapper.clientHeight}px` :
        (self._scrollInSlide === 0 ?
          `${top + slides[lastSlide].clientHeight}px` :
          `${top + self._scrollInSlide}px`);

    if (self._scrollInSlide === 0) {
      self._changePaginator(self._currentSlide, lastSlide);
      self._setCurrentSlide(lastSlide);
    } else {
      self._scrollInSlide = 0;
    }
  }

  toggleFull (el) {
    if (el.getAttribute('data-full') === 'true') {
      el.removeAttribute('data-full');
      el.style.height = '';
    } else {
      el.setAttribute('data-full', 'true');
      el.style.height = `${this._option.viewport.clientHeight}px`;
    }
  }

  // PRIVATE
  _changePaginator (oldDot, newDot) {
    const self = this;
    if (self._option.paginator === 'none') return;
    self._dotList.forEach((d, i, arr) => {
      if (newDot === i) {
        d.classList.add(`${classNamePrefix}-paginator-dot-active`);
        d.style.background = self._option.dotActiveColor;
      } else if (oldDot === i) {
        d.classList.remove(`${classNamePrefix}-paginator-dot-active`);
        d.style.background = self._option.dotColor;
      }
    });
  }

  _addDot (index = 0) {
    this._initDot(index);

    this._dotList.forEach((d, i, arr) => {
      if (i > index) d.setAttribute('index', Number(d.getAttribute('index')) + 1);
    });
    this._initPaginatorTop();
  }

  _removeDot (index = 0) {
    const dot = this._dotList[index];
    this._paginator.removeChild(dot);
    this._dotList.forEach((d, i, arr) => {
      if (i > index) d.setAttribute('index', i - 1);
    });
    this._dotList.splice(index, 1);
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
    this._currentSlide = 0;
    this._doc = global.document;
    this._dotList = null;
    this._isTouching = false;
    this._lastAniTime = 0;
    this._paginator = null;
    this._scrollInSlide = 0;
    this._touchStartY = 0;
    this._win = global;
    this._wrapper = null;

    this._option = {};
    Object.keys(defaultOpt).forEach(k => {
      if (opt.hasOwnProperty(k)) {
        this._option[k] = opt[k];
      } else {
        this._option[k] = defaultOpt[k];
      }
    });
    this._duration = this._option.duration;
  }

  _initDot (index = 0) {
    const dot = this._doc.createElement('div');
    dot.setAttribute('index', index);
    dot.classList.add(`${classNamePrefix}-paginator-dot`);
    dot.style.width = '0.75rem';
    dot.style.height = '0.75rem';
    dot.style.background = this._option.dotColor;
    dot.style.margin = '0.5rem auto';
    dot.style.borderRadius = '50%';
    dot.style.transition = 'all 0.5s ease 0s';
    dot.style.cursor = 'pointer';

    if (index === this._currentSlide) {
      dot.classList.add(`${classNamePrefix}-paginator-dot-active`);
      dot.style.background = this._option.dotActiveColor;
    }

    dot.addEventListener('click', (e) => {
      this._handleDotClick(e);
    });

    this._dotList = insert(this._dotList, index, dot);
    moveEl(dot, this._paginator, index);
  }

  _initDotList () {
    this._dotList = [];
    this._option.slides.forEach((s, i, arr) => {
      this._initDot(i);
    });
  }

  _initFullHeight (el) {
    el.style.height = `${this._option.viewport.clientHeight}px`;
  }

  _initGlobalEvent () {
    const self = this;

    if (self._option.autoHeight) {
      window.addEventListener('resize', (e) => {
        self._handleResize(e);

        self._wrapper.style.transitionDuration = '0s';
        self.scrollTo(self._currentSlide);
        setTimeout(() => {
          self._wrapper.style.transitionDuration = genDurationText(String(self._duration));
        }, 1);
      });
    }

    if (self._option.keyboard) {
      self._doc.addEventListener('keydown', (e) => {
        self._handleKeyboard(e);
      });
    }
  }

  _initPaginator (pos = this._option.paginator) {
    const p = this._paginator;
    p.classList.add(`${classNamePrefix}-paginator`);
    p.style.position = 'absolute';
    p.style[pos] = `${this._wrapper.clientWidth * 0.05}px`;

    this._initDotList();

    this._option.viewport.appendChild(p);
    p.style.top = '50%';
    this._initPaginatorTop();
  }

  _initPaginatorTop () {
    const top = this._paginator.clientHeight / 2;
    this._paginator.style.marginTop = `${-top}px`;
  }

  _initSlide (el, i = null) {
    el.classList.add(`${classNamePrefix}-slide`);
    el.style.overflow = 'hidden';
    if (el.getAttribute('data-full') === 'true') {
      this._initFullHeight(el);
    }
    moveEl(el, this._wrapper, i);
  }

  _initSlides () {
    this._option.slides = [].slice.call(this._option.slides);
    const slides = this._option.slides;
    slides.forEach(s => {
      this._initSlide(s);
    });
    moveEl(this._wrapper, this._option.viewport);
  }

  _isFirstSlide () {
    return this._currentSlide === 0;
  }

  _isLastSlide () {
    return this._currentSlide === this._option.slides.length - 1;
  }

  _isSlideOnTop () {
    return strToNum(this._wrapper.style.top) === this._prevSlidesHeight();
  }

  _isSlideMutiPages (i) {
    return this._option.slides[i].clientHeight > this._option.viewport.clientHeight;
  }

  _initView () {
    const self = this;

    let viewport = self._option.viewport;
    if (viewport === null) {
      viewport = self._doc.getElementByTagName('body')[0];
    }
    viewport.classList.add(`${classNamePrefix}-viewport`);
    viewport.style.position = 'relative';
    if (viewport.style.height === '') { viewport.style.height = '100%'; }
    viewport.style.overflow = 'hidden';
    viewport.addEventListener('DOMMouseScroll', (e) => {
      self._handleMouseWheel(e);
    });
    viewport.addEventListener('mousewheel', (e) => {
      self._handleMouseWheel(e);
    });
    viewport.addEventListener('touchstart', (e) => {
      self._handleTouchStart(e);
    });

    self._wrapper = self._doc.createElement('div');
    self._wrapper.classList.add(`${classNamePrefix}-wrapper`);
    self._wrapper.style.position = 'relative';
    self._wrapper.style.top = '0px';

    const durationText = genDurationText(String(self._duration));
    self._wrapper.style.transition = `all ${durationText} ease 0s`;

    self._initSlides();

    if (self._option.paginator !== 'none' &&
        self._option.paginator !== 'left' &&
        self._option.paginator !== 'right') { self._option.paginator = 'none'; }
    if (self._option.paginator !== 'none') {
      viewport.style.position = 'relative';
      self._paginator = this._doc.createElement('div');
      self._initPaginator();
    }
  }

  _prevSlidesHeight (index = this._currentSlide) {
    const self = this;
    let heights = 0;
    self._option.slides.forEach((s, i, arr) => {
      if (index <= i) return;
      heights += s.clientHeight;
    });
    return heights;
  }

  _setCurrentSlide (val, callback = true) {
    this._currentSlide = val;
    if (callback && typeof this._option.onScroll === 'function') {
      this._option.onScroll(this._currentSlide);
    }
  }

  _handleDotClick (e) {
    e.preventDefault();

    const index = Number(e.target.getAttribute('index')) || 0;
    if (index === this._currentSlide) return;

    this.scrollTo(index);
  }

  _handleKeyboard (e) {
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

  _handleMouseWheel (e) {
    e.preventDefault();

    const self = this;
    const now = new Date().getTime();
    if (now - self._lastAniTime < self._option.idleTime + self._duration) { return; }

    const delta = e.wheelDelta || -e.detail;
    if (delta < 0) {
      self.scrollDown();
    } else {
      self.scrollUp();
    }

    self._lastAniTime = now;
  }

  _handleResize (e) {
    this._initSlides();
  }

  _handleTouchMove (e) {
    e.preventDefault();

    const self = this;
    if (!self._isTouching) return;

    const now = new Date().getTime();
    if (now - self._lastAniTime < self._option.idleTime + self._duration) { return; }

    if (e.touches && e.touches.length) {
      const delta = self._touchStartY - e.touches[0].pageY;
      if (Math.abs(delta) < 50) return;
      if (delta < 0) {
        self.scrollDown();
      } else {
        self.scrollUp();
      }
      e.target.removeEventListener('touchmove', self._handleTouchMove);

      self._lastAniTime = now;
    }

    self._touchStartY = 0;
    self._isTouching = false;
  }

  _handleTouchStart (e) {
    e.preventDefault();

    const self = this;
    if (e.touches && e.touches.length) {
      self._isTouching = true;
      self._touchStartY = e.touches[0].pageY;
      self._option.viewport.addEventListener('touchmove', (e) => {
        self._handleTouchMove(e);
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
