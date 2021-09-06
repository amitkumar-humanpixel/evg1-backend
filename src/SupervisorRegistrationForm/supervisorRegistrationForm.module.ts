import { forwardRef, Module } from '@nestjs/common';
import { SupervisorRegistrationFormController } from './SupervisorRegistrationForm.controller';
import { SupervisorRegistrationFormService } from 'src/SupervisorRegistrationForm/supervisorRegistrationForm.service';
import { UserModule } from 'src/User/user.module';
import { SupervisorRegistrationFormDTO } from './SupervisorRegistrationForm.dto';
import { AccreditionModule } from 'src/Accredition/accredition.module';

@Module({
  imports: [forwardRef(() => UserModule), forwardRef(() => AccreditionModule)],
  controllers: [SupervisorRegistrationFormController],
  providers: [SupervisorRegistrationFormService, SupervisorRegistrationFormDTO],
  exports: [SupervisorRegistrationFormService],
})
export class SupervisorRegistrationFormModule {}
