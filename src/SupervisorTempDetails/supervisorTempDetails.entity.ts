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
      hours: [
        {
          isChecked: { type: Boolean, default: false },
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
          status: { type: Boolean },
          filePath: { type: String },
        },
      ],
    },
  },
  { timestamps: true },
);
