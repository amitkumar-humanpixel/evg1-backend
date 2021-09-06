import { forwardRef, Module } from '@nestjs/common';
import { AccreditionModule } from 'src/Accredition/accredition.module';
import { UserModule } from 'src/User/user.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [forwardRef(() => AccreditionModule), forwardRef(() => UserModule)],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
