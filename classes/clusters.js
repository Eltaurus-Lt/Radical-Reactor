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

export class Clusters {
    constructor(dimensions) {
        this.cellSize = dimensions.map(dim => parseInt(dim));
        this.grid = new Map();
        this.clusterSet = new Set();
    }

    // 1. Spacial Hashmap
    _coordinates(cardL) {
        return [cardL.style.left, cardL.style.top].map(coord => parseFloat(coord || 0));
    }
    _cell(coordinates) {
        return [ Math.floor(coordinates[0] / this.cellSize[0]), Math.floor(coordinates[1] / this.cellSize[1]) ];
    }
    _coordHash(pt) {
        const X = BigInt(pt[0] >= 0 ? pt[0] : pt[0] + 0x100000000);
        const Y = BigInt(pt[1] >= 0 ? pt[1] : pt[1] + 0x100000000);
        
        return (X << 32n) | Y;
    }

    // 2. Connection Graphs
    place(cardL) {
        const [x, y] = this._coordinates(cardL);
        cardL.connections = new Set();
        cardL.cluster = null;

        const [X, Y] = this._cell([x, y]);
        const overlappingCards = [];

        // Check 3x3 neighbor cells
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                overlappingCards.push(...this._overlappingFromHash(this._coordHash([X + dx, Y + dy]), [x, y]));
            }
        }

        // Add to the grid
        this._insertIntoGrid(cardL, [X, Y], [x, y]);

        if (overlappingCards.length === 0) {
            return [];
        }

        // Update clusters

        // Find if overlapping an existing cluster
        for (const overlappingCard of overlappingCards) {
            if (overlappingCard.cluster) {
                cardL.cluster = overlappingCard.cluster;
                break;
            }
        }
        // If not, create a new one to store all the overlapping cards
        if (!cardL.cluster) {
            cardL.cluster = new Set();
            this.clusterSet.add(cardL.cluster);
        }

        cardL.cluster.add(cardL);
        const affectedClusters = new Set([cardL.cluster]);

        for (const overlappingCard of overlappingCards) {
            cardL.connections.add(overlappingCard);
            overlappingCard.connections.add(cardL);

            if (!overlappingCard.cluster) {
                cardL.cluster.add(overlappingCard);
                overlappingCard.cluster = cardL.cluster;
            } else if (overlappingCard.cluster !== cardL.cluster) {
                // Merge clusters
                const oldCluster = overlappingCard.cluster;
                for (const connectedCard of oldCluster) {
                    cardL.cluster.add(connectedCard);
                    connectedCard.cluster = cardL.cluster;
                }
                this.clusterSet.delete(oldCluster);
            }
        }

        return Array.from(affectedClusters);
    }

    remove(cardL) {
        this._removeFromCell(cardL);

        // Delete the whole cluster (remains reinserted as new clusters later)
        const originalCluster = cardL.cluster;
        if (originalCluster) {
            this.clusterSet.delete(originalCluster);
        }

        // Clean graph edges
        for (const connectedCard of cardL.connections) {
            connectedCard.connections.delete(cardL);
        }

        const affectedClusters = new Set();

        // clustering the remains
        while (cardL.connections.size > 0) {
            const connectedCard = cardL.connections.values().next().value;
            cardL.connections.delete(connectedCard);
            if (connectedCard.connections.size === 0) { // the card remains isolated
                connectedCard.cluster = null;
                continue; 
            }

            const newCluster = new Set();
            this.clusterSet.add(newCluster);
            affectedClusters.add(newCluster);

            // DFS traversal
            const stack = [connectedCard];
            while (stack.length > 0) {
                const currCard = stack.pop();
                if (newCluster.has(currCard)) continue;
                currCard.cluster = newCluster;
                newCluster.add(currCard);
                cardL.connections.delete(currCard);
                for (const nextCard of currCard.connections) {
                    stack.push(nextCard);
                }
            }
        }

        return Array.from(affectedClusters);
    }

    delete(cluster) { // skips graph recalculation and therefore more efficient than removing cards one by one
        for (const cardL of cluster) {
            // remove cards from the grid
            this._removeFromCell(cardL);
        }
        // delete the cluster record
        this.clusterSet.delete(cluster)
        return;
    }

    clusters() {
        return Array.from(this.clusterSet);
    }

    color() {
        const board = document.querySelector("board");
        const cardSet = new Set(board.querySelectorAll("card"));
        const clusterSet = this.clusters();
        window.clusters = clusterSet;
        for (let i = 0; i < clusterSet.length; i++) {
            const cluster = clusterSet[i];
            for (const card of cluster) {
                card.setAttribute("cluster", `${i}`);
                cardSet.delete(card);
            }
        }
        for (const card of cardSet) {
            card.removeAttribute("cluster");
        }
    }

    // 3.A Cell arrays (hash collisions)
    _insertIntoGrid(card, [X, Y], [x, y]) {
        const hash = this._coordHash([X, Y]);
        if (!this.grid.has(hash)) this.grid.set(hash, []);
        const cell = this.grid.get(hash);
        cell.push({ card, x, y });
    }

    _removeFromCell(cardL) {
        const [x, y] = this._coordinates(cardL);
        const [X, Y] = this._cell([x, y]);
        const hash = this._coordHash([X, Y]);

        const cell = this.grid.get(hash);
        if (cell) {
            const index = cell.findIndex(item => item.card === cardL);
            if (index !== -1) {
                cell.splice(index, 1);
            }
            if (cell.length === 0) this.grid.delete(hash);
        }
    }

    _overlappingFromHash(hash, [qx, qy]) {
        const cell = this.grid.get(hash);
        const results = [];

        if (!cell) return results;
        // Brute-force through the list
        for (let i = 0; i < cell.length; i++) {
            const candidate = cell[i];
            if (Math.abs(candidate.x - qx) < this.cellSize[0] && Math.abs(candidate.y - qy) < this.cellSize[1]) {
                results.push(candidate.card);
            }
        }
        return results;
    }
}
