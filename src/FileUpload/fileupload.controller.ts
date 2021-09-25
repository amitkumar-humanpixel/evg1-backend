import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  HttpStatus,
  Res,
  Param,
  UseFilters,
  Delete,
  Body,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { HttpExceptionFilter } from 'src/Filter/exception.filter';
import { editFileName, FileFilter } from '../Utils/file-upload.utils';
import { ObjectId } from 'mongoose';
import { FileServise } from 'src/FileUpload/fileupload.service';
import { fileDTO } from 'src/FileUpload/fileupload.dto';
import * as fs from 'fs';
@Controller('fileUploader')
@UseFilters(new HttpExceptionFilter())
export class FileUploadController {
  constructor(private readonly FileServise: FileServise) { }
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
    return res.sendFile(image, { root: './Files' });
  }

  @Delete('file/:id')
  async deleteFile(
    @Res() res,
    @Body() fileDTO: fileDTO,
    @Param('id') id: ObjectId,
  ) {
    if (fs.existsSync(fileDTO.path)) {
      fs.unlinkSync(fileDTO.path);
    }
    await this.FileServise.deleteFileService(id, fileDTO.status, fileDTO.path);
    return res.status(HttpStatus.OK).json({
      status: 'SUCCESS',
      message: 'Delete successfully.',
    });
  }
}
