import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { AccreditionModule } from './Accredition/accredition.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardModule } from './Dashboard/dashboard.module';
import { FacilityModule } from './Facility/facility.module';
import { FacilityRegistrarModule } from './FacilityRegistrar/facilityRegistrar.module';
import { FacilityStaffModule } from './FacilityStaff/facilityStaff.module';
import { FileUploadModule } from './FileUpload/fileupload.module';

import { FormAModule } from './FormA/formA.module';
import { FormA1Module } from './FormA1/formA1.module';
import { FormBModule } from './FormB/formB.module';
import { SupervisorRegistrationFormModule } from './SupervisorRegistrationForm/supervisorRegistrationForm.module';
import { SupervisorTempDetailModule } from './SupervisorTempDetails/supervisorTempDetails.module';
import { TasksModule } from './Task/task.module';
import { UserModule } from './User/user.module';

const dbOptions = {
  poolSize: 10,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `.env` }),
    MongooseModule.forRoot(process.env.MONGODB_URL, dbOptions),
    MulterModule.register({
      dest: './Files',
    }),
    ScheduleModule.forRoot(),
    TasksModule,
    FileUploadModule,
    FacilityModule,
    UserModule,
    FacilityRegistrarModule,
    FacilityStaffModule,
    AccreditionModule,
    FormAModule,
    DashboardModule,
    SupervisorTempDetailModule,
    FormA1Module,
    FormBModule,
    SupervisorRegistrationFormModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
