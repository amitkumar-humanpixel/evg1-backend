import { Module, forwardRef } from '@nestjs/common';
import { FileDownloaderController, FileUploadController } from './fileupload.controller';
import { FileServise } from 'src/FileUpload/fileupload.service';
import { FormAModule } from 'src/FormA/formA.module';
import { FormA1Module } from 'src/FormA1/formA1.module';

@Module({
  imports: [forwardRef(() => FormAModule), forwardRef(() => FormA1Module)],
  controllers: [FileUploadController],
  providers: [FileServise],
  exports: [FileServise],
})
export class FileUploadModule { }

@Module({
  controllers: [FileDownloaderController],
})
export class FileDownloaderModule { }