import { ObjectId } from 'mongoose';
import { IAccredition } from 'src/Accredition/accredition.interface';
import { SupervisorDetailsDTOA1 } from 'src/FormA1/formA1.dto';

export interface ISupervisorTempDetails extends Document {
  _id: ObjectId;
  accreditionId: ObjectId | IAccredition;
  supervisorDetails: SupervisorDetailsDTOA1;
}
