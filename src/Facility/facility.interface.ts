import { ObjectId } from 'mongoose';

export interface IFacility extends Document {
  _id: ObjectId;
  facilityId: number;
  practiceName: string;
  address: string;
  suburb: string;
  postalCode: string;
  email: string;
  startDate: Date;
  dueDate: Date;
  isMailSent: boolean;
  userId: number;
}
