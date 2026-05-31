/**
 * A basic English stopword list.
 */
const STOPWORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by',
    'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of',
    'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there',
    'these', 'they', 'this', 'to', 'was', 'will', 'with'
]);

/**
 * Tokenizes a string: lowercases, removes punctuation, splits into words,
 * and removes stopwords.
 * @param {string} text
 * @returns {string[]} Array of valid tokens
 */
const tokenize = (text) => {
    if (!text) return [];
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ') // Replace punctuation with space
        .split(/\s+/) // Split on whitespace
        .filter(word => word.length > 2 && !STOPWORDS.has(word));
};

/**
 * Computes Term Frequency (TF) for a set of tokens.
 * @param {string[]} tokens
 * @returns {Object} Map of word -> frequency count
 */
const calculateTF = (tokens) => {
    const tf = {};
    if (tokens.length === 0) return tf;

    tokens.forEach(token => {
        tf[token] = (tf[token] || 0) + 1;
    });

    // Normalize TF
    const maxFreq = Math.max(...Object.values(tf));
    for (const token in tf) {
        tf[token] = tf[token] / maxFreq;
    }

    return tf;
};

/**
 * Computes Inverse Document Frequency (IDF) across a collection of documents.
 * @param {Array<string[]>} allDocuments - Array of token arrays
 * @returns {Object} Map of word -> idf score
 */
const calculateIDF = (allDocuments) => {
    const idf = {};
    const numDocs = allDocuments.length;

    // Count how many documents contain each term
    const docFrequency = {};
    allDocuments.forEach(docTokens => {
        const uniqueTokens = new Set(docTokens);
        uniqueTokens.forEach(token => {
            docFrequency[token] = (docFrequency[token] || 0) + 1;
        });
    });

    // Compute IDF
    for (const token in docFrequency) {
        // Adding 1 to avoid division by zero if token somehow is in 0 docs
        idf[token] = Math.log(numDocs / (docFrequency[token] + 1)) + 1;
    }

    return idf;
};

/**
 * Computes the final TF-IDF vector for each document in the corpus.
 * @param {Array<{ id: string, text: string }>} corpus
 * @returns {Object} { idfMap, vectors: Map<id, Object(word->score)> }
 */
const computeVectors = (corpus) => {
    // 1. Tokenize all docs
    const docs = corpus.map(doc => ({
        id: doc.id,
        tokens: tokenize(doc.text)
    }));

    // 2. Compute IDF using all docs
    const idfMap = calculateIDF(docs.map(d => d.tokens));

    // 3. Compute TF-IDF for each doc
    const vectors = {};
    docs.forEach(doc => {
        const tf = calculateTF(doc.tokens);
        const tfidf = {};
        for (const token in tf) {
            tfidf[token] = tf[token] * (idfMap[token] || 0);
        }
        vectors[doc.id] = tfidf;
    });

    return { idfMap, vectors };
};

/**
 * Computes the Cosine Similarity between two TF-IDF vectors.
 * @param {Object} vecA - Map of word -> score
 * @param {Object} vecB - Map of word -> score
 * @returns {number} Score between 0.0 and 1.0
 */
const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    const allTokens = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);

    allTokens.forEach(token => {
        const valA = vecA[token] || 0;
        const valB = vecB[token] || 0;

        dotProduct += valA * valB;
        normA += valA * valA;
        normB += valB * valB;
    });

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Generates an averaged "User Profile" vector from multiple event vectors.
 * @param {Array<Object>} eventVectors - Array of TF-IDF vectors
 * @returns {Object} Averaged vector (word -> score)
 */
const getUserProfile = (eventVectors) => {
    const profile = {};
    if (!eventVectors || eventVectors.length === 0) return profile;

    eventVectors.forEach(vec => {
        for (const [token, score] of Object.entries(vec)) {
            profile[token] = (profile[token] || 0) + score;
        }
    });

    // Average the scores
    const count = eventVectors.length;
    for (const token in profile) {
        profile[token] = profile[token] / count;
    }

    return profile;
};

module.exports = {
    tokenize,
    calculateTF,
    calculateIDF,
    computeVectors,
    cosineSimilarity,
    getUserProfile
};
