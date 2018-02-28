const aniDuration = Symbol('aniDuration');
const currentSlide = Symbol('currentSlide');
const doc = Symbol('doc');
const handleMouseWheel = Symbol('handleMouseWheel');
const lastAniTime = Symbol('lastAniTime');
const option = Symbol('option');
const scrollInSlide = Symbol('scrollInSlide');
const win = Symbol('win');
const wrapper = Symbol('wrapper');

const defaultAniDuration = 1000;

class Scroll {
  constructor (opt = {}) {
    const self = this;

    self[option] = {
      aniDuration: `${defaultAniDuration}ms`,
      viewport: null,
      direction: 'vertical',
      idleTime: 200,
      loop: true,
      paginator: false,
      slides: []
    };
    self[aniDuration] = defaultAniDuration;
    self[currentSlide] = 0;
    self[doc] = null;
    self[lastAniTime] = 0;
    self[scrollInSlide] = 0;
    self[win] = null;
    self[wrapper] = null;

    Object.keys(opt).forEach(function (k) {
      self[option][k] = opt[k];
    });

    const slides = self[option].slides;
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
    viewport.style.position = 'relative';
    viewport.style.height = '100%';
    viewport.style.overflow = 'hidden';
    viewport.addEventListener('DOMMouseScroll', (e) => {
      self[handleMouseWheel](e);
    });
    viewport.addEventListener('mousewheel', (e) => {
      self[handleMouseWheel](e);
    });

    self[wrapper] = self[doc].createElement('div');
    self[wrapper].style.display = 'flex';
    self[wrapper].style['flex-flow'] = self[option].direction === 'horizontal' ?
      'row' : 'column';
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
      if (s.getAttribute('full') === 'true') {
        const originHeight = s.clientHeight;
        s.style.flex = `0 0 ${Math.ceil(originHeight / viewport.clientHeight) * viewport.clientHeight}`;
      }
      moveEl(s, self[wrapper]);
    });
    moveEl(self[wrapper], viewport);
  }

  // PUBLIC
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
      el.style.flex = '';
    } else {
      el.setAttribute('full', 'true');
      el.style.flex = `0 0 ${this[option].viewport.clientHeight}`;
    }
  }

  // PRIVATE
  _isFirstSlide () {
    return this[currentSlide] === 0;
  }

  _isLastSlide () {
    // console.log(this[currentSlide], this[option].slides.length);
    return this[currentSlide] === this[option].slides.length - 1;
  }

  _isSlideOnTop () {
    return strToNum(this[wrapper].style.top) === this._prevSlidesHeight();
  }

  _isSlideMutiPages (i) {
    return this[option].slides[i].clientHeight > this[option].viewport.clientHeight;
  }

  _prevSlidesHeight () {
    const self = this;
    let index = 0;
    return Array.from(self[option].slides).reduce((a, b) => {
      return index++ === 0 ?
        a.clientHeight :
        (self[currentSlide] > index - 1 ?
        a + b.clientHeight :
        a);
    });
  }

  [handleMouseWheel] (e) {
    const self = this;
    const now = new Date().getTime();
    if (now - self[lastAniTime] < self[option].idleTime + self[aniDuration]) {
			return e.preventDefault();
    }

    const delta = e.wheelDelta || -e.detail;
    if (delta < 0) {
      self.scrollDown();
    } else {
      self.scrollUp();
    }

    self[lastAniTime] = now;
  }
}

function moveEl (el, to) {
  to.appendChild(el);
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
