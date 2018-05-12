[![Build Status](https://travis-ci.org/fralonra/scroll-slide.svg?branch=master)](https://travis-ci.org/fralonra/scroll-slide)

# scroll-slide

Flexible and pure-js scrollable slides maker.

[demo](https://fralonra.github.io/scroll-slide/demo/)

# Features
* No other requirements like jquery.
* Can make onepage-scroll and also section-scroll.
* Add or remove slides programatically.
* Both scrolling and swiping are supported.
* Keyboard supported.
* Optional paginator.

# Usage

Install the library via npm:
```bash
npm install scroll-slide
```

Or simply download files from this repo.
Then link `scroll-slide.min.js` or `scroll-slide.js` in your HTML.
```html
<script src="/path/to/scroll-slide.min.js"></script>
```

### Basic examples
```javascript
scroll({
  viewport: document.getElementById('viewport'),
  slides: document.querySelectorAll('#viewport section')
});
```

or

```javascript
const s = scroll({
  viewport: document.getElementById('viewport'),
  slides: document.querySelectorAll('#viewport section'),
  paginator: 'right',
  onScoll (i) {
    alert(`This is slide ${i + 1}`);
  }
});
```

### Full mode
You can create slide which fills the entire viewport regardless of its original size by setting attribute `full` to 'true'.
```html
<div id="viewport">
  <section id="full" full="true">
    This slide will fill the entire viewport.
  </section>
  <section id="nofull">
    This slide will keep its original size.
  </section>
</div>
```

# API

## Methods

### constructor(option)
More for `option`, see [below](#options).

### add(el, index)
Add new element to viewport at position `index`. Push to the end by default.

### remove(index)
Remove the element at position `index` in the viewport.

### scrollDown()
Move the slide down by one. The same as scrolling down/swiping down.

### scrollTo(index = 0)
Move to the slide at position `index`. Move to the first slide by default.

### scrollUp()
Move the slide up by one. The same as scrolling up/swiping up.

### toggleFull(el)
Toggle full mode of an element.

## Options

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| aniDuration | How long the scolling animation will last. | String | '1000ms' |
| dotColor | The color for paginator dots. | String | '#e1e1e1' |
| dotActiveColor | The color for paginator dot which is currently actived. | String | '#6687ff' |
| idleTime | How long the browser won't respond to the scrolling action after last scrolling in millseconds. | Number | 200 |
| loop | If the continuous loop mode to be enabled. | Boolean | true |
| keyboard | If true, you can use up/down and pageUp/pageDown to navigate slides. | Boolean | true |
| paginator | If 'none', there will be no paginator. If 'right'/'left', the paginator will be shown on the right/left of the viewport. | String | 'none' |
| slides | The elements to be shown as slides in the viewport. | Array | [] |
| viewport | The wrapper element for all slides. If you need to create a onepage-scroll website, just set viewport to fit the screen size. | Element | null |
| onScroll | The callback function when reaches a new slide. The index of current slide will be passed. | Function | null |
