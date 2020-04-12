const classNamePrefix = 'scroll-slide'
const defaultOpt = {
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
}

class Scroll {
  constructor (opt = {}) {
    this._initOption(opt)
    this._initView()
    this._initGlobalEvent()
  }

  get top () {
    if (!this._wrapper || !this._wrapper.style.transform) return 0
    return parseFloat(
      this._wrapper.style.transform.split('translateY(')[1].split(')')[0]
    )
  }

  add (el, index = -1) {
    const oldSlides = this._option.slides
    if (index < 0 || index > oldSlides.length) index = oldSlides.length

    this._initSlide(el, index)

    insert(this._option.slides, index, el)
    if (index <= this._currentSlide) {
      translateY(this._wrapper, -this._prevSlidesHeight(++this._currentSlide))
    }

    if (this._option.paginator !== 'none') {
      this._addDot(index)
      if (index <= this._currentSlide) {
        this._changePaginator(this._currentSlide - 1, this._currentSlide)
      }
    }
  }

  current () {
    return this._currentSlide
  }

  remove (index) {
    if (index >= this._option.slides.length - 1) return

    if (index === this._currentSlide && index === this._option.slides.length - 1) {
      this.scrollTo(0)
    }

    if (index < this._currentSlide) {
      this.scrollTo(this._currentSlide - 1)
    }

    if (this._option.paginator !== 'none') {
      this._removeDot(index)
      if (index <= this._currentSlide) {
        this._changePaginator(this._currentSlide - 1, this._currentSlide)
      }
    }

    this._wrapper.removeChild(this._option.slides[index])
    this._option.slides = this._option.slides.filter((s, i, arr) => i !== index)
  }

  scrollDown () {
    const slides = this._option.slides
    if (this._isLastSlide() && !this._option.loop) return

    const nextSlide = this._isLastSlide() ? 0 : this._currentSlide + 1
    const multiPages = this._isSlideMutiPages(this._currentSlide)
    const newTopDiff = !multiPages
      ? slides[this._currentSlide].clientHeight
      : slides[this._currentSlide].clientHeight - this._scrollInSlide >
        this._option.viewport.clientHeight
        ? this._option.viewport.clientHeight
        : slides[this._currentSlide].clientHeight - this._scrollInSlide

    const canMultiScrollToNext =
      multiPages &&
      this._scrollInSlide + newTopDiff ===
        slides[this._currentSlide].clientHeight
    translateY(
      this._wrapper,
      (this._isLastSlide() && !multiPages) ||
        (this._isLastSlide() && canMultiScrollToNext)
        ? 0
        : this.top - newTopDiff
    )

    if (!multiPages || canMultiScrollToNext) {
      this._changePaginator(this._currentSlide, nextSlide)
      this._setCurrentSlide(nextSlide)
      if (this._scrollInSlide !== 0) this._scrollInSlide = 0
    } else if (multiPages) {
      this._scrollInSlide += newTopDiff
    }
  }

  scrollTo (index = 0) {
    const length = this._option.slides.length - 1
    if (index < 0) index = length
    else if (index > length) index = 0
    translateY(this._wrapper, index === 0 ? 0 : -this._prevSlidesHeight(index))
    if (this._currentSlide !== index) {
      this._changePaginator(this._currentSlide, index)
    }

    this._setCurrentSlide(index)
    if (this._scrollInSlide !== 0) this._scrollInSlide = 0
  }

  scrollUp () {
    if (this._isFirstSlide() && !this._option.loop) return

    const slides = this._option.slides
    const lastSlide = this._isFirstSlide()
      ? slides.length - 1
      : this._currentSlide - 1
    translateY(this._wrapper, this._isFirstSlide()
      ? slides[slides.length - 1].clientHeight - this._wrapper.clientHeight
      : this._scrollInSlide === 0
        ? this.top + slides[lastSlide].clientHeight
        : this.top + this._scrollInSlide)

    if (this._scrollInSlide === 0) {
      this._changePaginator(this._currentSlide, lastSlide)
      this._setCurrentSlide(lastSlide)
    } else {
      this._scrollInSlide = 0
    }
  }

  toggleFull (el) {
    if (el.getAttribute('data-full') === 'true') {
      el.removeAttribute('data-full')
      el.style.height = ''
    } else {
      el.setAttribute('data-full', 'true')
      el.style.height = `${this._option.viewport.clientHeight}px`
    }
  }

