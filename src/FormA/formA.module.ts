import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccreditionModule } from 'src/Accredition/accredition.module';
import { FacilityRegistrarModule } from 'src/FacilityRegistrar/facilityRegistrar.module';
import { FacilityStaffDAL } from 'src/FacilityStaff/facilityStaff.dal';
import { FacilityStaffSchema } from 'src/FacilityStaff/facilityStaff.entity';
import { FormA1Module } from 'src/FormA1/formA1.module';
import { FormAController } from './formA.controller';
import { FormADAL } from './formA.dal';
import { FormASchema } from './formA.entity';
import { FormAService } from './formA.service';
import { UserModule } from 'src/User/user.module';
import { SupervisorTempDetailModule } from 'src/SupervisorTempDetails/supervisorTempDetails.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'formA', schema: FormASchema }]),
    MongooseModule.forFeature([
      { name: 'facility-staff', schema: FacilityStaffSchema },
    ]),
    forwardRef(() => AccreditionModule),
    forwardRef(() => FormA1Module),
    forwardRef(() => FacilityRegistrarModule),
    forwardRef(() => UserModule),
    forwardRef(() => SupervisorTempDetailModule),
  ],
  controllers: [FormAController],
  providers: [FormAService, FormADAL, FacilityStaffDAL],
  exports: [FormAService],
})
export class FormAModule { }
