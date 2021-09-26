import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { FacilityService } from 'src/Facility/facility.service';

@Injectable()
export class TasksService {
  constructor(
    @Inject(forwardRef(() => FacilityService))
    private facilityService: FacilityService,
  ) {
    const userSyncJob = new CronJob(
      process.env.CRON_EXPRESSION,
      this.handleCron.bind(this),
      null,
      true,
      'Australia/Sydney',
    );
    userSyncJob.start();
  }

  private readonly logger = new Logger(TasksService.name);

  async handleCron() {
    console.log('cron job run');
    await this.facilityService.convertFacilityToAccredition();
  }

  async cron() {
    console.log('in');
  }
}
