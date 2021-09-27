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
  UseFilters,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  Headers,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { FacilityDTO } from './facility.dto';
import { FacilityService } from './facility.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponseDTO } from 'src/Common/common.dto';
import { HttpExceptionFilter } from 'src/Filter/exception.filter';
import { ParseObjectIdPipe } from 'src/Pipe/objectId.pipe';
import { OktaGuard } from 'src/Guard/okta.guard';
import { CSVParser } from 'src/Helper/csv.helper';
import { FacilityGuard } from 'src/Guard/facility-access.guard';

@Controller('facility')
@UseGuards(OktaGuard)
@UseFilters(new HttpExceptionFilter())
export class FacilityController {
  constructor(
    private readonly facilityService: FacilityService,
    private readonly csvParser: CSVParser,
  ) { }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async addFacility(@Res() res, @Body() facility: FacilityDTO) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.facilityService.insertFacility(facility),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res.status(HttpStatus.BAD_REQUEST).json(error['message']);
    }
  }

  @Get()
  @UseGuards(FacilityGuard)
  async getAllFacilitys(@Res() res, @Query() query) {
    const page = parseInt(query?.page ?? 1);
    const limit = parseInt(query?.limit ?? 10);
    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponseDTO.setResponse(
          'SUCCESS',
          await this.facilityService.getAllFacility(page, limit),
        ),
      );
  }

  @Get(':id')
  async getFacilityById(@Res() res, @Param('id', ParseIntPipe) id: number) {
    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponseDTO.setResponse(
          'SUCCESS',
          await this.facilityService.getFacilityById(id),
        ),
      );
  }

  @Put(':id')
  async updateFacility(
    @Res() res,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    @Body() facility: FacilityDTO,
  ) {
    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponseDTO.setResponse(
          'SUCCESS',
          await this.facilityService.updateFacility(id, facility),
        ),
      );
  }

  @Delete(':id')
  async deleteFacility(
    @Res() res,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
  ) {
    await this.facilityService.deleteFacility(id);
    return res.status(HttpStatus.OK).json({
      status: 'SUCCESS',
      message: 'Facility has been deleted.',
    });
  }

  @Post('upload')
  @UseGuards(FacilityGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Headers() headers,
    @Res() res,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (file == undefined) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'ERROR',
          message: 'Please select file!!',
        });
      }
      console.log(file.mimetype);
      if (await this.csvParser.validateCSVFile(file)) {
        const responseData = await this.facilityService.readAndStoreFacility(
          file.buffer,
          parseInt(headers.userid),
        );
        await this.facilityService.convertFacilityToAccredition();
        return res.status(HttpStatus.OK).json({
          status: 'SUCCESS',
          message: 'Facility has been uploaded successfully.',
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