  _changePaginator (oldDot, newDot) {
    if (this._option.paginator === 'none') return
    this._dotList.forEach((d, i, arr) => {
      if (newDot === i) {
        d.classList.add(`${classNamePrefix}-paginator-dot-active`)
        d.style.backgroundColor = this._option.dotActiveColor
      } else if (oldDot === i) {
        d.classList.remove(`${classNamePrefix}-paginator-dot-active`)
        d.style.backgroundColor = this._option.dotColor
      }
    })
  }

  _addDot (index = 0) {
    this._initDot(index)

    this._dotList.forEach((d, i, arr) => {
      if (i > index) {
        d.setAttribute('slide-index', Number(d.getAttribute('slide-index')) + 1)
      }
    })
    this._initPaginatorTop()
  }

  _removeDot (index = 0) {
    const dot = this._dotList[index]
    this._paginator.removeChild(dot)
    this._dotList.forEach((d, i, arr) => {
      if (i > index) d.setAttribute('slide-index', i - 1)
    })
    this._dotList.splice(index, 1)
    this._initPaginatorTop()
  }

  _initOption (opt = {}) {
    this._currentSlide = 0
    this._dotList = null
    this._isTouching = false
    this._lastAnimeTime = 0
    this._paginator = null
    this._scrollInSlide = 0
    this._touchStartY = 0
    this._wrapper = null

    this._option = {
      ...defaultOpt,
      ...opt
    }
    if (!Array.isArray(this._option.slides)) {
      this._option.slides = Array.from(this._option.slides)
    }
    if (
      this._option.paginator !== 'none' &&
      this._option.paginator !== 'left' &&
      this._option.paginator !== 'right'
    ) {
      this._option.paginator = 'none'
    }
  }

  _initDot (index = 0) {
    const dot = document.createElement('div')
    dot.setAttribute('slide-index', index)
    dot.classList.add(`${classNamePrefix}-paginator-dot`)
    dot.style.width = '0.75rem'
    dot.style.height = '0.75rem'
    dot.style.backgroundColor = this._option.dotColor
    dot.style.margin = '0.5rem auto'
    dot.style.borderRadius = '50%'
    dot.style.transition = 'all 0.5s ease 0s'
    dot.style.cursor = 'pointer'

    if (index === this._currentSlide) {
      dot.classList.add(`${classNamePrefix}-paginator-dot-active`)
      dot.style.backgroundColor = this._option.dotActiveColor
    }

    insert(this._dotList, index, dot)
    moveEl(dot, this._paginator, index)
  }

  _initDotList () {
    this._dotList = []
    for (let i = 0, len = this._option.slides.length; i < len; i++) {
      this._initDot(i)
    }
  }

  _initFullHeight (el) {
    el.style.height = `${this._option.viewport.clientHeight}px`
  }

  _initGlobalEvent () {
    if (this._option.autoHeight) {
      window.addEventListener('resize', (e) => {
        this._handleResize(e)

        this._wrapper.style.transitionDuration = '0s'
        this.scrollTo(this._currentSlide)
        setTimeout(() => {
          this._wrapper.style.transitionDuration = `${this._option.duration}ms`
        }, 1)
      })
    }

    if (this._option.keyboard) {
      document.addEventListener('keydown', (e) => {
        this._handleKeyboard(e)
      })
    }
  }

  _initPaginator () {
    this._paginator = document.createElement('div')
    this._paginator.classList.add(`${classNamePrefix}-paginator`)
    this._paginator.style.position = 'absolute'
    this._paginator.style[this._option.paginator] = `${this._wrapper.clientWidth * 0.05}px`
    this._paginator.addEventListener('click', (e) => {
      this._handleDotClick(e)
    })
    
    this._initDotList()
    
    this._option.viewport.appendChild(this._paginator)
    this._paginator.style.top = '50%'
    this._initPaginatorTop()
  }

  _initPaginatorTop () {
    this._paginator.style.marginTop = `${-this._paginator.clientHeight / 2}px`
  }

  _initSlide (el, i = null) {
    el.classList.add(`${classNamePrefix}-slide`)
    el.style.overflow = 'hidden'
    if (el.getAttribute('data-full') === 'true') {
      this._initFullHeight(el)
    }
    moveEl(el, this._wrapper, i)
  }

