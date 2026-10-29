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

Math.seedRandom = function(seed = Date.now()) {
  const seedStr = String(seed);

  // seed expansion (xmur3)
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19); // 19 = 32 - 13
  }

  // hash step (xmur3)
  const hash = () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };

  // initialize RNG state
  let a = hash(), b = hash(), c = hash(), d = hash();

  // fast step (sfc32)
  Math.random = () => {
    let t = (a + b) | 0;

    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;

    t = (t + d) | 0;
    c = (c + t) | 0;

    return (t >>> 0) / 4294967296;
  }; 
}

Math.seedRandom();