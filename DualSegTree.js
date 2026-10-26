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

export class DualSegTree {
  constructor(domLs, downKey, upKey) {
    this.downKey = downKey;
    this.upKey = upKey;

    this.items = domLs;
    this.leaf0 = 1 << Math.ceil(Math.log2(this.items.length));
    
    // tree[2 * i] = down (left/top, max-querried), tree[2 * i + 1] = up (right/bottom, min-querried)
    this.tree = new Int32Array(this.leaf0 << 2);
       
    for (let i = 0; i < (this.leaf0 << 1); i++) {
      this.tree[i << 1] = -2147483648; // min int32
      this.tree[(i << 1) | 1] = 2147483647; // max int32
    }

    for (let i = 0; i < this.items.length; i++) {
      const L = this.items[i];
      L.index = i;
    }

    this.flush();
  }

  query(key, threshold) {
    const result = [];
    const stack = new Int32Array(32); 
    let top = 0; // stack end
    const dir = key === this.downKey ? 0 : 1;
    const cf = (key === this.downKey ? (val => val > threshold) : (val => val < threshold));

    if (cf(this.tree[2 | dir])) stack[top++] = 1; // the first two tree elements are purely structural and never used

    while (top > 0) {
      const current = stack[--top];
      if (current >= this.leaf0) { // reached a leaf
        result.push(this.items[current - this.leaf0]);
        continue;
      }
      const leftChild = current << 1;
      const rightChild = leftChild + 1;
      if (cf(this.tree[(leftChild << 1) | dir])) stack[top++] = leftChild;
      if (cf(this.tree[(rightChild << 1) | dir])) stack[top++] = rightChild;
    }
    return result;
  }

  update(L) { // reindex path to the specified element
    let current = (this.leaf0 + L.index) << 1; // tree node, starting at the leaf
    this.tree[current] = L[this.downKey];
    this.tree[current | 1] = L[this.upKey];

    while (current > 3) {
      current = (current >> 1) & ~1;
      const leftChild = current << 1;
      const rightChild = leftChild + 2;

      this.tree[current] = Math.max(this.tree[leftChild], this.tree[rightChild]);
      this.tree[current | 1] = Math.min(this.tree[leftChild | 1], this.tree[rightChild | 1]);
    }
  }

  flush() { // complete tree (re)indexing
    for (let i = 0; i < this.items.length; i++) {
      const L = this.items[i];
      const leaf = (this.leaf0 + i) << 1;
      this.tree[leaf] = L[this.downKey];
      this.tree[leaf | 1] = L[this.upKey];
    }

    for (let i = this.leaf0 - 1; i > 0; i--) {
      const current = i << 1;
      const leftChild = current << 1;
      const rightChild = leftChild + 2;

      this.tree[current] = Math.max(this.tree[leftChild], this.tree[rightChild]);
      this.tree[current | 1] = Math.min(this.tree[leftChild | 1], this.tree[rightChild | 1]);
    }
  }
}
