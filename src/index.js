const aniDuration = Symbol('aniDuration');
const currentSlide = Symbol('currentSlide');
const doc = Symbol('doc');
const handleKeyboard = Symbol('handleKeyboard');
const handleMouseWheel = Symbol('handleMouseWheel');
const handleTouchMove = Symbol('handleTouchMove');
const handleTouchStart = Symbol('handleTouchStart');
const isTouching = Symbol('isTouching');
const lastAniTime = Symbol('lastAniTime');
const option = Symbol('option');
const scrollInSlide = Symbol('scrollInSlide');
const touchStartY = Symbol('touchStartY');
const win = Symbol('win');
const wrapper = Symbol('wrapper');

const defaultAniDuration = 1000;
const classNamePrefix = 'scroll-slide';

class Scroll {
  constructor (opt = {}) {
    const self = this;

    self[option] = {
      aniDuration: `${defaultAniDuration}ms`,
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

    const slides = Array.from(self[option].slides);
    slides.forEach(s => {
      if (s instanceof Element) {
      } else throw Error('section must be an instance of Element');
    });

    self[doc] = slides[0].ownerDocument;
    self[win] = self[doc].defaultView;

    let viewport = self[option].viewport;
    if (viewport === null) {
      viewport = self[doc].getElementByTagName('body')[0];
    }
    viewport.classList.add(`${classNamePrefix}-viewport`);
    viewport.style.position = 'relative';
    viewport.style.height = '100%';
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
    if (self[option].keyboard) {
      self[doc].addEventListener('keydown', (e) => {
        self[handleKeyboard](e);
      });
    }

    self[wrapper] = self[doc].createElement('div');
    self[wrapper].classList.add(`${classNamePrefix}-wrapper`);
    self[wrapper].style.position = 'relative';
    self[wrapper].style.top = '0';

    const d = String(self[option].aniDuration);
    const duration = d.match(/^\d+s$/) ?
      d :
      d.match(/^\d+$/) ?
      `${d}s` :
      '1s';
    self[wrapper].style.transition = `all ${duration} ease 0s`;
    self[aniDuration] = timeToMsNum(d);

    slides.forEach(s => {
      self._initSlide(s);
    });
    moveEl(self[wrapper], viewport);
  }

  // PUBLIC
  add (el, index = -1) {
    const self = this;
    const oldSlides = self[option].slides;
    const newSlides = [];
    if (index < 0 || index > oldSlides.length) index = oldSlides.length;

    self._initSlide(el, index);
    oldSlides.forEach((s, i, arr) => {
      if (i === index) newSlides.push(el);
      newSlides.push(s);
    });
    if (index === oldSlides.length) newSlides.push(el);

    self[option].slides = newSlides;
  }

  remove (index) {
    this[wrapper].removeChild(this[option].slides[index]);
    this[option].slides = this[option].slides.filter((s, i, arr) => i !== index);

    if (index === this[currentSlide]) this.scrollDownTo(0);
  }

  scrollDown () {
    const self = this;

    const slides = self[option].slides;
    if (self._isLastSlide() && !self[option].loop)
      return;

    const nextSlide = self._isLastSlide() ?
      0 : self[currentSlide] + 1;
    const multiPages = self._isSlideMutiPages(self[currentSlide]);
    const top = strToNum(self[wrapper].style.top);
    const newTopDiff = !multiPages ?
      slides[self[currentSlide]].clientHeight :
      (slides[self[currentSlide]].getAttribute('full') === 'true' ?
      self[option].viewport.clientHeight :
      slides[self[currentSlide]].clientHeight - self[scrollInSlide]);

    self[wrapper].style.top =
      self._isLastSlide() ?
      0 : top - newTopDiff;

    if (!multiPages || (multiPages && self[scrollInSlide] + newTopDiff === slides[self[currentSlide]].clientHeight)) {
      self[currentSlide] = nextSlide;
      if (self[scrollInSlide] !== 0) self[scrollInSlide] = 0;
    } else if (multiPages) {
      self[scrollInSlide] += newTopDiff;
    }
  }

  scrollDownTo (index = 0) {
    const top = index === 0 ? 0 : this._prevSlidesHeight(index);
    this[wrapper].style.top = top;
    this[currentSlide] = index;
    if (this[scrollInSlide] !== 0) this[scrollInSlide] = 0;
  }

  scrollUp () {
    const self = this;

    if (self._isFirstSlide() && !self[option].loop)
      return;

    const slides = self[option].slides;
    const lastSlide = self._isFirstSlide() ?
      slides.length - 1 : self[currentSlide] - 1;
    const multiPages = self._isSlideMutiPages(self[currentSlide]);
    const top = strToNum(self[wrapper].style.top);
    self[wrapper].style.top =
      self._isFirstSlide() ?
      slides[slides.length - 1].clientHeight - self[wrapper].clientHeight :
      (self[scrollInSlide] === 0 ?
      top + slides[lastSlide].clientHeight :
      top + self[scrollInSlide]);

    if (self[scrollInSlide] === 0) {
      self[currentSlide] = lastSlide;
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
      el.style.height = this[option].viewport.clientHeight;
    }
  }

  // PRIVATE
  _initSlide (el, i = null) {
    el.classList.add(`${classNamePrefix}-slide`);
    if (el.getAttribute('full') === 'true') {
      const originHeight = el.clientHeight;
      el.style.height = Math.ceil(originHeight / this[option].viewport.clientHeight) * this[option].viewport.clientHeight;
    }
    moveEl(el, this[wrapper], i);
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

  _prevSlidesHeight (i = this[currentSlide]) {
    const self = this;
    let index = 0;
    return self[option].slides.reduce((a, b) => {
      return index++ === 0 ?
        a.clientHeight :
        (i > index - 1 ?
        a + b.clientHeight :
        a);
    });
  }

  [handleKeyboard] (e) {
    e.preventDefault();

    switch(e.key) {
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

  [handleMouseWheel] (e) {
    e.preventDefault();

    const self = this;
    const now = new Date().getTime();
    if (now - self[lastAniTime] < self[option].idleTime + self[aniDuration])
			return;

    const delta = e.wheelDelta || -e.detail;
    if (delta < 0) {
      self.scrollDown();
    } else {
      self.scrollUp();
    }

    self[lastAniTime] = now;
  }

  [handleTouchMove] (e) {
    e.preventDefault();

    const self = this;
    if (!self[isTouching]) return;

    const now = new Date().getTime();
    if (now - self[lastAniTime] < self[option].idleTime + self[aniDuration])
      return;

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

function moveEl (el, to, i = null) {
  const childList = to.hasChildNodes() ? to.childNodes : [];

  if (i === null || i === childList.length)
    return to.appendChild(el);

  return to.insertBefore(el, childList[i]);
}

function strToNum (str) {
  return Number(str.split(/[^\d-]+/)[0]);
}

function timeToMsNum (time) {
  return time.match(/^\d+ms$/) ?
    Number(time.split('ms')[0]) :
    time.match(/^\d+s$/) ?
    Number(time.split('s')[0]) * 1000 :
    defaultAniDuration;
}

// GLOBAL
function scroll (opt) {
  return new Scroll(opt);
}

global.Scroll = Scroll;
global.scroll = scroll;
