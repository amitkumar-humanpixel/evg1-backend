import * as mongoose from 'mongoose';

export const FormA1Schema = new mongoose.Schema(
  {
    accreditionId: { type: mongoose.Schema.Types.ObjectId, ref: 'accredition' },
    formAId: { type: mongoose.Schema.Types.ObjectId, ref: 'formA' },
    isDeleted: { type: Boolean, default: false },
    supervisorDetails: [
      {
        userId: { type: Number, ref: 'user' },
        contactNumber: { type: String },
        isPrincipalEducationSupervisor: { type: Boolean },
        categoryOfSupervisor: { type: String, required: true },
        educational: { type: Boolean },
        clinical: { type: Boolean },
        isAgree: { type: Boolean },
        hours: [
          {
            isChecked: { type: String },
            days: { type: String },
            hours: { type: String },
            startTime: { type: String },
            finishTime: { type: String },
          },
        ],
        isFormA1Complete: { type: Boolean },
        standardsDetail: [
          {
            title: { type: String },
            status: { type: String },
            filePath: [
              {
                fileName: { type: String },
                fileUrl: { type: String },
              },
            ],
          },
        ],
      },
    ],
    addressRecommendation: {
      recommendation: { type: String },
      actioned: { type: String },
    },
    isAddressRecommendation: { type: Boolean, default: false },
    finalCheckList: [
      {
        title: { type: String },
        status: { type: String },
      },
    ],
    isNotify: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['Pending', 'Complete', 'ReSubmit', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true },
);
