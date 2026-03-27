import crypto from "crypto";

/**
 * Hash text để làm cache key cho AI request
 * - Chuẩn hóa text để tránh cache trùng không cần thiết
 * - Dùng SHA-256 an toàn & nhanh
 */
export const hashText = (text = "") => {
  if (!text || typeof text !== "string") return null;

  const normalized = text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " "); // gộp whitespace

  return crypto
    .createHash("sha256")
    .update(normalized)
    .digest("hex");
};
