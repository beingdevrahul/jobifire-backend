import ClientDocument from "../models/ClientDocument.js";
import { generateUploadUrl } from "../utils/s3.js";
import path from "path";
import { generateDownloadUrl } from "../utils/s3.js";

const BLOCKED_EXTENSIONS = ["zip"];
const BLOCKED_MIME_TYPES = [
  "application/zip",
  "application/x-zip-compressed",
  "multipart/x-zip"
];

export const generateClientUploadUrl = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({
        success: false,
        message: "fileName and fileType are required"
      });
    }
    const extension = path.extname(fileName).replace(".", "").toLowerCase();
    if (BLOCKED_EXTENSIONS.includes(extension)) {
      return res.status(400).json({
        success: false,
        message: "ZIP files are not allowed"
      });
    }

    
    if (BLOCKED_MIME_TYPES.includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: "ZIP files are not allowed"
      });
    }

    const { uploadUrl, key } = await generateUploadUrl({
      fileName,
      contentType: fileType,
      clientId
    });

    
    const document = await ClientDocument.create({
      clientId,
      uploadedBy: req.user.id,
      fileName,
      fileType,
      s3Key: key
    });

    res.status(200).json({
      success: true,
      data: {
        uploadUrl,
        documentId: document._id,
        s3Key: key
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate upload URL",
      error: error.message
    });
  }
};
export const getClientDocumentViewUrl = async (req, res) => {
  try {
    const { clientId, documentId } = req.params;

    // 1️⃣ Fetch document
    const document = await ClientDocument.findOne({
      _id: documentId,
      clientId,
      status: "UPLOADED"
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    
    const viewUrl = await generateDownloadUrl(document.s3Key);

    res.status(200).json({
      success: true,
      data: {
        documentId: document._id,
        fileName: document.fileName,
        fileType: document.fileType,
        viewUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate document view URL",
      error: error.message
    });
  }
};

