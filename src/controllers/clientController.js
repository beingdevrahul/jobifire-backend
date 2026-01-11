import ClientDocument from "../models/ClientDocument.js";
import { generateUploadUrl } from "../utils/s3.js";
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

    // if (
    //   req.user.role === "CLIENT" &&
    //   (!req.user.clientId ||
    //     req.user.clientId.toString() !== clientId.toString())
    // ) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You cannot upload documents for another client"
    //   });
    // }

    if (!fileName || !fileType) {
      return res.status(400).json({
        success: false,
        message: "fileName and fileType are required"
      });
    }

    const extension = fileName.split(".").pop().toLowerCase();

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

    return res.status(200).json({
      success: true,
      data: {
        uploadUrl,
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
    const { s3Key } = req.query;

    if (!s3Key) {
      return res.status(400).json({
        success: false,
        message: "s3Key is required"
      });
    }

    // 1️⃣ Find document inside documents array
    const clientDocument = await ClientDocument.findOne({
      "documents.s3Key": s3Key,
      "documents.status": "UPLOADED"
    });

    if (!clientDocument) {
      return res.status(404).json({
        success: false,
        message: "Document not found or deleted"
      });
    }

    // 2️⃣ Extract exact document
    const document = clientDocument.documents.find(
      (doc) => doc.s3Key === s3Key && doc.status === "UPLOADED"
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not accessible"
      });
    }

    // 3️⃣ Generate presigned view/download URL
    const viewUrl = await generateDownloadUrl(s3Key);

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

export const saveClientDocument = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { title, s3Key } = req.body;

    if (!title || !s3Key) {
      return res.status(400).json({
        success: false,
        message: "title and s3Key are required"
      });
    }

    const documentItem = {
      title,
      s3Key,
      uploadedBy: req.user.id
    };

    let clientDocument = await ClientDocument.findOne({ clientId });

    if (!clientDocument) {
      clientDocument = await ClientDocument.create({
        clientId,
        documents: [documentItem]
      });
    } else {
      clientDocument.documents.push(documentItem);
      await clientDocument.save();
    }

    const savedDocument =
      clientDocument.documents[clientDocument.documents.length - 1];

    res.status(201).json({
      success: true,
      data: savedDocument
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save document",
      error: error.message
    });
  }
};

