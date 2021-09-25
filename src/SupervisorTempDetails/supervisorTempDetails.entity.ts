import * as mongoose from 'mongoose';

export const SupervisorTempDetailSchema = new mongoose.Schema(
  {
    accreditionId: { type: mongoose.Schema.Types.ObjectId, ref: 'accredition' },
    supervisorDetails: {
      userId: { type: Number, ref: 'user' },
      contactNumber: { type: String },
      isPrincipalEducationSupervisor: { type: Boolean },
      categoryOfSupervisor: { type: String },
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
  },
  { timestamps: true },
);
