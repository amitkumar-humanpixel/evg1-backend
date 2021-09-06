import * as mongoose from 'mongoose';

export const FacilityRegistrarSchema = new mongoose.Schema(
  {
    placementId: { type: Number },
    facilityId: { type: Number, ref: 'facility' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);
