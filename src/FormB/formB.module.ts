import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccreditionModule } from 'src/Accredition/accredition.module';
import { FacilityStaffDAL } from 'src/FacilityStaff/facilityStaff.dal';
import { FacilityStaffSchema } from 'src/FacilityStaff/facilityStaff.entity';
import { FormAModule } from 'src/FormA/formA.module';
import { FormBController } from './formB.controller';
import { FormBDAL } from './formB.dal';
import { FormBSchema } from './formB.entity';
import { FormBService } from './formB.service';
import { UserModule } from 'src/User/user.module';
import { FormBTempModule } from 'src/FormBTempDetails/formBTemp.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'formB', schema: FormBSchema }]),
    MongooseModule.forFeature([
      { name: 'facility-staff', schema: FacilityStaffSchema },
    ]),
    forwardRef(() => AccreditionModule),
    forwardRef(() => FormAModule),
    forwardRef(() => FormBTempModule),
    forwardRef(() => UserModule),
  ],
  controllers: [FormBController],
  providers: [FormBService, FormBDAL, FacilityStaffDAL],
  exports: [FormBService],
})
export class FormBModule {}
