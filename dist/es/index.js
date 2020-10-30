import _pt from 'prop-types'
import React from 'react'
const __reactCreateElement__ = React.createElement
const {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
  useImperativeHandle,
} = React
import {unstable_batchedUpdates} from 'react-dom'
import ResizeObserver from 'resize-observer-polyfill'
import trieMemoize from 'trie-memoize'
import OneKeyMap from '@essentials/one-key-map'
import memoizeOne from '@essentials/memoize-one'
import useLayoutEffect from '@react-hook/passive-layout-effect'
import useWindowScroll from '@react-hook/window-scroll'
import useWindowSize from '@react-hook/window-size'
import createIntervalTree from './IntervalTree'
const emptyObj = {}
const emptyArr = []

const binarySearch = (a, y) => {
  let l = 0
  let h = a.length - 1

  while (l <= h) {
    const m = (l + h) >>> 1
    const x = a[m]
    if (x === y) return m
    else if (x <= y) l = m + 1
    else h = m - 1
  }

  return -1
}

const createItemPositioner = (columnCount, columnWidth, columnGutter = 0) => {
  // Track the height of each column.
  // Layout algorithm below always inserts into the shortest column.
  const columnHeights = new Array(columnCount),
    items = {},
    columnItems = new Array(columnCount)

  for (let i = 0; i < columnCount; i++) {
    columnHeights[i] = 0
    columnItems[i] = []
  }

  const set = (index, height = 0) => {
    let column = 0 // finds the shortest column and uses it

    for (let i = 1; i < columnHeights.length; i++) {
      if (columnHeights[i] < columnHeights[column]) column = i
    }

    const left = column * (columnWidth + columnGutter),
      top = columnHeights[column] || 0,
      item = {
        left,
        top,
        height,
        column,
      }
    columnHeights[column] = top + height + columnGutter
    items[index] = item
    columnItems[column].push(index)
    return item
  } // this only updates items in the specific columns that have changed, on and after the
  // specific items that have changed

  const update = (updates) => {
    const columns = new Array(columnCount),
      updatedItems = []
    let i = 0,
      j = 0 // determines which columns have items that changed, as well as the minimum index
    // changed in that column, as all items after that index will have their positions
    // affected by the change

    for (; i < updates.length - 1; i++) {
      const index = updates[i],
        item = items[index]
      item.height = updates[++i]
      columns[item.column] =
        columns[item.column] === void 0
          ? index
          : Math.min(index, columns[item.column])
    }

    for (i = 0; i < columns.length; i++) {
      // bails out if the column didn't change
      if (columns[i] === void 0) continue
      const itemsInColumn = columnItems[i],
        // the index order is sorted with certainty so binary search is a great solution
        // here as opposed to Array.indexOf()
        startIndex = binarySearch(itemsInColumn, columns[i]),
        index = columnItems[i][startIndex],
        startItem = items[index]
      columnHeights[i] = startItem.top + startItem.height + columnGutter
      updatedItems.push(index, startItem)

      for (j = startIndex + 1; j < itemsInColumn.length; j++) {
        const index = itemsInColumn[j],
          item = items[index]
        item.top = columnHeights[i]
        columnHeights[i] = item.top + item.height + columnGutter
        updatedItems.push(index, item)
      }
    }

    return updatedItems
  }

  return {
    set,
    get: (index) => (index === void 0 ? index : items[index]),
    update,
    columnCount,
    columnWidth,
    columnGutter,
  }
} // Position cache requirements:

