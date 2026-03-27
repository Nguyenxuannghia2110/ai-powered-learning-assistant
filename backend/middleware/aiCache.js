import AiResponseCache from "../models/AiResponseCache.js";
import { hashText } from "../utils/hash.js";

/**
 * AI Cache Middleware (Universal)
 * @param {string} type summary | flashcards | quiz | chat | concept
 * @param {function} getInputText (req) => string | null
 */
export const aiCache = (type, getInputText = () => null) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id;
      const documentId = req.body.documentId || req.params.documentId;

      if (!userId || !documentId) return next();

      const inputText = getInputText(req);
      const questionHash = inputText ? hashText(inputText) : null;

      const cached = await AiResponseCache.findOne({
        userId,
        documentId,
        type,
        questionHash,
      });

      if (cached) {
        return res.status(200).json({
          success: true,
          data: cached.output,
          cached: true,
          message: "Response from cache",
        });
      }

      res.locals.aiCache = {
        type,
        questionHash,
        input: inputText,
      };

      next();
    } catch (err) {
      next(err);
    }
  };
};
