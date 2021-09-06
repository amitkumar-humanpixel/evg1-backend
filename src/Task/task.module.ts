import { forwardRef, Module } from '@nestjs/common';
import { FacilityModule } from 'src/Facility/facility.module';
import { TasksService } from './task.service';

@Module({
  imports: [forwardRef(() => FacilityModule)],
  providers: [TasksService],
})
export class TasksModule {}