//   O(log(n)) lookup of cells to render for a given viewport size
//   O(1) lookup of shortest measured column (so we know when to enter phase 1)
const createPositionCache = () => {
  // Store tops and bottoms of each cell for fast intersection lookup.
  const intervalTree = createIntervalTree(),
    // Tracks the intervals that were inserted into the interval tree so they can be
    // removed when positions are updated
    intervalValueMap = [],
    // Maps cell index to x coordinates for quick lookup.
    leftMap = [],
    // Tracks the height of each column
    columnSizeMap = {}

  const estimateTotalHeight = (itemCount, columnCount, defaultItemHeight) =>
    itemCount === intervalTree.size
      ? getTallestColumnSize()
      : getTallestColumnSize() +
        Math.ceil((itemCount - intervalTree.size) / columnCount) *
          defaultItemHeight // Render all cells visible within the viewport range defined.

  const range = (lo, hi, renderCallback) => {
    intervalTree.search(lo, hi, (index, top) =>
      renderCallback(index, leftMap[index], top)
    )
  }

  const setPosition = (index, left, top, height) => {
    const prevInterval = intervalValueMap[index],
      prev = prevInterval !== void 0 && prevInterval[1],
      next = top + height
    if (prevInterval !== void 0) intervalTree.remove.apply(null, prevInterval)
    intervalTree.insert(top, next, index)
    intervalValueMap[index] = [top, next, index]
    leftMap[index] = left
    const columnHeight = columnSizeMap[left]
    if (prev !== false && prev > next && columnSizeMap[left] === prev)
      columnSizeMap[left] = next
    else {
      columnSizeMap[left] = Math.max(columnHeight || 0, next)
    }
  }

  const getShortestColumnSize = () => {
    const keys = Object.keys(columnSizeMap)
    let size = columnSizeMap[keys[0]],
      i = 1

    if (size !== void 0 && keys.length > 1) {
      for (; i < keys.length; i++) {
        const height = columnSizeMap[keys[i]]
        size = size < height ? size : height
      }
    }

    return size || 0
  }

  const getTallestColumnSize = () =>
    Math.max(0, Math.max.apply(null, Object.values(columnSizeMap)))

  return {
    range,

    get size() {
      return intervalTree.size
    },

    estimateTotalHeight,
    getShortestColumnSize,
    setPosition,
  }
}

const defaultSizeOpt = {
  wait: 120,
}
export const useWindowScroller = (
  initialWidth = 1280,
  initialHeight = 720,
  options = emptyObj
) => {
  var _options$scroll

  const scrollY = useWindowScroll(
    ((_options$scroll = options.scroll) === null || _options$scroll === void 0
      ? void 0
      : _options$scroll.fps) || 8
  )

  const _ref_0 = useState(false)

  const setIsScrolling = _ref_0[1]
  const isScrolling = _ref_0[0]
  const [width, height] = useWindowSize(
    initialWidth,
    initialHeight,
    options.size || defaultSizeOpt
  )

  function _ref() {
    // This is here to prevent premature bail outs while maintaining high resolution
    // unsets. Without it there will always bee a lot of unnecessary DOM writes to style.
    setIsScrolling(false)
  }

  useLayoutEffect(() => {
    if (!isScrolling) setIsScrolling(true)
    const to = window.setTimeout(_ref, 1000 / 6)
    return () => window.clearTimeout(to)
  }, [scrollY])
  return {
    width,
    height,
    scrollY,
    isScrolling,
  }
}
const defaultRect = {
  top: 0,
  width: 0,
}
const getContainerRect = memoizeOne(
  (element, width, top) => [
    {
      width,
      top,
    },
    element,
  ],
  (args, pargs) =>
    args[1] === pargs[1] && args[2] === pargs[2] && args[0] === pargs[0]
)
export const useContainerRect = (windowWidth, windowHeight) => {
  const _ref_1 = useState(null)

  const setElement = _ref_1[1]
  const element = _ref_1[0]

  const _ref_2 = useState(defaultRect)

  const setContainerRect = _ref_2[1]
  const containerRect = _ref_2[0]

  function _ref2() {
    // @ts-ignore
    const rect = element.getBoundingClientRect()

    if (rect.top !== containerRect.top || rect.width !== containerRect.width) {
      setContainerRect({
        top: rect.top,
        width: rect.width,
      })
    }
  }

  useLayoutEffect(() => {
    if (element !== null) {
      const setRect = _ref2
      setRect() // Got a better way to track changes to `top`?
      // Resize/MutationObserver() won't cover it I don't think (top)
      // Submit a PR

      const qi = window.setInterval(setRect, 360)
      return () => window.clearInterval(qi)
    }
  }, [windowWidth, windowHeight, containerRect, element])
  return getContainerRect(
    setElement,
    containerRect.width || windowWidth,
    containerRect.top
  )
}

