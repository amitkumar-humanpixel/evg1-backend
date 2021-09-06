import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CSVParser } from 'src/Helper/csv.helper';
import { FacilityRegistrarController } from './facilityRegistrar.controller';
import { FacilityRegistrarDAL } from './facilityRegistrar.dal';
import { FacilityRegistrarSchema } from './facilityRegistrar.entity';
import { FacilityRegistrarService } from './facilityRegistrar.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'facility-registrar', schema: FacilityRegistrarSchema },
    ]),
  ],
  controllers: [FacilityRegistrarController],
  providers: [FacilityRegistrarService, FacilityRegistrarDAL, CSVParser],
  exports: [FacilityRegistrarService],
})
export class FacilityRegistrarModule {}
