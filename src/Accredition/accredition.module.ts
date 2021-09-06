import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccreditionSchema } from './accredition.entity';
import { AccreditionController } from './accredition.controller';
import { AccreditionDAL } from './accredition.dal';
import { AccreditionService } from './accredition.service';
import { FacilityDAL } from 'src/Facility/facility.dal';
import { FacilitySchema } from 'src/Facility/facility.entity';
import { UserModule } from 'src/User/user.module';
import { FacilityStaffModule } from 'src/FacilityStaff/facilityStaff.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'accredition', schema: AccreditionSchema },
    ]),
    MongooseModule.forFeature([{ name: 'facility', schema: FacilitySchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => FacilityStaffModule),
  ],
  controllers: [AccreditionController],
  providers: [AccreditionService, AccreditionDAL, FacilityDAL],
  exports: [AccreditionService],
})
export class AccreditionModule {}