const getColumns = (width = 0, minimumWidth = 0, gutter = 8, columnCount) => {
  columnCount = columnCount || Math.floor(width / (minimumWidth + gutter)) || 1
  const columnWidth = Math.floor(
    (width - gutter * (columnCount - 1)) / columnCount
  )
  return [columnWidth, columnCount]
}

const getContainerStyle = memoizeOne((isScrolling, estimateTotalHeight) => ({
  position: 'relative',
  width: '100%',
  maxWidth: '100%',
  height: Math.ceil(estimateTotalHeight),
  maxHeight: Math.ceil(estimateTotalHeight),
  willChange: isScrolling ? 'contents, height' : void 0,
  pointerEvents: isScrolling ? 'none' : void 0,
}))
const assignUserStyle = memoizeOne(
  (containerStyle, userStyle) => Object.assign({}, containerStyle, userStyle),
  (args, pargs) => args[0] === pargs[0] && args[1] === pargs[1]
)
const assignUserItemStyle = trieMemoize(
  [WeakMap, OneKeyMap],
  (itemStyle, userStyle) => Object.assign({}, itemStyle, userStyle)
)

const defaultGetItemKey = (_, i) => i // the below memoizations for for ensuring shallow equal is reliable for pure
// component children

const getCachedSize = memoizeOne(
  (width) => ({
    width,
    zIndex: -1000,
    visibility: 'hidden',
    position: 'absolute',
    writingMode: 'horizontal-tb',
  }),
  (args, pargs) => args[0] === pargs[0]
)
const getCachedItemStyle = trieMemoize(
  [OneKeyMap, Map, Map],
  (width, left, top) => ({
    top,
    left,
    width,
    writingMode: 'horizontal-tb',
    position: 'absolute',
  })
)

function _ref3(current) {
  return ++current
}

const useForceUpdate = () => {
  const setState = useState(0)[1]
  return useCallback(() => setState(_ref3), emptyArr)
}

