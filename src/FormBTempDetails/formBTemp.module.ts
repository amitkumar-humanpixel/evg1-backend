import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccreditionModule } from 'src/Accredition/accredition.module';
import { FacilityStaffDAL } from 'src/FacilityStaff/facilityStaff.dal';
import { FacilityStaffSchema } from 'src/FacilityStaff/facilityStaff.entity';
import { FormAModule } from 'src/FormA/formA.module';
import { UserModule } from 'src/User/user.module';
import { FormBTempSchema } from './formBTemp.entity';
import { FormBModule } from 'src/FormB/formB.module';
import { FormBTempDAL } from './formBTemp.dal';
import { FormBTempService } from './formBTemp.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'formBTemp', schema: FormBTempSchema }]),
    MongooseModule.forFeature([
      { name: 'facility-staff', schema: FacilityStaffSchema },
    ]),
    forwardRef(() => AccreditionModule),
    forwardRef(() => FormAModule),
    forwardRef(() => UserModule),
    forwardRef(() => FormBModule),
  ],
  providers: [FormBTempService, FormBTempDAL, FacilityStaffDAL],
  exports: [FormBTempService],
})
export class FormBTempModule {}
