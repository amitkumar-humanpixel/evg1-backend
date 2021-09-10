import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseArrayPipe,
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
import {
  PracticeManagerDTO,
  PracticeStandardsDTO,
  RegistrarDetailsDTO,
  SupervisorDetailsDTO,
} from './formA.dto';
import { FormAService } from './formA.service';
import { FormAGuard } from 'src/Guard/formA.guard';
import { OktaGuard } from 'src/Guard/okta.guard';

@Controller('formA')
@UseGuards(OktaGuard)
@UseGuards(FormAGuard)
@UseFilters(new HttpExceptionFilter())
export class FormAController {
  constructor(private readonly formAService: FormAService) {}

  @Get('practiceManagers/:facilityId')
  async getPracticeManagers(
    @Res() res,
    @Param('facilityId', ParseIntPipe) id: number,
  ) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.formAService.getPracticeManagers(id),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Get('supervisors/:facilityId')
  async getSupervisors(
    @Res() res,
    @Param('facilityId', ParseIntPipe)
    id: number,
  ) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.formAService.getSupervisors(id),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Get('registrars/:facilityId')
  async getRegistrars(
    @Res() res,
    @Param('facilityId', ParseIntPipe)
    id: number,
  ) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.formAService.getRegistrarUsers(id),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Get('practice-manager/:accreditionId')
  @UsePipes(ValidationPipe)
  async getPracticeManagerData(
    @Res() res,
    @Param('accreditionId', ParseObjectIdPipe)
    id: ObjectId,
  ) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.formAService.getPracticeManagerData(id),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Post('submitPracticeManagerDetails/:id')
  @UsePipes(ValidationPipe)
  async submitPracticeManagerDetail(
    @Param('id', ParseObjectIdPipe) accreditionId: ObjectId,
    @Res() res,
    @Body() practiceManager: PracticeManagerDTO,
  ) {
    try {
      const id = await this.formAService.submitPracticeManagerDetail(
        accreditionId,
        practiceManager,
      );
      return res
        .status(HttpStatus.OK)
        .json(ApiResponseDTO.setResponse('SUCCESS', id));
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Get('standards-details/:accreditionId')
  @UsePipes(ValidationPipe)
  async getStandardsDetails(
    @Res() res,
    @Param('accreditionId', ParseObjectIdPipe)
    id: ObjectId,
  ) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.formAService.getStandardDetails(id),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Post('submitPracticeStandards/:id')
  @UsePipes(ValidationPipe)
  async submitPracticeStandards(
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    @Res() res,
    @Body(new ParseArrayPipe({ items: PracticeStandardsDTO }))
    practiceStandards: PracticeStandardsDTO[],
  ) {
    try {
      await this.formAService.submitPracticeStandards(id, practiceStandards);
      return res
        .status(HttpStatus.OK)
        .json(ApiResponseDTO.setResponse('SUCCESS', 'Update successfully!!'));
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Get('supervisors-details/:accreditionId')
  @UsePipes(ValidationPipe)
  async getSupervisorsDetails(
    @Res() res,
    @Param('accreditionId', ParseObjectIdPipe)
    id: ObjectId,
  ) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.formAService.getFormASupervisorsByAccreditionId(id),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Post('submitSupervisors/:id')
  @UsePipes(ValidationPipe)
  async submitSupervisors(
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    @Res() res,
    @Body(new ParseArrayPipe({ items: SupervisorDetailsDTO }))
    supervisors: SupervisorDetailsDTO[],
  ) {
    try {
      await this.formAService.submitSupervisors(id, supervisors);
      return res
        .status(HttpStatus.OK)
        .json(ApiResponseDTO.setResponse('SUCCESS', 'Update successfully!!'));
    } catch (error: any) {
      console.log(error);
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Get('registrar-details/:accreditionId')
  @UsePipes(ValidationPipe)
  async getRegistrarDetails(
    @Res() res,
    @Param('accreditionId', ParseObjectIdPipe)
    id: ObjectId,
  ) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.formAService.getRegistrarDetails(id),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Post('submitRegistrarDetails/:id')
  @UsePipes(ValidationPipe)
  async submitRegistrarDetails(
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    @Res() res,
    @Body(new ParseArrayPipe({ items: RegistrarDetailsDTO }))
    registrars: RegistrarDetailsDTO[],
  ) {
    try {
      await this.formAService.submitRegistrarDetails(id, registrars);
      return res
        .status(HttpStatus.OK)
        .json(ApiResponseDTO.setResponse('SUCCESS', 'Update successfully!!'));
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }
}