const elementsCache = new WeakMap()
const getRefSetter = trieMemoize(
  [OneKeyMap, OneKeyMap, OneKeyMap],
  (resizeObserver, positionCache, itemPositioner) =>
    trieMemoize([{}], (index) => (el) => {
      if (el === null) return
      resizeObserver.observe(el)
      elementsCache.set(el, index)

      if (itemPositioner.get(index) === void 0) {
        const item = itemPositioner.set(index, el.offsetHeight)
        positionCache.setPosition(index, item.left, item.top, item.height)
      }
    })
)
export const FreeMasonry = /*#__PURE__*/ React.forwardRef(
  (
    {
      items,
      width,
      columnWidth,
      columnCount,
      columnGutter,
      onRender,
      as = 'div',
      id,
      className,
      style,
      role = 'grid',
      tabIndex = 0,
      containerRef,
      itemAs = 'div',
      itemStyle,
      itemHeightEstimate = 300,
      itemKey = defaultGetItemKey,
      overscanBy = 2,
      scrollTop,
      isScrolling,
      height,
      render,
    },
    ref
  ) => {
    const didMount = useRef('0')

    const initPositioner = () => {
      const gutter = columnGutter || 0
      const [computedColumnWidth, computedColumnCount] = getColumns(
        width,
        columnWidth || 200,
        gutter,
        columnCount
      )
      return createItemPositioner(
        computedColumnCount,
        computedColumnWidth,
        gutter
      )
    }

    const stopIndex = useRef()
    const startIndex = useRef(0)

    const _ref_3 = useState(initPositioner)

    const setItemPositioner = _ref_3[1]
    const itemPositioner = _ref_3[0]

    const _ref_4 = useState(createPositionCache)

    const setPositionCache = _ref_4[1]
    const positionCache = _ref_4[0]
    const forceUpdate = useForceUpdate()

    function _ref4(entries) {
      const updates = []

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]
        const height = entry.target.offsetHeight

        if (height > 0) {
          const index = elementsCache.get(entry.target)
          const position = itemPositioner.get(index)

          if (
            position !== void 0 &&
            index !== void 0 &&
            height !== position.height
          ) {
            updates.push(index, height)
          }
        }
      }

      if (updates.length > 0) {
        // Updates the size/positions of the cell with the resize
        // observer updates
        const updatedItems = itemPositioner.update(updates)

        for (let i = 0; i < updatedItems.length; i++) {
          const index = updatedItems[i++]
          const item = updatedItems[i]
          positionCache.setPosition(index, item.left, item.top, item.height)
        }

        forceUpdate()
      }
    }

    const resizeObserver = useMemo(() => new ResizeObserver(_ref4), [
      itemPositioner,
      positionCache,
    ]) // cleans up the resize observers when they change or the
    // component unmounts

    useEffect(() => resizeObserver.disconnect.bind(resizeObserver), [
      resizeObserver,
    ]) // Calls the onRender callback if the rendered indices changed

    useEffect(() => {
      if (typeof onRender === 'function' && stopIndex.current !== void 0) {
        onRender(startIndex.current, stopIndex.current, items)
      }
    }, [items, startIndex.current, stopIndex.current]) // Allows parent components to clear the position cache imperatively

    function _ref5() {
      setPositionCache(createPositionCache())
    }

    useImperativeHandle(
      ref,
      () => ({
        clearPositions: _ref5,
      }),
      emptyArr
    ) // Updates the item positions any time a prop potentially affecting their
    // size changes

    useLayoutEffect(() => {
      didMount.current = '1'
      const cacheSize = positionCache.size
      const nextPositionCache = createPositionCache()
      const nextItemPositioner = initPositioner()

      const stateUpdates = () => {
        setPositionCache(nextPositionCache)
        setItemPositioner(nextItemPositioner)
      }

      if (typeof unstable_batchedUpdates === 'function') {
        unstable_batchedUpdates(stateUpdates)
      } else {
        stateUpdates()
      }

      for (let index = 0; index < cacheSize; index++) {
        const pos = itemPositioner.get(index)

        if (pos !== void 0) {
          const item = nextItemPositioner.set(index, pos.height)
          nextPositionCache.setPosition(index, item.left, item.top, pos.height)
        }
      }
    }, [width, columnWidth, columnGutter, columnCount])
    const setItemRef = getRefSetter(
      resizeObserver,
      positionCache,
      itemPositioner
    )
    const itemCount = items.length
    const measuredCount = positionCache.size
    const shortestColumnSize = positionCache.getShortestColumnSize()
    const children = []
    const itemRole = role + 'item'
    overscanBy = height * overscanBy
    stopIndex.current = void 0
    positionCache.range(
      Math.max(0, scrollTop - overscanBy),
      scrollTop + overscanBy,
      (index, left, top) => {
        if (stopIndex.current === void 0) {
          startIndex.current = index
          stopIndex.current = index
        } else {
          startIndex.current = Math.min(startIndex.current, index)
          stopIndex.current = Math.max(stopIndex.current, index)
        }

        const data = items[index],
          key = itemKey(data, index),
          observerStyle = getCachedItemStyle(
            itemPositioner.columnWidth,
            left,
            top
          )
        children.push(
          __reactCreateElement__(
            itemAs,
            {
              key,
              ref: setItemRef(index),
              role: itemRole,
              style:
                typeof itemStyle === 'object' && itemStyle !== null
                  ? assignUserItemStyle(observerStyle, itemStyle)
                  : observerStyle,
            },
            __reactCreateElement__(render, {
              key,
              index,
              data,
              width: itemPositioner.columnWidth,
            })
          )
        )
      }
    )

    if (
      shortestColumnSize < scrollTop + overscanBy &&
      measuredCount < itemCount
    ) {
      const batchSize = Math.min(
        itemCount - measuredCount,
        Math.ceil(
          ((scrollTop + overscanBy - shortestColumnSize) / itemHeightEstimate) *
            itemPositioner.columnCount
        )
      )
      let index = measuredCount

      for (; index < measuredCount + batchSize; index++) {
        const data = items[index],
          key = itemKey(data, index),
          observerStyle = getCachedSize(itemPositioner.columnWidth)
        children.push(
          __reactCreateElement__(
            itemAs,
            {
              key,
              ref: setItemRef(index),
              role: itemRole,
              style:
                typeof itemStyle === 'object' && itemStyle !== null
                  ? assignUserItemStyle(observerStyle, itemStyle)
                  : observerStyle,
            },
            __reactCreateElement__(render, {
              key,
              index,
              data,
              width: itemPositioner.columnWidth,
            })
          )
        )
      }
    } // gets the container style object based upon the estimated height and whether or not
    // the page is being scrolled

    const containerStyle = getContainerStyle(
      isScrolling,
      positionCache.estimateTotalHeight(
        itemCount,
        itemPositioner.columnCount,
        itemHeightEstimate
      )
    )
    return __reactCreateElement__(as, {
      ref: containerRef,
      id,
      key: didMount.current,
      role,
      className,
      tabIndex,
      style:
        typeof style === 'object' && style !== null
          ? assignUserStyle(containerStyle, style)
          : containerStyle,
      children,
    })
  }
)
FreeMasonry.propTypes = {
  columnWidth: _pt.number,
  columnGutter: _pt.number,
  columnCount: _pt.number,
  as: _pt.any,
  id: _pt.string,
  className: _pt.string,
  role: _pt.string,
  tabIndex: _pt.oneOfType([_pt.number, _pt.string]),
  items: _pt.arrayOf(_pt.any).isRequired,
  itemAs: _pt.any,
  itemHeightEstimate: _pt.number,
  itemKey: _pt.func,
  overscanBy: _pt.number,
  onRender: _pt.func,
  render: _pt.any.isRequired,
  width: _pt.number.isRequired,
  height: _pt.number.isRequired,
  scrollTop: _pt.number.isRequired,
  isScrolling: _pt.bool,
}
export const Masonry = /*#__PURE__*/ React.memo(
  /*#__PURE__*/ React.forwardRef((props, ref) => {
    const {width, height, scrollY, isScrolling} = useWindowScroller(
        props.initialWidth,
        props.initialHeight,
        props.windowScroller
      ),
      [rect, containerRef] = useContainerRect(width, height)
    return __reactCreateElement__(
      FreeMasonry,
      Object.assign(
        {
          width: rect.width,
          height,
          scrollTop: Math.max(0, scrollY - (rect.top + scrollY)),
          isScrolling,
          containerRef,
          ref,
        },
        props
      )
    )
  })
)
Masonry.propTypes = {
  columnWidth: _pt.number,
  columnGutter: _pt.number,
  columnCount: _pt.number,
  as: _pt.any,
  id: _pt.string,
  className: _pt.string,
  role: _pt.string,
  tabIndex: _pt.oneOfType([_pt.number, _pt.string]),
  items: _pt.arrayOf(_pt.any).isRequired,
  itemAs: _pt.any,
  itemHeightEstimate: _pt.number,
  itemKey: _pt.func,
  overscanBy: _pt.number,
  onRender: _pt.func,
  render: _pt.any.isRequired,
  initialWidth: _pt.number,
  initialHeight: _pt.number,
  windowScroller: _pt.shape({
    size: _pt.shape({
      wait: _pt.number,
    }),
    scroll: _pt.shape({
      fps: _pt.number,
    }),
  }),
}
export const List = (props) =>
  __reactCreateElement__(
    Masonry,
    Object.assign(
      {
        role: 'list',
      },
      props,
      {
        columnGutter: props.rowGutter,
        columnCount: 1,
        columnWidth: 1,
      }
    )
  )
