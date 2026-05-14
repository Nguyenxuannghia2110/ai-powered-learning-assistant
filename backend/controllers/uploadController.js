import uploadToCloudinary from "../utils/uploadToCloudinary.js";

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      "documents"
    );

    res.status(200).json({
      success: true,
      fileUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};