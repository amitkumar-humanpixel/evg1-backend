import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccreditionModule } from 'src/Accredition/accredition.module';
import { FacilityStaffModule } from 'src/FacilityStaff/facilityStaff.module';
import { CSVParser } from 'src/Helper/csv.helper';
import { FacilityController } from './facility.controller';
import { FacilityDAL } from './facility.dal';
import { FacilitySchema } from './facility.entity';
import { FacilityService } from './facility.service';
import { UserModule } from 'src/User/user.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'facility', schema: FacilitySchema }]),
    forwardRef(() => AccreditionModule),
    forwardRef(() => FacilityStaffModule),
    forwardRef(() => UserModule),
  ],
  controllers: [FacilityController],
  providers: [FacilityService, FacilityDAL, CSVParser],
  exports: [FacilityService],
})
export class FacilityModule {}
