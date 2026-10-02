class TrieNode {
    constructor() {
        this.children = {};
        this.words = []; // Store metadata or full strings here for autocomplete
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word, metadata = {}) {
        let node = this.root;
        const normalized = word.toLowerCase();
        for (const char of normalized) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
            if (node.words.length < 10) { // Keep top suggestions limit
                node.words.push({ word, ...metadata });
            }
        }
    }

    search(prefix, limit = 5) {
        let node = this.root;
        const normalized = prefix.toLowerCase();
        for (const char of normalized) {
            if (!node.children[char]) return [];
            node = node.children[char];
        }
        return node.words.slice(0, limit);
    }
}

module.exports = Trie;