/**
 * Returns all of the ranges within a larger range that contain unloaded rows.
 */

List.propTypes = {
  columnWidth: _pt.number,
  columnGutter: _pt.number,
  columnCount: _pt.number,
  as: _pt.any,
  id: _pt.string,
  className: _pt.string,
  role: _pt.string,
  tabIndex: _pt.oneOfType([_pt.number, _pt.string]),
  items: _pt.arrayOf(_pt.any).isRequired,
  itemAs: _pt.any,
  itemHeightEstimate: _pt.number,
  itemKey: _pt.func,
  overscanBy: _pt.number,
  onRender: _pt.func,
  render: _pt.any.isRequired,
  initialWidth: _pt.number,
  initialHeight: _pt.number,
  windowScroller: _pt.shape({
    size: _pt.shape({
      wait: _pt.number,
    }),
    scroll: _pt.shape({
      fps: _pt.number,
    }),
  }),
  rowGutter: _pt.number,
}

const scanForUnloadedRanges = (
  isItemLoaded,
  minimumBatchSize,
  items,
  totalItems,
  startIndex,
  stopIndex
) => {
  const unloadedRanges = []
  let rangeStartIndex, rangeStopIndex

  for (let index = startIndex; index <= stopIndex; index++) {
    const loaded = isItemLoaded(index, items)

    if (!loaded) {
      rangeStopIndex = index

      if (rangeStartIndex === void 0) {
        rangeStartIndex = index
      }
    } else if (rangeStopIndex !== void 0) {
      unloadedRanges.push(rangeStartIndex, rangeStopIndex)
      rangeStartIndex = rangeStopIndex = void 0
    }
  } // If :rangeStopIndex is not null it means we haven't ran out of unloaded rows.
  // Scan forward to try filling our :minimumBatchSize.

  if (rangeStopIndex !== void 0) {
    const potentialStopIndex = Math.min(
      Math.max(rangeStopIndex, rangeStartIndex + minimumBatchSize - 1),
      totalItems - 1
    )

    for (let index = rangeStopIndex + 1; index <= potentialStopIndex; index++) {
      if (!isItemLoaded(index, items)) {
        rangeStopIndex = index
      } else {
        break
      }
    }

    unloadedRanges.push(rangeStartIndex, rangeStopIndex)
  } // Check to see if our first range ended prematurely.
  // In this case we should scan backwards to try filling our :minimumBatchSize.

  if (unloadedRanges.length) {
    let firstUnloadedStart = unloadedRanges[0]
    const firstUnloadedStop = unloadedRanges[1]

    while (
      firstUnloadedStop - firstUnloadedStart + 1 < minimumBatchSize &&
      firstUnloadedStart > 0
    ) {
      const index = firstUnloadedStart - 1

      if (!isItemLoaded(index, items)) {
        unloadedRanges[0] = firstUnloadedStart = index
      } else {
        break
      }
    }
  }

  return unloadedRanges
}

