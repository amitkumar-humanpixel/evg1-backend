import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true },
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
      type: String,
      enum: [
        'Practice_Manager',
        'Super_Admin',
        'Principal_Supervisor',
        'Supervisor',
      ],
      default: 'Supervisor',
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

UserSchema.virtual('roleData').get(function () {
  return this.firstName + ' ' + this.lastName;
});
