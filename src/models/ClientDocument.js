import mongoose from "mongoose";

const documentItemSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true
    },

    title: {
      type: String,
      required: true
    },

    // fileName: {
    //   type: String,
    //   required: true
    // },

    // fileType: {
    //   type: String,
    //   required: true
    // },

    s3Key: {
      type: String,
      required: true
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["UPLOADED", "DELETED"],
      default: "UPLOADED"
    },

    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const clientDocumentSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    documents: [documentItemSchema]
  },
  { timestamps: true }
);

export default mongoose.model("ClientDocument", clientDocumentSchema);
