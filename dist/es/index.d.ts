import React from 'react';
export interface WindowScrollerOptions {
    size?: {
        wait?: number;
    };
    scroll?: {
        fps?: number;
    };
}
export interface WindowScrollerResult {
    width: number;
    height: number;
    scrollY: number;
    isScrolling: boolean;
}
export declare const useWindowScroller: (initialWidth?: number, initialHeight?: number, options?: WindowScrollerOptions) => WindowScrollerResult;
interface ContainerRect {
    top: number;
    width: number;
}
export declare const useContainerRect: (windowWidth: number, windowHeight: number) => [ContainerRect, (element: HTMLElement) => void];
export interface MasonryPropsBase {
    readonly columnWidth?: number;
    readonly columnGutter?: number;
    readonly columnCount?: number;
    readonly as?: any;
    readonly id?: string;
    readonly className?: string;
    readonly style?: React.CSSProperties;
    readonly role?: string;
    readonly tabIndex?: number | string;
    readonly items: any[];
    readonly itemAs?: any;
    readonly itemStyle?: React.CSSProperties;
    readonly itemHeightEstimate?: number;
    readonly itemKey?: (data: any, index: number) => string | number;
    readonly overscanBy?: number;
    readonly onRender?: (startIndex: number, stopIndex: number | undefined, items: any[]) => void;
    readonly render: any;
}
export interface FreeMasonryProps extends MasonryPropsBase {
    readonly width: number;
    readonly height: number;
    readonly scrollTop: number;
    readonly isScrolling?: boolean;
    readonly containerRef?: ((element: HTMLElement) => void) | React.MutableRefObject<HTMLElement | null>;
}
export declare const FreeMasonry: React.FC<FreeMasonryProps>;
export interface MasonryProps extends MasonryPropsBase {
    readonly initialWidth?: number;
    readonly initialHeight?: number;
    readonly windowScroller?: WindowScrollerOptions;
}
export declare const Masonry: React.FC<MasonryProps>;
export interface ListProps extends MasonryProps {
    columnGutter?: never;
    columnCount?: never;
    columnWidth?: never;
    rowGutter?: number;
}
export declare const List: React.FC<ListProps>;
export interface InfiniteLoaderOptions {
    isItemLoaded?: (index: number, items: any[]) => boolean;
    minimumBatchSize?: number;
    threshold?: number;
    totalItems?: number;
}
export interface LoadMoreItemsCallback {
    (startIndex: number, stopIndex: number, items: any[]): void;
}
export declare function useInfiniteLoader<T extends LoadMoreItemsCallback>(
/**
 * Callback to be invoked when more rows must be loaded.
 * It should implement the following signature: (startIndex, stopIndex, items): Promise
 * The returned Promise should be resolved once row data has finished loading.
 * It will be used to determine when to refresh the list with the newly-loaded data.
 * This callback may be called multiple times in reaction to a single scroll event.
 */
loadMoreItems: T, options?: InfiniteLoaderOptions): LoadMoreItemsCallback;
export {};
