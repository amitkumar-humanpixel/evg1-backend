import { Global, Module } from '@nestjs/common';
import { EnvironmentsService } from './environments.service';

@Global()
@Module({
  providers: [
    {
      provide: EnvironmentsService,
      useValue: new EnvironmentsService('.env'),
    },
  ],
  exports: [EnvironmentsService],
})
export class EnvironmentsModule {}
