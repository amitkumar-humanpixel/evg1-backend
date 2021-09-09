import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccreditionModule } from 'src/Accredition/accredition.module';
import { UserModule } from 'src/User/user.module';
import { SupervisorTempDetailSchema } from './supervisorTempDetails.entity';
import { SupervisorTempDetailService } from './supervisorTempDetails.service';
import { SupervisorTempDetailDAL } from './supervisorTempDetails.dal';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'supervisorTempDetail', schema: SupervisorTempDetailSchema },
    ]),
    UserModule,
    forwardRef(() => AccreditionModule),
    forwardRef(() => UserModule),
  ],
  providers: [SupervisorTempDetailService, SupervisorTempDetailDAL],
  exports: [SupervisorTempDetailService],
})
export class SupervisorTempDetailModule {}
