import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { FacilityRegistrarDTO } from './facilityRegistrar.dto';
import { FacilityRegistrarService } from './facilityRegistrar.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponseDTO } from 'src/Common/common.dto';
import { OktaGuard } from 'src/Guard/okta.guard';
import { ParseObjectIdPipe } from 'src/Pipe/objectId.pipe';
import { HttpExceptionFilter } from 'src/Filter/exception.filter';

@Controller('facility-registrar')
@UseGuards(OktaGuard)
@UseFilters(new HttpExceptionFilter())
export class FacilityRegistrarController {
  constructor(
    private readonly facilityRegistrarService: FacilityRegistrarService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async addFacilityRegistrar(
    @Res() res,
    @Body() facility: FacilityRegistrarDTO,
  ) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.facilityRegistrarService.insertFacilityRegistrar(
              facility,
            ),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res.status(HttpStatus.BAD_REQUEST).json(error['message']);
    }
  }

  @Get()
  async getAllFacilityRegistrar(@Res() res, @Query() query) {
    try {
      const page = parseInt(query?.page ?? 1);
      const limit = parseInt(query?.limit ?? 10);
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.facilityRegistrarService.getAllFacilityRegistrar(
              page,
              limit,
            ),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res.status(HttpStatus.BAD_REQUEST).json(error['message']);
    }
  }

  @Get(':id')
  async getFacilityRegistrarById(
    @Res() res,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
  ) {
    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponseDTO.setResponse(
          'SUCCESS',
          await this.facilityRegistrarService.getFacilityRegistrarById(id),
        ),
      );
  }

  @Put(':id')
  async updateFacilityRegistrar(
    @Res() res,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    @Body() facility: FacilityRegistrarDTO,
  ) {
    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponseDTO.setResponse(
          'SUCCESS',
          await this.facilityRegistrarService.updateFacilityRegistrar(
            id,
            facility,
          ),
        ),
      );
  }

  @Delete(':id')
  async deleteFacilityRegistrar(
    @Res() res,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
  ) {
    await this.facilityRegistrarService.deleteFacilityRegistrar(id);
    return res.status(HttpStatus.OK).json({
      status: 'SUCCESS',
      message: 'Facility Registrar has been deleted.',
    });
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Res() res, @UploadedFile() file: Express.Multer.File) {
    try {
      if (file == undefined) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'ERROR',
          message: 'Please select file!!',
        });
      }
      if (
        file.mimetype === 'text/csv' ||
        file.mimetype === 'application/vnd.ms-excel'
      ) {
        const responseData =
          await this.facilityRegistrarService.readAndStoreFacilityRegistrar(
            file.buffer,
          );
        return res.status(HttpStatus.OK).json({
          status: 'SUCCESS',
          message: 'Facility Registrar has been uploaded successfully.',
          Data: responseData,
        });
      } else {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'ERROR',
          message: 'Please upload csv file!!',
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'ERROR',
        message: error['message'],
      });
    }
  }
}
