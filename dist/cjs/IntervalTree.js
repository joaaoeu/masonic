"use strict";

exports.__esModule = true;
exports.default = void 0;
const RED = 0;
const BLACK = 1;
const NIL = 2;
const DELETE = 0;
const KEEP = 1;

const addInterval = (treeNode, high, index) => {
  let node = treeNode.list;
  let prevNode;

  while (node) {
    if (node.index === index) return false;
    if (high > node.high) break;
    prevNode = node;
    node = node.next;
  }

  if (!prevNode) treeNode.list = {
    index,
    high,
    next: node
  };
  if (prevNode) prevNode.next = {
    index,
    high,
    next: prevNode.next
  };
  return true;
};

const removeInterval = (treeNode, index) => {
  let node = treeNode.list;

  if (node.index === index) {
    if (node.next === null) return DELETE;
    treeNode.list = node.next;
    return KEEP;
  }

  let prevNode = node;
  node = node.next;

  while (node !== null) {
    if (node.index === index) {
      prevNode.next = node.next;
      return KEEP;
    }

    prevNode = node;
    node = node.next;
  }
};

const NULL_NODE = {
  low: 0,
  max: 0,
  high: 0,
  color: NIL,
  // @ts-ignore
  parent: undefined,
  // @ts-ignore
  right: undefined,
  // @ts-ignore
  left: undefined,
  // @ts-ignore
  list: undefined
};
NULL_NODE.parent = NULL_NODE;
NULL_NODE.left = NULL_NODE;
NULL_NODE.right = NULL_NODE;

const updateMax = node => {
  const max = node.high;
  if (node.left === NULL_NODE && node.right === NULL_NODE) node.max = max;else if (node.left === NULL_NODE) node.max = Math.max(node.right.max, max);else if (node.right === NULL_NODE) node.max = Math.max(node.left.max, max);else node.max = Math.max(Math.max(node.left.max, node.right.max), max);
};

const updateMaxUp = node => {
  let x = node;

  while (x.parent !== NULL_NODE) {
    updateMax(x.parent);
    x = x.parent;
  }
};

const rotateLeft = (tree, x) => {
  if (x.right === NULL_NODE) return;
  const y = x.right;
  x.right = y.left;
  if (y.left !== NULL_NODE) y.left.parent = x;
  y.parent = x.parent;
  if (x.parent === NULL_NODE) tree.root = y;else {
    if (x === x.parent.left) x.parent.left = y;else x.parent.right = y;
  }
  y.left = x;
  x.parent = y;
  updateMax(x);
  updateMax(y);
};

const rotateRight = (tree, x) => {
  if (x.left === NULL_NODE) return;
  const y = x.left;
  x.left = y.right;
  if (y.right !== NULL_NODE) y.right.parent = x;
  y.parent = x.parent;
  if (x.parent === NULL_NODE) tree.root = y;else {
    if (x === x.parent.right) x.parent.right = y;else x.parent.left = y;
  }
  y.right = x;
  x.parent = y;
  updateMax(x);
  updateMax(y);
};

const replaceNode = (tree, x, y) => {
  if (x.parent === NULL_NODE) tree.root = y;else if (x === x.parent.left) x.parent.left = y;else x.parent.right = y;
  y.parent = x.parent;
};

const fixRemove = (tree, x) => {
  let w;

  while (x !== NULL_NODE && x.color === BLACK) {
    if (x === x.parent.left) {
      w = x.parent.right;

      if (w.color === RED) {
        w.color = BLACK;
        x.parent.color = RED;
        rotateLeft(tree, x.parent);
        w = x.parent.right;
      }

      if (w.left.color === BLACK && w.right.color === BLACK) {
        w.color = RED;
        x = x.parent;
      } else {
        if (w.right.color === BLACK) {
          w.left.color = BLACK;
          w.color = RED;
          rotateRight(tree, w);
          w = x.parent.right;
        }

        w.color = x.parent.color;
        x.parent.color = BLACK;
        w.right.color = BLACK;
        rotateLeft(tree, x.parent);
        x = tree.root;
      }
    } else {
      w = x.parent.left;

      if (w.color === RED) {
        w.color = BLACK;
        x.parent.color = RED;
        rotateRight(tree, x.parent);
        w = x.parent.left;
      }

      if (w.right.color === BLACK && w.left.color === BLACK) {
        w.color = RED;
        x = x.parent;
      } else {
        if (w.left.color === BLACK) {
          w.right.color = BLACK;
          w.color = RED;
          rotateLeft(tree, w);
          w = x.parent.left;
        }

        w.color = x.parent.color;
        x.parent.color = BLACK;
        w.left.color = BLACK;
        rotateRight(tree, x.parent);
        x = tree.root;
      }
    }
  }

  x.color = BLACK;
};

