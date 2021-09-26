import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccreditionModule } from 'src/Accredition/accredition.module';
import { FormAModule } from 'src/FormA/formA.module';
import { FormA1Schema } from 'src/FormA1/formA1.entity';
import { FormBModule } from 'src/FormB/formB.module';
import { FormA1Controller } from './formA1.controller';
import { FormA1DAL } from './formA1.dal';
import { FormA1Service } from './formA1.service';
import { UserModule } from 'src/User/user.module';
import { SupervisorTempDetailModule } from 'src/SupervisorTempDetails/supervisorTempDetails.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'formA1', schema: FormA1Schema }]),
    UserModule,
    forwardRef(() => AccreditionModule),
    forwardRef(() => UserModule),
    forwardRef(() => FormAModule),
    forwardRef(() => FormBModule),
    forwardRef(() => SupervisorTempDetailModule),
  ],
  controllers: [FormA1Controller],
  providers: [FormA1Service, FormA1DAL],
  exports: [FormA1Service],
})
export class FormA1Module { }