const defaultIsItemLoaded = (index, items) => items[index] !== void 0

export function useInfiniteLoader(
  /**
   * Callback to be invoked when more rows must be loaded.
   * It should implement the following signature: (startIndex, stopIndex, items): Promise
   * The returned Promise should be resolved once row data has finished loading.
   * It will be used to determine when to refresh the list with the newly-loaded data.
   * This callback may be called multiple times in reaction to a single scroll event.
   */
  loadMoreItems,
  options = emptyObj
) {
  const {
    /**
     * Function responsible for tracking the loaded state of each row.
     * It should implement the following signature: (index): boolean
     */
    isItemLoaded = defaultIsItemLoaded,

    /**
     * Minimum number of rows to be loaded at a time.
     * This property can be used to batch requests to reduce HTTP requests.
     */
    minimumBatchSize = 16,

    /**
     * Threshold at which to pre-fetch data.
     * A threshold X means that data will start loading when a user scrolls within X rows.
     * This value defaults to 15.
     */
    threshold = 16,

    /**
     * The total number of items you'll need to eventually load (if known). This can
     * be arbitrarily high if not known.
     */
    totalItems = 9e9,
  } = options
  return useCallback(
    (startIndex, stopIndex, items) => {
      const unloadedRanges = scanForUnloadedRanges(
        isItemLoaded,
        minimumBatchSize,
        items,
        totalItems,
        Math.max(0, startIndex - threshold),
        Math.min(totalItems - 1, stopIndex + threshold)
      ) // the user is responsible for memoizing their loadMoreItems() function
      // because we don't want to make assumptions about how they want to deal
      // with `items`

      for (let i = 0; i < unloadedRanges.length - 1; ++i)
        loadMoreItems(unloadedRanges[i], unloadedRanges[++i], items)
    },
    [totalItems, minimumBatchSize, threshold, isItemLoaded]
  )
}

if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  Masonry.displayName = 'Masonry'
  FreeMasonry.displayName = 'FreeMasonry'
  List.displayName = 'List'
}
