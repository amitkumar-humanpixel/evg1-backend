import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  Res,
  UseFilters,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { SupervisorRegistrationFormDTO } from 'src/SupervisorRegistrationForm/SupervisorRegistrationForm.dto';
import { ApiResponseDTO } from 'src/Common/common.dto';
import { HttpExceptionFilter } from 'src/Filter/exception.filter';
import { SupervisorRegistrationFormService } from 'src/SupervisorRegistrationForm/supervisorRegistrationForm.service';
import { SupervisorRegistrationFormGuard } from 'src/Guard/supervisorRegistrationForm.guard';
@Controller('SupervisorRegistrationForm')
@UseGuards(SupervisorRegistrationFormGuard)
@UseFilters(new HttpExceptionFilter())
export class SupervisorRegistrationFormController {
  constructor(
    private readonly SupervisorRegistrationFormService: SupervisorRegistrationFormService,
  ) {}
  @Post('submitDetail/:userId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async submitPracticeManagerDetail(
    @Res() res,
    @Param('userId') userId: number,
    @Body() supervisor: SupervisorRegistrationFormDTO,
  ) {
    try {
      await this.SupervisorRegistrationFormService.getUserDetails(
        userId,
        supervisor.email,
        supervisor.firstName,
        supervisor.lastName,
        supervisor.practiceName,
      );
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse('SUCCESS', 'Mail sent successfully!!'),
        );
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }
}
