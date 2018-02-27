const aniDuration = Symbol('aniDuration');
const currentSection = Symbol('currentSection');
const doc = Symbol('doc');
const handleMouseWheel = Symbol('handleMouseWheel');
const lastAniTime = Symbol('lastAniTime');
const option = Symbol('option');
const win = Symbol('win');
const wrapper = Symbol('wrapper');

const defaultAniDuration = 1000;

class Scroll {
  constructor (opt = {}) {
    const self = this;

    self[option] = {
      aniDuration: `${defaultAniDuration}ms`,
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

    const sections = self[option].sections;
    if (sections.length < 2) throw Error('sections must be more than 2');
    sections.forEach(s => {
      if (s instanceof Element) {
      } else throw Error('section must be an instance of Element');
    });

    self[doc] = sections[0].ownerDocument;
    self[win] = self[doc].defaultView;

    let container = self[option].container;
    if (container === null) {
      container = self[doc].getElementByTagName('body')[0];
    }
    container.style.position = 'relative';
    container.style.height = '100%';
    container.style.overflow = 'hidden';
    container.addEventListener('DOMMouseScroll', (e) => {
      self[handleMouseWheel](e);
    });
    container.addEventListener('mousewheel', (e) => {
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
    self[wrapper].style.transition = `top ${duration} ease 0s`;
    self[aniDuration] = timeToMsNum(d);

    sections.forEach(s => {
      if (s.getAttribute('full')) {
        s.style.flex = `0 0 ${container.clientHeight}`;
      }
      moveEl(s, self[wrapper]);
    });
    moveEl(self[wrapper], container);
  }

  // PUBLIC
  scrollDown () {
    const self = this;

    const sections = self[option].sections;
    if (self[currentSection] === sections.length - 1 && !self[option].loop)
      return;

    const top = strToNum(self[wrapper].style.top);
    self[wrapper].style.top =
      self[currentSection] === sections.length - 1 ?
      0 :
      top - sections[self[currentSection]].clientHeight;

    if (++self[currentSection] > sections.length - 1) {
      self[currentSection] = 0;
    }
  }

  scrollUp () {
    const self = this;

    if (self[currentSection] === 0 && !self[option].loop)
      return;

    const sections = self[option].sections;
    const top = strToNum(self[wrapper].style.top);
    self[wrapper].style.top =
      self[currentSection] === 0 ?
      sections[sections.length - 1].clientHeight - self[wrapper].clientHeight :
      top + sections[self[currentSection] - 1].clientHeight;

    if (--self[currentSection] < 0) {
      self[currentSection] = sections.length - 1;
    }
  }

  // PRIVATE
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
