import * as mongoose from 'mongoose';

export const FacilityStaffSchema = new mongoose.Schema(
  {
    facilityContactId: { type: Number, required: true },
    facilityId: { type: Number, ref: 'facility' },
    userId: { type: Number, ref: 'user' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    practiceRole: {
      type: String,
      enum: [
        'Additional Supervisor',
        'Clinical Supervisor',
        'Educational Supervisor',
        'Practice Admin',
        'Practice Manager',
        'Principal Educational Supervisor',
        'Principal Supervisor',
      ],
      default: 'Principal Supervisor',
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);
