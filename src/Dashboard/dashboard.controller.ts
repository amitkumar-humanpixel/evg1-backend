import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Query,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiResponseDTO } from 'src/Common/common.dto';
import { HttpExceptionFilter } from 'src/Filter/exception.filter';
import { OktaGuard } from 'src/Guard/okta.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(OktaGuard)
@UseFilters(new HttpExceptionFilter())
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardData(@Res() res, @Query() query) {
    const page = parseInt(query?.page ?? 1);
    const limit = parseInt(query?.limit ?? 10);
    const userId = query.userId; //parseInt(query?.userId ?? 0);
    const status = query?.status;

    if (userId == undefined || userId == null || userId == '') {
      throw new BadRequestException('Please provide userId!');
    } else if (status == null || status == undefined) {
      throw new BadRequestException('Please provide status!');
    }

    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponseDTO.setResponse(
          'SUCCESS',
          await this.dashboardService.getDashboardData(
            userId,
            page,
            limit,
            status,
          ),
        ),
      );
  }

  @Get('/status')
  async getDashboardStatusData(@Res() res, @Query() query) {
    const userId = query.userId; //parseInt(query?.userId ?? 0);

    if (userId == undefined || userId == null || userId == '') {
      throw new BadRequestException('Please provide userId!');
    }

    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponseDTO.setResponse(
          'SUCCESS',
          await this.dashboardService.getDashboardStatusDetails(userId),
        ),
      );
  }
}
