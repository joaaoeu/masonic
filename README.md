# ⚠️ WARNING

This fork is to keep the <strong>masonic v2.1.7</strong> locked with some fixies that currently are done only in the new versions of [oficial masonic](https://github.com/jaredLunde/masonic).

Please, note that this <strong>HASN'T ANY UPDATES OR SUPPORT</strong>.

<hr>

# HOW TO USE

Add in your <strong>package.json</strong> dependencies:

```json
"masonic": "git+https://github.com/joaaoeu/masonic.git",
```

<hr>

## Fixies added to masonic v2.1.7

- Fix height measurement in Chrome 84 https://github.com/jaredLunde/masonic/issues/28
- Fixed react and react-dom versions due to conflict with the project react version

<hr>
<div align="center">
  <h1 align="center">
    🧱 masonic
  </h1>
</div>

<p align="center">
  <a href="https://bundlephobia.com/result?p=masonic">
    <img alt="Bundlephobia" src="https://img.shields.io/bundlephobia/minzip/masonic?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Types" href="https://www.npmjs.com/package/masonic">
    <img alt="Types" src="https://img.shields.io/npm/types/masonic?style=for-the-badge&labelColor=24292e">
  </a>
  <!--
  <a aria-label="Code coverage report" href="https://codecov.io/gh/jaredLunde/masonic">
    <img alt="Code coverage" src="https://img.shields.io/codecov/c/gh/jaredLunde/masonic?style=for-the-badge&labelColor=24292e">
  </a>
  -->
  <a aria-label="Build status" href="https://travis-ci.com/jaredLunde/masonic">
    <img alt="Build status" src="https://img.shields.io/travis/com/jaredLunde/masonic?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/masonic">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/masonic?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="License" href="https://jaredlunde.mit-license.org/">
    <img alt="MIT License" src="https://img.shields.io/npm/l/masonic?style=for-the-badge&labelColor=24292e">
  </a>
</p>

<pre align="center">npm i masonic</pre>
<hr>

A virtualized masonry grid component for React based
on Brian Vaughn's [react-virtualized](https://github.com/bvaughn/react-virtualized)
and further inspired by [react-window](https://github.com/bvaughn/react-window).

## Features

- **Easy to use** It only takes two minutes to start creating your own masonry grid with this component.
  For reals, [check out the demo on CodeSandbox](https://codesandbox.io/s/0oyxozv75v).
- **Blazing™ fast** This component can seamlessly render hundreds of thousands of grid items
  without issue via virtualization and intelligent data structures. It uses a [red black interval tree](https://www.geeksforgeeks.org/interval-tree/)
  to determine which grid items with `O(log n + m)` lookup performance to render based upon the scroll position and size of the window.
- **TypeScript** Woohoo, superior autocomplete and type safety means fewer bugs in your implementation.
- **Versatility** All of the autosizing [`<Masonry>`](#masonry)'s constituent parts are provided via exports so you're
  not locked into to the implementation. At times it will be useful to have access to those internals. It's also
  possible to kick the virtualization out of the equation by providing an infinite value to the `overscanBy` prop, though
  this would be a terrible idea for large lists.
- **Autosizing** The grid will automatically resize itself and its items if the content of the
  grid items changes or resizes. For example, when an image lazily loads this component will
  automatically do the work of recalculating the size of that grid item using
  [`resize-observer-polyfill`](https://www.npmjs.com/package/resize-observer-polyfill).

## Quick Start

#### [Check out the demo on CodeSandbox](https://codesandbox.io/s/0oyxozv75v)

```jsx harmony
import {Masonry} from 'masonic'

let i = 0
const items = Array.from(Array(5000), () => ({id: i++}))

const EasyMasonryComponent = props => (
  <Masonry items={items} render={MasonryCard} />
)

const MasonryCard = ({index, data: {id}, width}) => (
  <div>
    <div>Index: {index}</div>
    <pre>ID: {id}</pre>
    <div>Column width: {width}</div>
  </div>
)
```

## API

### Components

| Component                       | Description                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`<Masonry>`](#masonry)         | An autosizing masonry grid component that only renders items currently viewable in the window. This component will change its column count to fit its container's width and will decide how many rows to render based upon the height of the `window`. To facilitate this, it uses [`<FreeMasonry>`](#freemasonry), [`useContainerRect()`](#usecontainerrect), and [`useWindowScroller()`](#usewindowscroller) under the hood. |
| [`<FreeMasonry>`](#freemasonry) | A more flexible masonry grid component that lets you define your own `width`, `height`, `scrollTop`, and `isScrolling` props.                                                                                                                                                                                                                                                                                                  |
| [`<List>`](#list)               | This is just a single-column [`<Masonry>`](#masonry) component.                                                                                                                                                                                                                                                                                                                                                                |

### Hooks

| Hook                                        | Description                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`useInfiniteLoader()`](#useinfiniteloader) | A utility hook for seamlessly adding infinite scroll behavior to the [`<Masonry>`](#masonry) component. This hook invokes a callback each time the last rendered index surpasses the total number of items in your items array, or the number defined in the `totalItems` option of this hook.                                        |
| [`useContainerRect()`](#usecontainerrect)   | A hook used for measuring and tracking the width of the masonry component's container, as well as its distance from the top of your document. These values are necessary to correctly calculate the number/width of columns to render, as well as the number of rows to render.                                                       |
| [`useWindowScroller()`](#usewindowscroller) | A hook used for measuring the size of the browser window, whether or not the window is currently being scrolled, and the window's scroll position. These values are used when calculating the number of rows to render and determining when we should disable pointer events on the masonry container to maximize scroll performance. |

### `<Masonry>`

An autosizing masonry grid component that only renders items currently viewable in the window. This
component will change its column count to fit its container's width and will decide how many rows
to render based upon the height of the `window`. To facilitate this, it uses [`<FreeMasonry>`](#freemasonry),
[`useContainerRect()`](#usecontainerrect), and [`useWindowScroller()`](#usewindowscroller) under the hood.

#### Props

##### Columns

Props for tuning the column width, count, and gutter of your component.

| Prop         | Type     | Default     | Required? | Description                                                                                                                                                                                                                                                                          |
| ------------ | -------- | ----------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| columnWidth  | `number` | `240`       | Yes       | This is the minimum column width. `Masonic` will automatically size your columns to fill its container based on your provided `columnWidth` and `columnGutter` values. It will never render anything smaller than this defined width unless its container is smaller than its value. |
| columnGutter | `number` | `0`         | No        | This sets the amount (px) of vertical and horizontal space between grid items.                                                                                                                                                                                                       |
| columnCount  | `number` | `undefined` | No        | By default, `Masonic` derives the column count from the `columnWidth` prop. However, in some situations it is nice to be able to override that behavior (e.g. when creating a [`<List>`](#list).                                                                                     |

##### Item rendering

Props that dictate how individual grid items are rendered.

| Prop               | Type                                            | Default               | Required? | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------ | ----------------------------------------------- | --------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| render             | <code>React.ComponentClass&#124;React.FC</code> | `undefined`           | Yes       | The component provided here is rendered for each item of your `items` array (see below). The component here should handle [the `render` props defined below](#render-props).                                                                                                                                                                                                                                                                                                                                                                       |
| items              | `any[]`                                         | `undefined`           | Yes       | An array of items to render. The data contained at each index is passed to the `data` prop of your `render` component. It is also passed to the `onRender` callback and the `itemKey` generator. Its length is used for determining the estimated height of the container.                                                                                                                                                                                                                                                                         |
| itemHeightEstimate | `number`                                        | `300`                 | No        | This value is used for estimating the initial height of the masonry grid. it is vital to the UX of the scrolling behavior and in determining how many `items` to initially render, so its wise to set this value with some accuracy.                                                                                                                                                                                                                                                                                                               |
| itemAs             | `React.ReactNode`                               | `"div"`               | No        | Your `render` component is wrapped with an element that has a `style` prop which sets the position of the grid item in its container. This is the type of element created for that wrapper. One common use case would be changing this property to `li` and the Masonry component's `as` prop to `ul`.                                                                                                                                                                                                                                             |
| itemStyle          | `React.CSSProperties`                           | `undefined`           | No        | You can add additional styles to the wrapper discussed in `itemAs` by setting this property.                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| itemKey            | `(data: any, index: number) => string`          | `(_, index) => index` | No        | The value returned here must be unique to the item. By default, the key is the item's index. This is ok if your collection of items is never modified. Setting this property ensures that the component in `render` is reused each time the masonry grid is reflowed. A common pattern would be to return the item's database ID here if there is one, e.g. `data => data.id`                                                                                                                                                                      |
| overscanBy         | `number`                                        | `2`                   | No        | This number is used for determining the number of grid items outside of the visible window to render. The default value is `2` which means "render 2 windows worth of content before and after the items in the visible window". A value of `3` would be 3 windows worth of grid items, so it's a linear relationship. Overscanning is important for preventing tearing when scrolling through items in the grid, but setting too high of a value may create too much work for React to handle, so it's best that you tune this value accordingly. |

###### `render` props

These are the props provided to the component you set in your `render` prop.

| Prop  | Type     | Description                                                                                                                          |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| data  | `any`    | This is the data contained at `items[index]` of your `items` prop array.                                                             |
| index | `number` | The index of the item in your `items` prop array.                                                                                    |
| width | `number` | The width of the collumn containing this component. This is super useful for doing things like determining the dimensions of images. |

##### Customizing the container element

These props customize how the masonry grid element is rendered.

| Prop      | Type                  | Default     | Required? | Description                                                                                                            |
| --------- | --------------------- | ----------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| as        | `React.ReactNode`     | `"div"`     | No        | This sets the element type of the masonry grid. A common use case would be changing this to `ul` and `itemAs` to `li`. |
| id        | `string`              | `undefined` | No        | Add an ID to the masonry grid container.                                                                               |
| className | `string`              | `undefined` | No        | Add a class to the masonry grid container.                                                                             |
| style     | `React.CSSProperties` | `undefined` | No        | Add inline styles to the masonry grid container.                                                                       |
| role      | `string`              | `"grid"`    | No        | Change the aria/a11y role of the container.                                                                            |
| tabIndex  | `number`              | `0`         | No        | Change the tabIndex of the container. By default the container is tabbable.                                            |

##### Customizing the window for SSR

These are useful values to set when using SSR because in SSR land we don't have access to the
width and height of the window, and thus have no idea how many items to render.

| Prop          | Type     | Default | Required? | Description                      |
| ------------- | -------- | ------- | --------- | -------------------------------- |
| initialWidth  | `number` | `1280`  | No        | The width of the window in SSR.  |
| initialHeight | `number` | `720`   | No        | The height of the window in SSR. |

##### Callbacks

| Prop     | Type                                                            | Default     | Required? | Description                                                               |
| -------- | --------------------------------------------------------------- | ----------- | --------- | ------------------------------------------------------------------------- |
| onRender | `(startIndex: number, stopIndex: number, items: any[]) => void` | `undefined` | No        | This callback is invoked any time the items rendered in the grid changes. |

###### `onRender()` arguments

| Argument   | Type     | Description                                                        |
| ---------- | -------- | ------------------------------------------------------------------ |
| startIndex | `number` | The index of the first item currently being rendered in the window |
| stopIndex  | `number` | The index of the last item currently being rendered in the window  |
| items      | `any[]`  | The array of items you provided to the `items` prop                |

##### Methods

When a `ref` is provided to this component, you'll have access to the following
imperative methods:

| Method         | Type         | Description                                                                                                                                                                                                                                                                                                                                |
| -------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| clearPositions | `() => void` | Invoking this method will create a new position cache, clearing all previous stored position values. This is useful if you want the component to reflow when adding new items to the `items` array, however the best way to trigger a reflow is setting a different unique `key` prop on the `<Masonry>` component each time that happens. |

---

### `<FreeMasonry>`

This is a bare bones masonry grid without [`useWindowScroller()`](#usewindowscroller) and [`useContainerRect()`](#usecontainerrect)
hooks doing any magic. It accepts all of the props from [`<Masonry>`](#masonry) except `initialWidth` and `initialHeight`.

#### Additional props

| Prop         | Type                                                                                                 | Default     | Required? | Description                                                                                                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------- | ----------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| width        | `number`                                                                                             | `undefined` | Yes       | This sets the width of the grid.                                                                                                                                                             |
| height       | `number`                                                                                             | `undefined` | Yes       | This is the height of the grid's window. If you're rendering `<FreeMasonry>` inside of a scrollable `div` for example, this would be the height of that div.                                 |
| scrollTop    | `number`                                                                                             | `undefined` | Yes       | The scroll position of the window `<FreeMasonry>` is rendering inside. Either the `window` object scroll position or the scroll position of say, a scrollable `div` you're rendering inside. |
| isScrolling  | `boolean`                                                                                            | `false`     | No        | When this value is `true`, `pointer-events: none;` and `will-change: contents, height;` styles are applied to the grid to maximize scroll performance.                                       |
| containerRef | <code>((element: HTMLElement) => void) &#124; React.MutableRefObject<HTMLElement &#124; null></code> | `undefined` | No        | Sets a `ref` prop on the grid container.                                                                                                                                                     |

---

### `<List>`

This is a single-column `<Masonry>` component. It accepts all of the properties defined in [`<Masonry>`],
except `columnGutter`, `columnWidth`, and `columnCount`.

#### Additional props

| Prop      | Type     | Default | Required? | Description                                                                   |
| --------- | -------- | ------- | --------- | ----------------------------------------------------------------------------- |
| rowGutter | `number` | `0`     | No        | This sets the amount of vertical space in pixels between rendered list items. |

---

### `useInfiniteLoader()`

A React hook for seamlessly adding infinite scrolling behavior to [`<Masonry>`](#masonry) and
[`<List>`](#list) components.

```jsx harmony
import {Masonry, useInfiniteLoader} from 'masonic'
import memoize from 'trie-memoize'

const fetchMoreItems = memoize(
  [{}, {}, {}],
  (startIndex, stopIndex, currentItems) =>
    fetch(
      `/api/get-more?after=${startIndex}&limit=${startIndex + stopIndex}`
    ).then(items => {
      // do something to add the new items to your state
    })
)

const InfiniteMasonry = props => {
  const maybeLoadMore = useInfiniteLoader(fetchMoreItems)
  const items = useItemsFromInfiniteLoader()
  return <Masonry {...props} items={items} onRender={maybeLoadMore} />
}
```

#### Arguments

| Argument      | Type                                                           | Description                                                                                                                                                                                                                                                                                                 |
| ------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| loadMoreItems | `(startIndex: number, stopIndex: number, items: any[]) => any` | This callback will be invoked when more items must be loaded. It may be called multiple times in reaction to a single scroll event. As such, you are expected to memoize/track whether or not you've already received the `startIndex`, `stopIndex`, `items` values to prevent loading data more than once. |
| options       | `InfiniteLoaderOptions`                                        | Configuration object for your loader, see [`InfiniteLoaderOptions`](#infiniteloaderoptions) below.                                                                                                                                                                                                          |

#### InfiniteLoaderOptions

| Property         | Type                                       | Default                                        | Description                                                                                                                                 |
| ---------------- | ------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| isItemLoaded     | `(index: number, items: any[]) => boolean` | `(index, items) => items[index] !== undefined` | A callback responsible for determining the loaded state of each item. Return `true` if the item has already been loaded and `false` if not. |
| minimumBatchSize | `number`                                   | `16`                                           |                                                                                                                                             |
| threshold        | `number`                                   | `16`                                           | The default value of `16` means that data will start loading when a user scrolls within `16` items of the end of your `items` prop array.   |
| totalItems       | `number`                                   | `9E9`                                          | The total number of items you'll need to eventually load (if known). This can be arbitrarily high if not known (e.g., the default value).   |

---

### `useWindowScroller()`

A hook used for measuring the size of the browser window, whether or not the window is currently being scrolled,
and the window's scroll position. These values are used when calculating the number of rows to render and determining
when we should disable pointer events on the masonry container to maximize scroll performance.

```jsx harmony
import React from 'react'
import {FreeMasonry, useWindowScroller, useContainerRect} from 'masonic'

const MyCustomMasonry = props => {
  const {width, height, scrollY, isScrolling} = useWindowScroller(),
    [rect, containerRef] = useContainerRect(width, height)

  return React.createElement(
    FreeMasonry,
    Object.assign(
      {
        width: rect.width,
        height,
        scrollTop: Math.max(0, scrollY - (rect.top + scrollY)),
        isScrolling,
        containerRef,
      },
      props
    )
  )
}
```

#### Arguments

| Argument      | Type                    | Description                                                                                       |
| ------------- | ----------------------- | ------------------------------------------------------------------------------------------------- |
| initialWidth  | `number`                | The width of the window when render on the server side. This has no effect client side.           |
| initialHeight | `number`                | The height of the window when render on the server side. This has no effect client side.          |
| options       | `WindowScrollerOptions` | A configuration object for the hook. See [`WindowScrollerOptions`](#windowscrolleroptions) below. |

##### `WindowScrollerOptions`

```typescript
interface WindowScrollerOptions {
  size?: {
    // Debounces for this amount of time in ms
    // before updating the size of the window
    // in state
    //
    // Defaults to: 120
    wait?: number
  }
  scroll?: {
    // The rate in frames per second to update
    // the state of the scroll position
    //
    // Defaults to: 8
    fps?: number
  }
}
```

#### Returns `WindowScrollerResult`

```typescript
interface WindowScrollerResult {
  // The width of the browser window
  width: number
  // The height of the browser window
  height: number
  // The scroll position of the window on its y-axis
  scrollY: number
  // Is the window currently being scrolled?
  isScrolling: boolean
}
```

---

### `useContainerRect()`

A hook used for measuring and tracking the width of the masonry component's container, as well as its distance from
the top of your document. These values are necessary to correctly calculate the number/width of columns to render, as well as the number of rows to render.

```jsx harmony
import React from 'react'
import {FreeMasonry, useWindowScroller, useContainerRect} from 'masonic'

const MyCustomMasonry = props => {
  const {width, height, scrollY, isScrolling} = useWindowScroller(),
    [rect, containerRef] = useContainerRect(width, height)

  return React.createElement(
    FreeMasonry,
    Object.assign(
      {
        width: rect.width,
        height,
        scrollTop: Math.max(0, scrollY - (rect.top + scrollY)),
        isScrolling,
        containerRef,
      },
      props
    )
  )
}
```

#### Arguments

| Argument     | Type     | Description                                                                                       |
| ------------ | -------- | ------------------------------------------------------------------------------------------------- |
| windowWidth  | `number` | The width of the window. Used for updating the `ContainerRect` when the window's width changes.   |
| windowHeight | `number` | The height of the window. Used for updating the `ContainerRect` when the window's height changes. |

#### Returns `[ContainerRect, (element: HTMLElement) => void]`

##### `ContainerRect`

| Property | Type     | Description                                              |
| -------- | -------- | -------------------------------------------------------- |
| top      | `number` | The `top` value from `element.getBoundingClientRect()`   |
| width    | `number` | The `width` value from `element.getBoundingClientRect()` |

---

## Differences from `react-virtualized/Masonry`

There are actually quite a few differences between these components and
the originals, despite the overall design being highly inspired by them.

1. The `react-virtualized` component requires a `<CellMeasurer>`,
   `cellPositioner`, and `cellMeasurerCache` and a ton of custom implementation
   to get off the ground. It's very difficult to work with. In `Masonic` this
   functionality is built in using [`resize-observer-polyfill`](https://github.com/que-etc/resize-observer-polyfill)
   for tracking cell size changes.

2. This component will auto-calculate the number of columns to render based
   upon the defined `columnWidth` property. The column count will update
   any time it changes.

3. The implementation for updating cell positions and sizes is also much more
   efficient in this component because only specific cells and columns are
   updated when cell sizes change, whereas in the original a complete reflow
   is triggered.

4. The API is a complete rewrite and because of much of what is mentioned
   above, is much easier to use in my opinion.

## LICENSE

MIT
