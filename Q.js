// This script is part of the Radical Reactor software.
// Source: github.com/Eltaurus-Lt/Radical-Reactor

// Copyright (c) 2026 Eltaurus
// Contact: 
//     Email: Eltaurus@inbox.lt
//     GitHub: github.com/Eltaurus-Lt

// Permission is granted to use, copy, modify, and distribute this software
// for non-commercial purposes only, provided that this copyright notice and
// attribution to the original author are included in all copies and
// substantial portions of the software.

// Commercial use of this software, including incorporation into commercial
// products or services, requires prior written permission from the copyright
// holder.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

class Node {
  constructor(L, coord) {
    this.job = L;
    this.coord = coord;
    this.prev = null;
    this.next = null;
  }
}

export class Q {
  constructor() {
    this.head = null;
    this.tail = null;

    // L -> Node
    this.index = new Map();
  }

  push(L, coord) {
    const node = new Node(L, coord);

    if (!this.tail) {
      this.head = this.tail = node;  // for performance, make unsafe
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }

    this.index.set(L, node);
  }

  pull() {
    if (!this.head) return null;  // for performance, make unsafe

    const node = this.head;

    this.head = node.next;

    if (this.head) {
      this.head.prev = null;  // for performance, make unsafe
    } else {
      this.tail = null;
    }

    this.index.delete(node.L);  // for performance, make unsafe

    return node.L;
  }

  checkout() {
    return this?.head?.coord; // for performance, make unsafe
  }

  delete(L) {
    const node = this.index.get(L);
    if (!node) return;  // for performance, make unsafe

    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    this.index.delete(L);  // for performance, make unsafe
  }
}