import * as mongoose from 'mongoose';

export const FormBSchema = new mongoose.Schema(
  {
    accreditionId: { type: mongoose.Schema.Types.ObjectId, ref: 'accredition' },
    accreditorId: { type: Number },
    formAId: { type: mongoose.Schema.Types.ObjectId, ref: 'formA' },
    formA1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'formA1' },
    userId: { type: Number, ref: 'userId' },
    isCompleted: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    classification: { type: String },
    dateOfVisit: { type: Date },
    dateOfReportComplete: { type: Date },
    accreditationWithEV: { type: Boolean, default: false },
    isNotify: { type: Boolean, default: false },
    assessment: [
      {
        title: { type: String },
        status: { type: Boolean },
      },
    ],
    applications: [
      {
        supervisorId: { type: Number, ref: 'user' },
        isFormRegistrar: { type: Boolean },
        RACGP: { type: Boolean },
        ACRRM: { type: Boolean },
        consideration: { type: Boolean },
        remarks: { type: String },
      },
    ],
    shadyOaksPractice: { type: String },

    previousIssues: { type: String },
    summery: { type: String },
    recomendationPanel: { type: String },
    reviewedBy: { type: String },
  },
  { timestamps: true },
);
