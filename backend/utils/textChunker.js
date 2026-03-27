/**
 * Split text into chunks for better AI processing
 * @param {string} text - input text
 * @param {number} chunkSize - max length of each chunk
 * @param {number} overlap - number of characters to overlap
 * @returns {string[]} chunks
 */

export const chunkText = (text, chunkSize = 500, overlap = 50) => {
  if (!text) return [];

  const clean = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .trim();

  const paragraphs = clean
    .split(/\n{1,2}/)
    .map(p => p.trim())
    .filter(Boolean);

  const chunks = [];
  let currentText = "";
  let chunkIndex = 0;

  const getOverlapWords = (txt) => {
    const words = txt.split(" ");
    return words.slice(-overlap).join(" ");
  };

  for (let para of paragraphs) {
    // Split long paragraph by words
    if (para.length >= chunkSize) {
      const words = para.split(" ");
      let buffer = "";

      for (let w of words) {
        if ((buffer + w).length > chunkSize) {
          chunks.push({
            content: buffer.trim(),
            chunkIndex: chunkIndex++,
            pageNumber: 0
          });

          const overlapText = getOverlapWords(buffer);
          buffer = overlapText + " " + w;
        } else {
          buffer += " " + w;
        }
      }

      if (buffer.trim()) {
        chunks.push({
          content: buffer.trim(),
          chunkIndex: chunkIndex++,
          pageNumber: 0
        });
      }

      continue;
    }

    // Add paragraph to current chunk
    if ((currentText + para).length <= chunkSize) {
      currentText += "\n" + para;
    } else {
      chunks.push({
        content: currentText.trim(),
        chunkIndex: chunkIndex++,
        pageNumber: 0
      });

      const overlapText = getOverlapWords(currentText);
      currentText = overlapText + "\n" + para;
    }
  }

  // Add final chunk
  if (currentText.trim()) {
    chunks.push({
      content: currentText.trim(),
      chunkIndex: chunkIndex++,
      pageNumber: 0
    });
  }

  // Fallback if no chunks created
  if (chunks.length === 0) {
    const words = clean.split(" ");
    let buffer = "";

    for (let w of words) {
      if ((buffer + w).length > chunkSize) {
        chunks.push({
          content: buffer.trim(),
          chunkIndex: chunkIndex++,
          pageNumber: 0
        });
        buffer = w;
      } else {
        buffer += " " + w;
      }
    }

    if (buffer.trim()) {
      chunks.push({
        content: buffer.trim(),
        chunkIndex: chunkIndex++,
        pageNumber: 0
      });
    }
  }

  return chunks;
};

/**
 * Find relevant chunks based on keyword matching
 * @param {Array} chunks - array of chunks
 * @param {String} query - search query
 * @param {Number} limit - max chunks to return
 */

// utils/findRelevantChunks.js (hoặc nơi bạn đang định nghĩa hàm)
export const findRelevantChunks = (chunks, query, maxChunks = 8) => {
  if (!chunks?.length || !query) return [];

  const stopWords = new Set([
    "và","là","của","cho","với","một","những","các",
    "the","is","are","to","of","in","on","at","for","a","an","and"
  ]);

  // Extract & clean query words
  const keywords = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopWords.has(w));

  if (!keywords.length) return [];

  const scored = chunks.map((chunk) => {
    const text = (chunk.content || "").toLowerCase();
    let score = 0;
    let matchCount = 0;

    for (const word of keywords) {
      if (!word) continue;
      if (text.includes(word)) {
        score += 10;
        matchCount++;
      } else {
        const partial = word.slice(0, 4);
        if (partial && text.includes(partial)) {
          score += 2; // partial match small bonus
        }
      }
    }

    // small boost when multiple keywords matched
    if (matchCount > 1) score += matchCount * 3;

    // normalize by length to prefer denser chunks
    const norm = Math.log(Math.max(text.length, 20));
    const finalScore = score / norm;

    return {
      chunkIndex: typeof chunk.chunkIndex !== "undefined" ? chunk.chunkIndex : chunk.index ?? null,
      content: chunk.content ?? "",
      pageNumber: chunk.pageNumber ?? chunk.page ?? null,
      score: finalScore,
      matchCount
    };
  });

  const results = scored
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks);

  return results;
};

