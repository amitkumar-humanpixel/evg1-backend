import * as mongoose from 'mongoose';

export const FormASchema = new mongoose.Schema(
  {
    accreditionId: { type: mongoose.Schema.Types.ObjectId, ref: 'accredition' },
    isDeleted: { type: Boolean, default: false },
    practiceManagerDetail: {
      userId: { type: Number, ref: 'user' },
      contactNumber: { type: String },
      usualWorkingHours: {
        days: { type: String },
        hours: { type: String },
      },
      hours: [
        {
          days: { type: String },
          isChecked: { type: String },
          hours: { type: String },
          startTime: { type: String },
          finishTime: { type: String },
        },
      ],
    },

    registrarDetails: [
      {
        placementId: { type: Number, ref: 'facility-staff' },
        hoursDetails: [
          {
            isChecked: { type: String },
            days: { type: String },
            hours: { type: String },
            startTime: { type: String },
            finishTime: { type: String },
          },
        ],
        onCall: [
          {
            isChecked: { type: String },
            days: { type: String },
            hours: { type: String },
            startTime: { type: String },
            finishTime: { type: String },
          },
        ],
        note: { type: String },
        note1: { type: String },
        note2: { type: String },
      },
    ],
    supervisorDetails: [
      {
        userId: { type: Number, ref: 'user' },
        contactNumber: { type: String },
        categoryOfSupervisor: { type: String, required: true },
        isFormA1Complete: { type: Boolean },
        isNotify: { type: Boolean, default: false },
        college: {
          type: [String],
          enum: ['RACGP', 'ACRRM'],
        },
      },
    ],
    practiceStandards: [
      {
        title: { type: String },
        status: { type: String },
        filePath: [
          {
            fileName: { type: String },
            fileUrl: { type: String },
          },
        ],
        remarks: { type: String },
      },
    ],
    isCompleted: { type: Boolean },
    status: {
      type: String,
      enum: ['Pending', 'Complete', 'ReSubmit', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true },
);
