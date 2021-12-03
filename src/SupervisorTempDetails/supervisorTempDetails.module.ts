import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupervisorTempDetailSchema } from './supervisorTempDetails.entity';
import { SupervisorTempDetailService } from './supervisorTempDetails.service';
import { SupervisorTempDetailDAL } from './supervisorTempDetails.dal';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'supervisorTempDetail', schema: SupervisorTempDetailSchema },
    ]),
  ],
  providers: [SupervisorTempDetailService, SupervisorTempDetailDAL],
  exports: [SupervisorTempDetailService],
})
export class SupervisorTempDetailModule {}
