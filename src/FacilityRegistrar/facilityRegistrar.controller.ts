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
import { CSVParser } from 'src/Helper/csv.helper';
import { FacilityGuard } from 'src/Guard/facility-access.guard';

@Controller('facility-registrar')
@UseFilters(new HttpExceptionFilter())
export class FacilityRegistrarController {
  constructor(
    private readonly facilityRegistrarService: FacilityRegistrarService,
    private readonly csvParser: CSVParser,
  ) { }

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
  @UseGuards(OktaGuard)
  @UseGuards(FacilityGuard)
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
  @UseGuards(OktaGuard)
  @UseGuards(FacilityGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Res() res, @UploadedFile() file: Express.Multer.File) {
    try {
      if (file == undefined) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'ERROR',
          message: 'Please select file!!',
        });
      }
      if (await this.csvParser.validateCSVFile(file)) {
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
