const Trie = require('./Trie');
const productRepository = require('../repositories/product.repository');

const trie = new Trie();
let isInitialized = false;

const initProductTrie = async () => {
    try {
        const products = await productRepository.findNames(500);
        for (const p of products) {
            trie.insert(p.name, { id: p._id, name: p.name });
        }
        isInitialized = true;
    } catch (err) {
        // Silently catch if DB not connected yet
    }
};

const searchAutocomplete = async (prefix, limit = 5) => {
    if (!isInitialized) {
        await initProductTrie();
    }
    return trie.search(prefix, limit);
};

const addProductToTrie = (product) => {
    trie.insert(product.name, { id: product._id, name: product.name });
};

module.exports = {
    initProductTrie,
    searchAutocomplete,
    addProductToTrie
};
