import fs from "fs/promises";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { extractTextFromPDFByAPI } from "./ocrApi.js";

export const extractTextFromPDF = async (filePath) => {
  try {
    // 1. Đọc file → chuyển sang Uint8Array (fix lỗi Buffer)
    const buffer = await fs.readFile(filePath);
    const uint8Array = new Uint8Array(buffer);

    // 2. Dùng pdfjs để test xem có phải text-based hay không
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      
      let pageText = "";
      let lastItem = null;
      
      for (const item of content.items) {
        if (!item.str) continue;
        
        if (lastItem) {
          const prevX = lastItem.transform[4];
          const prevY = lastItem.transform[5];
          const currX = item.transform[4];
          const currY = item.transform[5];
          
          if (Math.abs(currY - prevY) > 5) {
            pageText += "\n"; // New line
          } else if (currX - (prevX + lastItem.width) > 3 && !lastItem.str.endsWith(" ") && !item.str.startsWith(" ")) {
            pageText += " "; // Add space if there is a gap
          }
        }
        pageText += item.str;
        lastItem = item;
      }
      
      text += pageText + "\n\f";
    }

    // ✅ Nếu PDF có text thật
    if (text.trim()) {
      console.log("✅ PDF text-based detected");
      return { status: "ready", text };
    }

    // ⚠️ Không có text → dùng OCR API
    console.log("📸 Scan PDF detected → using OCR API...");
    const apiText = await extractTextFromPDFByAPI(filePath);

    return apiText
      ? { status: "ready", text: apiText }
      : { status: "failed", text: "" };
  } catch (err) {
    // Nếu pdfjs lỗi → fallback sang OCR API
    console.log("⚠ pdfjs failed → using OCR API...");
    const apiText = await extractTextFromPDFByAPI(filePath);

    return apiText
      ? { status: "ready", text: apiText }
      : { status: "failed", text: "" };
  }
};