  _initSlides () {
    this._option.slides.forEach((s) => {
      this._initSlide(s)
    })
  }

  _isFirstSlide () {
    return this._currentSlide === 0
  }

  _isLastSlide () {
    return this._currentSlide === this._option.slides.length - 1
  }

  _isSlideOnTop () {
    return this.top === this._prevSlidesHeight()
  }

  _isSlideMutiPages (i) {
    return (
      this._option.slides[i].clientHeight > this._option.viewport.clientHeight
    )
  }

  _initView () {
    const viewport = this._option.viewport || document.body
    viewport.classList.add(`${classNamePrefix}-viewport`)
    viewport.style.position = 'relative'
    if (viewport.style.height === '') {
      viewport.style.height = '100%'
    }
    viewport.style.overflow = 'hidden'
    viewport.addEventListener('wheel', (e) => {
      this._handleMouseWheel(e)
    })
    viewport.addEventListener('touchstart', (e) => {
      this._handleTouchStart(e)
    })

    this._wrapper = document.createElement('div')
    this._wrapper.classList.add(`${classNamePrefix}-wrapper`)
    this._wrapper.style.position = 'relative'
    this._wrapper.style.top = '0px'
    this._wrapper.style.transition = `all ${this._option.duration}ms ease 0s`
    viewport.appendChild(this._wrapper)

    this._initSlides()

    if (this._option.paginator !== 'none') {
      this._initPaginator()
    }
  }

  _prevSlidesHeight (index = this._currentSlide) {
    let heights = 0
    this._option.slides.forEach((s, i, arr) => {
      if (index <= i) return
      heights += s.clientHeight
    })
    return heights
  }

  _setCurrentSlide (val) {
    if (val === this._currentSlide) return
    this._currentSlide = val
    if (typeof this._option.onScroll === 'function') {
      this._option.onScroll(this._currentSlide)
    }
  }

  _handleDotClick (e) {
    e.preventDefault()

    const index = Number(e.target.getAttribute('slide-index')) || 0
    if (index === this._currentSlide) return

    this.scrollTo(index)
  }

  _handleKeyboard (e) {
    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
        this.scrollDown()
        break
      case 'ArrowUp':
      case 'PageUp':
        this.scrollUp()
        break
      default:
    }
  }

  _handleMouseWheel (e) {
    e.preventDefault()

    const now = new Date().getTime()
    if (
      now - this._lastAnimeTime <
      this._option.idleTime + this._option.duration
    ) {
      return
    }

    const delta = e.wheelDelta || -e.detail
    if (delta < 0) {
      this.scrollDown()
    } else {
      this.scrollUp()
    }

    this._lastAnimeTime = now
  }

  _handleResize (e) {
    this._initSlides()
  }

  _handleTouchMove (e) {
    e.preventDefault()

    if (!this._isTouching) return

    const now = new Date().getTime()
    if (
      now - this._lastAnimeTime <
      this._option.idleTime + this._option.duration
    ) {
      return
    }

    if (e.touches && e.touches.length) {
      const delta = this._touchStartY - e.touches[0].pageY
      if (Math.abs(delta) < 50) return
      if (delta < 0) {
        this.scrollDown()
      } else {
        this.scrollUp()
      }
      e.target.removeEventListener('touchmove', this._handleTouchMove)

      this._lastAnimeTime = now
    }

    this._touchStartY = 0
    this._isTouching = false
  }

  _handleTouchStart (e) {
    if (e.touches && e.touches.length) {
      this._isTouching = true
      this._touchStartY = e.touches[0].pageY
      this._option.viewport.addEventListener('touchmove', (e) => {
        this._handleTouchMove(e)
      })
    }
  }
}

function insert (arr, index, el) {
  if (index >= arr.length) {
    arr.push(el)
  } else {
    arr.splice(index, 0, el)
  }
}

function moveEl (el, to, i = null) {
  const childList = to.children
  if (i === null || i === childList.length) {
    to.appendChild(el)
  } else {
    to.insertBefore(el, childList[i])
  }
}

function translateY (el, y) {
  el.style.transform = `translateY(${y}px)`
}

export default Scroll
