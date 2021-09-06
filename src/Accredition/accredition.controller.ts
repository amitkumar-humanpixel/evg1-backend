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
  UseGuards,
  UsePipes,
  ValidationPipe,
  Headers,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { ApiResponseDTO } from 'src/Common/common.dto';
import { HttpExceptionFilter } from 'src/Filter/exception.filter';
import { OktaGuard } from 'src/Guard/okta.guard';
import { ParseObjectIdPipe } from 'src/Pipe/objectId.pipe';
import { CreateReqAccreditationDTO, PostDetailAddDTO } from './accredition.dto';
import { AccreditionService } from './accredition.service';

@Controller('accredited')
@UseFilters(new HttpExceptionFilter())
export class AccreditionController {
  constructor(private readonly accreditionService: AccreditionService) {}

  @Get(':userId')
  @UsePipes(ValidationPipe)
  async getAccreditionDetailsByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Res() res,
  ) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.accreditionService.getAccreditionDetailByUserId(userId),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Get('getAccreditionId/:userId')
  @UsePipes(ValidationPipe)
  async getAccreditionId(
    @Param('userId', ParseIntPipe) userId: number,
    @Res() res,
  ) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.accreditionService.getAccreditionIdByUserId(userId),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Post('post-detail')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updatePostDetails(@Res() res, @Body() postDetail: PostDetailAddDTO) {
    try {
      const accreditionId = await this.accreditionService.updateAccredition(
        postDetail,
      );
      return res
        .status(HttpStatus.OK)
        .json(ApiResponseDTO.setResponse('SUCCESS', accreditionId));
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Get('post-detail/:id')
  @UsePipes(ValidationPipe)
  async submitRegistrarDetails(
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    @Res() res,
  ) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.accreditionService.getAccreditionById(id),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }

  @Post('create-accredition')
  async createAccredition(@Res() res, @Body() body: CreateReqAccreditationDTO) {
    await this.accreditionService.createAccredition(body.facilityId);
    return res.status(HttpStatus.OK).json('DONE');
  }

  @Get('accreditionSideBar/:id')
  async getAccreditionSideBar(
    @Res() res,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    @Headers('userid') userid: number,
  ) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.accreditionService.getAccreditionSideBar(id, userid),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponseDTO.setResponse('ERROR', error['message']));
    }
  }
}
