import * as mongoose from 'mongoose';

export const FacilitySchema = new mongoose.Schema(
  {
    facilityId: { type: Number, required: true },
    practiceName: { type: String, required: true },
    address: { type: String },
    suburb: { type: String },
    postalCode: { type: String },
    email: { type: String },
    startDate: { type: Date, required: true },
    dueDate: { type: Date },
    isDeleted: { type: Boolean, default: false },
    isMailSent: { type: Boolean, default: false },
    userId: { type: Number },
  },
  { timestamps: true },
);
