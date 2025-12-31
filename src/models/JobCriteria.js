import mongoose from "mongoose";

const jobSearchCriteriaSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true 
    },

    jobTitles: [String],
    industries: [String],

    experienceLevels: {
      type: [String],
      enum: [
        "Senior Director",
        "Mid Senior",
        "Associate",
        "Entry Level",
        "C-level"
      ]
    },

    mileRadius: Number,

    workType: {
      type: String,
      enum: ["ON_SITE", "REMOTE", "HYBRID"]
    },

    currentLocation: {
      city: String,
      state: String,
      country: String
    },

    companySize: {
      type: [String],
      enum: ["STARTUP", "SMALL", "MEDIUM", "LARGE"]
    },

    minimumSalary: Number,
    oteBonus: Number,

    avoid: {
      positions: [String],
      companies: [String]
    },

    travelPercentage: {
      type: Number,
      min: 0,
      max: 100
    },

    openToRelocation: Boolean,
    visaRequired: Boolean,

    notes: String
  },
  { timestamps: true }
);

export default mongoose.model("JobSearchCriteria", jobSearchCriteriaSchema);
