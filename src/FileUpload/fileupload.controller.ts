import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  HttpStatus,
  Res,
  Param,
  UseFilters,
  UploadedFiles,
  UseGuards,
  Delete,
  Body,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { HttpExceptionFilter } from 'src/Filter/exception.filter';
import { editFileName, FileFilter } from '../Utils/file-upload.utils';
import { OktaGuard } from 'src/Guard/okta.guard';
import * as fs from 'fs';
import { FileDTO } from './fileupload.dto';

@Controller('fileUploader')
@UseGuards(OktaGuard)
@UseFilters(new HttpExceptionFilter())
export class FileUploadController {
  @Post('file')
  @UseInterceptors(
    FilesInterceptor('file', 20, {
      storage: diskStorage({
        destination: './Files',
        filename: editFileName,
      }),
      fileFilter: FileFilter,
      limits: {
        fileSize: 10485760,
      },
    }),
  )
  async uploadedFile(@Res() res, @UploadedFiles() files) {
    const arrResponse = [];

    files.forEach((file) => {
      const response = {
        fileUrl: `${process.env.BASE_URL}${file.filename}`,
        fileName: file.filename,
      };
      arrResponse.push(response);
    });

    const fileResponse = {
      status: 'SUCCESS',
      data: arrResponse,
      message: 'Successfully Uploaded.',
    };

    return res.status(HttpStatus.OK).json(fileResponse);
  }

  @Get(':imgpath')
  seeUploadedFile(@Param('imgpath') image, @Res() res) {
    res.setHeader('Content-Disposition', 'attachment; filename=' + image);
    return res.sendFile(image, { root: './Files' });
  }

}

@Controller('fileDownloader')
@UseGuards(OktaGuard)
@UseFilters(new HttpExceptionFilter())
export class FileDownloaderController {
  @Get(':imgpath')
  seeUploadedFile(@Param('imgpath') image, @Res() res) {
    res.setHeader('Content-Disposition', 'attachment; filename=' + image);
    return res.sendFile(image, { root: './Files' });
  }
}
