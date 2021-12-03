import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UseFilters,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Headers,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { ApiResponseDTO } from 'src/Common/common.dto';
import { HttpExceptionFilter } from 'src/Filter/exception.filter';
import { ParseObjectIdPipe } from 'src/Pipe/objectId.pipe';
import {
  deleteSupervisorStandardsDTO,
  finalCheckListDetailsDTO,
  standardsDetailDTO,
  SupervisorDetailsDTOA1,
} from './formA1.dto';
import { FormA1Service } from './formA1.service';
import { FormA1Guard } from 'src/Guard/formA1.guard';
import { OktaGuard } from 'src/Guard/okta.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, FileFilter } from 'src/Utils/file-upload.utils';

@Controller('formA1')
@UseGuards(FormA1Guard)
@UseGuards(OktaGuard)
@UseFilters(new HttpExceptionFilter())
export class FormA1Controller {
  constructor(private readonly formA1Service: FormA1Service) { }

  @Get('supervisors/:id/:userId')
  async getSupervisors(
    @Res() res,
    @Headers('userid') userid: number,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.formA1Service.getSupervisors(id, userId),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Get('finalCheckList/:id')
  async getFinalCheckList(
    @Res() res,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
  ) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.formA1Service.getFinalCheckList(id),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Get('getSupervisorDetail/:id/:userId')
  async getSupervisorsDetails(
    @Res() res,
    @Headers('userid') userid: number,
    @Param('id') id: ObjectId,
    @Param('userId') userId: number,
  ) {
    try {
      if (id === undefined && userId === undefined) {
        return res.status(HttpStatus.OK);
      }
      if (userId !== userid) {
        return res.status(HttpStatus.OK);
      }
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.formA1Service.getSupervisorsDetails(id, userId),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Post('submitSupervisorDetail/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async submitPracticeManagerDetail(
    @Res() res,
    @Body() supervisor: SupervisorDetailsDTOA1,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
  ) {
    try {
      await this.formA1Service.submitSupervisorDetail(id, supervisor);
      return res
        .status(HttpStatus.OK)
        .json(ApiResponseDTO.setResponse('SUCCESS', 'Updated Successfully.'));
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Post('submitTempSupervisorDetail/:id')
  async submitTempSupervisorDetail(
    @Res() res,
    @Body() supervisor: SupervisorDetailsDTOA1,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
  ) {
    try {
      await this.formA1Service.submitTempSupervisorDetail(id, supervisor);
      return res
        .status(HttpStatus.OK)
        .json(ApiResponseDTO.setResponse('SUCCESS', 'Updated Successfully.'));
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Post('submitFinalCheckList/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async submitFinalCheckList(
    @Res() res,
    @Body() finalCheckListDetails: finalCheckListDetailsDTO,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
  ) {
    try {
      await this.formA1Service.submitFinalCheckListDetails(
        id,
        finalCheckListDetails,
      );
      return res
        .status(HttpStatus.OK)
        .json(ApiResponseDTO.setResponse('SUCCESS', 'Updated Successfully.'));
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Post('resubmitForm/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async resubmitForm(@Res() res, @Param('id', ParseObjectIdPipe) id: ObjectId) {
    try {
      await this.formA1Service.resubmitForm(id);
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            'Form Re-Submitted Successfully.',
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Delete('deleteSupervisorStandardFile')
  async deleteSupervisorStandardFile(
    @Res() res,
    @Body() deleteSupervisorStandardDetails: deleteSupervisorStandardsDTO,
  ) {
    try {
      await this.formA1Service.deleteFileUpload(
        deleteSupervisorStandardDetails.supervisorId,
        deleteSupervisorStandardDetails.elementId,
        deleteSupervisorStandardDetails.fileId,
      );
      return res
        .status(HttpStatus.OK)
        .json(ApiResponseDTO.setResponse('SUCCESS', 'Deleted successfully!!'));
    } catch (error: any) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Post('file/:id/:userId')
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
  async uploadedFile(
    @Res() res,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    @Param('userId', ParseIntPipe) userId: number,
    @Body()
    practiceStandards: standardsDetailDTO,
    @UploadedFiles() files,
  ) {
    const arrResponse = [];

    files.forEach((file) => {
      const response = {
        fileUrl: `${process.env.BASE_URL}${file.filename}`,
        fileName: file.filename,
      };
      arrResponse.push(response);
    });

    const data = await this.formA1Service.submitStandardsDetails(
      id,
      userId,
      practiceStandards,
      arrResponse,
    );

    const fileResponse = {
      status: 'SUCCESS',
      data: data,
      message: 'Successfully Uploaded.',
    };

    return res.status(HttpStatus.OK).json(fileResponse);
  }
}
