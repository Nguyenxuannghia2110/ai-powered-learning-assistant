import axios from "axios";
import FormData from "form-data";
import fs from "fs";

export const extractTextFromPDFByAPI = async (filePath) => {
  try {
    const form = new FormData();
    form.append("apikey", process.env.OCR_API_KEY);
    form.append("language", "eng");
    form.append("isOverlayRequired", "false");
    form.append("file", fs.createReadStream(filePath));

    const response = await axios.post(
      "https://api.ocr.space/parse/image",
      form,
      { headers: form.getHeaders() }
    );

    const result = response.data;

    if (!result.ParsedResults || !result.ParsedResults.length) {
      return "";
    }

    return result.ParsedResults.map(r => r.ParsedText).join("\n");
  } catch (err) {
    console.error("OCR API error:", err.message);
    return "";
  }
};
