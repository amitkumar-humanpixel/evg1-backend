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
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { ApiResponseDTO } from 'src/Common/common.dto';
import { HttpExceptionFilter } from 'src/Filter/exception.filter';
import { ParseObjectIdPipe } from 'src/Pipe/objectId.pipe';
import { finalCheckListDetailsDTO, SupervisorDetailsDTOA1 } from './formA1.dto';
import { FormA1Service } from './formA1.service';
import { FormA1Guard } from 'src/Guard/formA1.guard';
import { OktaGuard } from 'src/Guard/okta.guard';

@Controller('formA1')
@UseGuards(FormA1Guard)
@UseGuards(OktaGuard)
@UseFilters(new HttpExceptionFilter())
export class FormA1Controller {
  constructor(private readonly formA1Service: FormA1Service) {}

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

  // @Get('supervisors/:id')
  // async getSupervisors(
  //   @Res() res,
  //   @Param('id', ParseObjectIdPipe) id: ObjectId,
  // ) {
  //   try {
  //     return res
  //       .status(HttpStatus.OK)
  //       .json(
  //         ApiResponseDTO.setResponse(
  //           'SUCCESS',
  //           await this.formA1Service.getSupervisors(id),
  //         ),
  //       );
  //   } catch (error: any) {
  //     return res.status(HttpStatus.BAD_REQUEST).json(error['message']);
  //   }
  // }
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
        .json(ApiResponseDTO.setResponse('SUCCESS', 'Update successfully!'));
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
        .json(ApiResponseDTO.setResponse('SUCCESS', 'Update successfully!'));
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
        .json(ApiResponseDTO.setResponse('SUCCESS', 'Update successfully!'));
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
        .json(ApiResponseDTO.setResponse('SUCCESS', 'Update successfully!'));
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }
}
