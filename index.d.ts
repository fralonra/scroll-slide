export as namespace Scroll

interface ScrollOptions {
  /**
   * If true, the height of slides will be responsive to the height of window.
   * @default true
   */
  autoHeight?: boolean
  /**
   * The color for paginator dots.
   * @default '#e1e1e1'
   */
  dotColor?: string
  /**
   * The color for paginator dot which is currently actived.
   * @default '#6687ff'
   */
  dotActiveColor?: string
  /**
   * How long the scolling animation will last in milliseconds.
   * @default 1000
   */
  duration?: number
  /**
   * How long the browser won't respond to the scrolling action after last scrolling in millseconds.
   * @default 200
   */
  idleTime?: number
  /**
   * If the continuous loop mode to be enabled.
   * @default true
   */
  loop?: boolean
  /**
   * If true, you can use up/down and pageUp/pageDown to navigate slides.
   * @default true
   */
  keyboard?: boolean
  /**
   * If 'none', there will be no paginator. If 'right'/'left', the paginator will be shown on the right/left of the viewport.
   * @default 'none'
   */
  paginator?: 'none' | 'right' | 'left'
  /**
   * The elements to be shown as slides in the viewport.
   * @default []
   */
  slides?: Element[]
  /**
   * The wrapper element for all slides. If you need to create a onepage-scroll website, just set viewport to fit the screen size.
   * @default null
   */
  viewport?: Element
  /**
   * The callback function when reaches a new slide. The index of current slide will be passed.
   * @default null
   */
  onScroll?: Function
}

declare class Scroll {
  constructor(options: ScrollOptions)

  /**
   * Adds new element to viewport at position `index`. Push to the end by default.
   * */
  add(el: Element, index?: number): void

  /**
   * Returns the index of current slide. Starts from 0.
   * */
  current(): number

  /**
   * Removes the element at position `index` in the viewport.
   * */
  remove(index: number): void

  /**
   * Moves the slide down by one. The same as scrolling down/swiping down.
   * */
  scrollDown(): void

  /**
   * Moves to the slide at position `index`. Moves to the first slide by default.
   * */
  scrollTo(index: number = 0): void

  /**
   * Moves the slide up by one. The same as scrolling up/swiping up.
   * */
  scrollUp(): void

  /**
   * Toggles full mode of an element.
   * */
  toggleFull(el: Element): void
}

export = Scroll