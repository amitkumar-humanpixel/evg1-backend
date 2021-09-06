import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { FormAService } from 'src/FormA/formA.service';
import { FormA1Service } from 'src/FormA1/formA1.service';

@Injectable()
export class FileServise {
  constructor(
    @Inject(forwardRef(() => FormAService))
    private FormAService: FormAService,
    @Inject(forwardRef(() => FormA1Service))
    private FormA1Service: FormA1Service,
  ) {}

  async deleteFileService(id: ObjectId, status: string, path: string) {
    if (status == 'practiceStandards') {
      await this.FormAService.deleteFileUpload(id, path);
    } else if (status == 'formA1') {
      await this.FormA1Service.deleteFileUpload(id, path);
    }
  }
}
