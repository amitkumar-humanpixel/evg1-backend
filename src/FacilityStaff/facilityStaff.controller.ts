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
  ParseIntPipe,
  UseFilters,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { FacilityStaffDTO } from './facilityStaff.dto';
import { FacilityStaffService } from './facilityStaff.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponseDTO } from 'src/Common/common.dto';
import { OktaGuard } from 'src/Guard/okta.guard';
import { ParseObjectIdPipe } from 'src/Pipe/objectId.pipe';
import { HttpExceptionFilter } from 'src/Filter/exception.filter';

@Controller('facility-staff')
@UseFilters(new HttpExceptionFilter())
export class FacilityStaffController {
  constructor(private readonly facilityStaffService: FacilityStaffService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async addFacilityStaff(@Res() res, @Body() facility: FacilityStaffDTO) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.facilityStaffService.insertFacilityStaff(facility),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res.status(HttpStatus.BAD_REQUEST).json(error['message']);
    }
  }

  @Get()
  async getAllFacilityStaff(@Res() res, @Query() query) {
    const page = parseInt(query?.page ?? 1);
    const limit = parseInt(query?.limit ?? 10);
    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponseDTO.setResponse(
          'SUCCESS',
          await this.facilityStaffService.getAllFacilityStaff(page, limit),
        ),
      );
  }

  @Get(':id')
  async getFacilityStaffById(
    @Res() res,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
  ) {
    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponseDTO.setResponse(
          'SUCCESS',
          await this.facilityStaffService.getFacilityStaffById(id),
        ),
      );
  }

  @Get('facility/:id')
  async getFacilityStaffByfacilityId(
    @Res() res,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponseDTO.setResponse(
          'SUCCESS',
          await this.facilityStaffService.getFacilityStaffByfacilityId(id),
        ),
      );
  }

  @Put(':id')
  async updateFacilityStaff(
    @Res() res,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    @Body() facility: FacilityStaffDTO,
  ) {
    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponseDTO.setResponse(
          'SUCCESS',
          await this.facilityStaffService.updateFacilityStaff(id, facility),
        ),
      );
  }

  @Delete(':id')
  async deleteFacilityStaff(
    @Res() res,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
  ) {
    await this.facilityStaffService.deleteFacilityStaff(id);
    return res.status(HttpStatus.OK).json({
      status: 'SUCCESS',
      message: 'Facility Staff has been deleted.',
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
          await this.facilityStaffService.readAndStoreFacilityStaff(
            file.buffer,
          );
        return res.status(HttpStatus.OK).json({
          status: 'SUCCESS',
          message: 'Facility Staff has been uploaded successfully.',
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
