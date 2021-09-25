import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccreditionSchema } from './accredition.entity';
import { AccreditionController } from './accredition.controller';
import { AccreditionDAL } from './accredition.dal';
import { AccreditionService } from './accredition.service';
import { UserModule } from 'src/User/user.module';
import { FormAModule } from 'src/FormA/formA.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'accredition', schema: AccreditionSchema },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => FormAModule),
  ],
  controllers: [AccreditionController],
  providers: [AccreditionService, AccreditionDAL],
  exports: [AccreditionService],
})
export class AccreditionModule { }
