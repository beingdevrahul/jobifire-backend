import mongoose from "mongoose";

const clientDocumentSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    fileName: String,
    fileType: String,
    s3Key: String,

    status: {
      type: String,
      enum: ["UPLOADED", "DELETED"],
      default: "UPLOADED"
    }
  },
  { timestamps: true }
);

export default mongoose.model("ClientDocument", clientDocumentSchema);