const minimumTree = x => {
  while (x.left !== NULL_NODE) x = x.left;

  return x;
};

const fixInsert = (tree, z) => {
  let y;

  while (z.parent.color === RED) {
    if (z.parent === z.parent.parent.left) {
      y = z.parent.parent.right;

      if (y.color === RED) {
        z.parent.color = BLACK;
        y.color = BLACK;
        z.parent.parent.color = RED;
        z = z.parent.parent;
      } else {
        if (z === z.parent.right) {
          z = z.parent;
          rotateLeft(tree, z);
        }

        z.parent.color = BLACK;
        z.parent.parent.color = RED;
        rotateRight(tree, z.parent.parent);
      }
    } else {
      y = z.parent.parent.left;

      if (y.color === RED) {
        z.parent.color = BLACK;
        y.color = BLACK;
        z.parent.parent.color = RED;
        z = z.parent.parent;
      } else {
        if (z === z.parent.left) {
          z = z.parent;
          rotateRight(tree, z);
        }

        z.parent.color = BLACK;
        z.parent.parent.color = RED;
        rotateLeft(tree, z.parent.parent);
      }
    }
  }

  tree.root.color = BLACK;
};

const IntervalTree = () => {
  const tree = {
    root: NULL_NODE,
    size: 0,
    // we know these indexes are a consistent, safe way to make look ups
    // for our case so it's a solid O(1) alternative to
    // the O(log n) searchNode() in typical interval trees
    indexMap: {}
  };
  return {
    insert(low, high, index) {
      let x = tree.root;
      let y = NULL_NODE;

      while (x !== NULL_NODE) {
        y = x;
        if (low === y.low) break;
        if (low < x.low) x = x.left;else x = x.right;
      }

      if (low === y.low && y !== NULL_NODE) {
        if (!addInterval(y, high, index)) return;
        y.high = Math.max(y.high, high);
        updateMax(y);
        updateMaxUp(y);
        tree.indexMap[index] = y;
        tree.size++;
        return;
      }

      const z = {
        low,
        high,
        max: high,
        color: RED,
        parent: y,
        left: NULL_NODE,
        right: NULL_NODE,
        list: {
          index,
          high,
          next: null
        }
      };

      if (y === NULL_NODE) {
        tree.root = z;
      } else {
        if (z.low < y.low) y.left = z;else y.right = z;
        updateMaxUp(z);
      }

      fixInsert(tree, z);
      tree.indexMap[index] = z;
      tree.size++;
    },

    remove(low, high, index) {
      const z = tree.indexMap[index];
      if (z === void 0 || z.low !== low) return;
      delete tree.indexMap[index];
      const intervalResult = removeInterval(z, index);
      if (intervalResult === void 0) return;

      if (intervalResult === KEEP) {
        z.high = z.list.high;
        updateMax(z);
        updateMaxUp(z);
        tree.size--;
        return;
      }

      let y = z;
      let originalYColor = y.color;
      let x;

      if (z.left === NULL_NODE) {
        x = z.right;
        replaceNode(tree, z, z.right);
      } else if (z.right === NULL_NODE) {
        x = z.left;
        replaceNode(tree, z, z.left);
      } else {
        y = minimumTree(z.right);
        originalYColor = y.color;
        x = y.right;

        if (y.parent === z) {
          x.parent = y;
        } else {
          replaceNode(tree, y, y.right);
          y.right = z.right;
          y.right.parent = y;
        }

        replaceNode(tree, z, y);
        y.left = z.left;
        y.left.parent = y;
        y.color = z.color;
      }

      updateMax(x);
      updateMaxUp(x);
      if (originalYColor === BLACK) fixRemove(tree, x);
      tree.size--;
    },

    search(low, high, callback) {
      const stack = [tree.root];

      while (stack.length !== 0) {
        const node = stack.pop();
        if (node === NULL_NODE || low > node.max) continue;
        if (node.left !== NULL_NODE) stack.push(node.left);
        if (node.right !== NULL_NODE) stack.push(node.right);

        if (node.low <= high && node.high >= low) {
          let curr = node.list;

          while (curr !== null) {
            if (curr.high >= low) callback(curr.index, node.low);
            curr = curr.next;
          }
        }
      }
    },

    get size() {
      return tree.size;
    }

  };
};

var _default = IntervalTree;
exports.default = _default;