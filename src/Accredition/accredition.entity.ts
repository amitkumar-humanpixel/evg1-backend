import * as mongoose from 'mongoose';

export const AccreditionSchema = new mongoose.Schema(
  {
    facilityId: { type: Number, ref: 'facility' },
    address: { type: String, required: true },
    phone: { type: String },
    totalNumberGPs: { type: String },
    practiceWebsite: { type: String },
    college: {
      type: String,
      enum: ['RACGP', 'ACRRM'],
    },
    accreditationBody: {
      type: [String],
      enum: ['AGPAL', 'QPA'],
    },
    accreditationEndDate: { type: Date },
    isFormAComplete: { type: Boolean, default: false },
    isFormA1Complete: { type: Boolean, default: false },
    isFormBComplete: { type: Boolean, default: false },
    isPostDetailsComplete: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    formA: [
      {
        stepName: String,
        isComplete: { type: Boolean, default: false },
      },
    ],
    formA1: [
      {
        stepName: String,
        isComplete: { type: Boolean, default: false },
        userId: { type: String, default: '' },
      },
    ],
    formB: [
      { stepName: String, isComplete: { type: Boolean, default: false } },
    ],
    status: {
      type: String,
      enum: ['INCOMPLETE', 'PENDING', 'REVIEW', 'RESUBMIT', 'COMPLETE'],
      default: 'INCOMPLETE',
    },
    users: [{ type: String }],
  },
  { timestamps: true },
);
