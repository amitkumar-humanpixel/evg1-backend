import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  Res,
  Param,
  UseFilters,
  Delete,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  constructor(private readonly FileServise: FileServise) {}
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './Files',
        filename: editFileName,
      }),
      fileFilter: FileFilter,
    }),
  )
  async uploadedFile(@Res() res, @UploadedFile() file) {
    const response = {
      status: 'SUCCESS',
      fileUrl: `${process.env.BASE_URL}${file.filename}`,
      filename: file.filename,
      message: 'Successfully upload.',
    };
    return res.status(HttpStatus.OK).json(response);
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
    fs.unlinkSync(fileDTO.path);
    await this.FileServise.deleteFileService(id, fileDTO.status, fileDTO.path);
    return res.status(HttpStatus.OK).json({
      status: 'SUCCESS',
      message: 'Delete successfully.',
    });
  }
}
