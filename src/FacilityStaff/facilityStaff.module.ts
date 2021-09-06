import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccreditionModule } from 'src/Accredition/accredition.module';
import { FacilityModule } from 'src/Facility/facility.module';
import { CSVParser } from 'src/Helper/csv.helper';
import { FacilityStaffController } from './facilityStaff.controller';
import { FacilityStaffDAL } from './facilityStaff.dal';
import { FacilityStaffSchema } from './facilityStaff.entity';
import { FacilityStaffService } from './facilityStaff.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'facility-staff', schema: FacilityStaffSchema },
    ]),
    forwardRef(() => AccreditionModule),
    forwardRef(() => FacilityModule),
  ],
  controllers: [FacilityStaffController],
  providers: [FacilityStaffService, FacilityStaffDAL, CSVParser],
  exports: [FacilityStaffService],
})
export class FacilityStaffModule {}
