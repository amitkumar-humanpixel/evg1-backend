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
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { ApiResponseDTO } from 'src/Common/common.dto';
import { HttpExceptionFilter } from 'src/Filter/exception.filter';
import { ParseObjectIdPipe } from 'src/Pipe/objectId.pipe';
import { AssignAccreditorDetailDTO, OtherDetailsDTO, SummaryDTO } from './formB.dto';
import { FormBService } from './formB.service';
import { FormBGuard } from 'src/Guard/formB.guard';
import { OktaGuard } from 'src/Guard/okta.guard';

@Controller('formB')
@UseFilters(new HttpExceptionFilter())
@UseGuards(FormBGuard)
export class FormBController {
  constructor(private readonly formBService: FormBService) {}

  @Get('supervisors/:id')
  async getSupervisors(
    @Res() res,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
  ) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.formBService.getSupervisors(id),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res.status(HttpStatus.BAD_REQUEST).json(error['message']);
    }
  }

  @Get('accreditor/:facilityId')
  async getAccreditor(@Res() res, @Param('facilityId') faclierId: number) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.formBService.getAccreditors(faclierId),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res.status(HttpStatus.BAD_REQUEST).json(error['message']);
    }
  }

  @Get('getSummary/:id')
  async getSummary(@Res() res, @Param('id', ParseObjectIdPipe) id: ObjectId) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.formBService.getSummary(id),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res.status(HttpStatus.BAD_REQUEST).json(error['message']);
    }
  }

  @Get('getOtherDetails/:id')
  async getOtherDetails(
    @Res() res,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
  ) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.formBService.getOtherDetails(id),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res.status(HttpStatus.BAD_REQUEST).json(error['message']);
    }
  }

  @Get('getAccreditor/:id')
  async getAccreditorDetails(
    @Res() res,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
  ) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.formBService.getAccreditorDetails(id),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res.status(HttpStatus.BAD_REQUEST).json(error['message']);
    }
  }

  @Post('submitAssignedAccriditor/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async submitAssignedAccriditor(
    @Res() res,
    @Body() accreditor: AssignAccreditorDetailDTO,
    @Param('id', ParseObjectIdPipe) accreditionId: ObjectId,
  ) {
    try {
      await this.formBService.submitAssignedAccriditor(
        accreditionId,
        accreditor,
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
  @Post('submitSummary/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async submitSummary(
    @Res() res,
    @Body() summary: SummaryDTO,
    @Param('id', ParseObjectIdPipe) accreditionId: ObjectId,
  ) {
    try {
      await this.formBService.submitSummary(accreditionId, summary);
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

  @Post('submitOtherDetails/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async submitOtherDetails(
    @Res() res,
    @Body() otherDetails: OtherDetailsDTO,
    @Param('id', ParseObjectIdPipe) accreditionId: ObjectId,
  ) {
    try {
      await this.formBService.submitOtherDetails(accreditionId, otherDetails);
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
