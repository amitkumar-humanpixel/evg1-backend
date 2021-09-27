import {
  BadRequestException,
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
import { UserDTO } from './user.dto';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponseDTO } from 'src/Common/common.dto';
import { OktaGuard } from 'src/Guard/okta.guard';
import { HttpExceptionFilter } from 'src/Filter/exception.filter';
import { FacilityGuard } from 'src/Guard/facility-access.guard';
import { AuthorizedGuard, UserGuard } from 'src/Guard/user.guard';
import { CSVParser } from 'src/Helper/csv.helper';

@Controller('user')
@UseGuards(OktaGuard)
@UseFilters(new HttpExceptionFilter())
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly csvParser: CSVParser,
  ) { }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async addUser(@Res() res, @Body() user: UserDTO) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(
          ApiResponseDTO.setResponse(
            'SUCCESS',
            await this.userService.insertUser(user),
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res.status(HttpStatus.BAD_REQUEST).json(error['message']);
    }
  }

  @Get()
  @UseGuards(AuthorizedGuard)
  async getAllUsers(@Res() res, @Query() query) {
    const page = parseInt(query?.page ?? 1);
    const limit = parseInt(query?.limit ?? 10);
    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponseDTO.setResponse(
          'SUCCESS',
          await this.userService.getAllUsers(page, limit),
        ),
      );
  }

  @Get(':email')
  async getUserByEmail(@Res() res, @Param('email') email: string) {
    if (email == undefined || email.length == 0 || email == null) {
      throw new BadRequestException('User does not exist!');
    }
    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponseDTO.setResponse(
          'SUCCESS',
          await this.userService.getUserByEmail(email),
        ),
      );
  }

  @Put(':id')
  async updateUser(
    @Res() res,
    @Param('id') id: ObjectId,
    @Body() user: UserDTO,
  ) {
    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponseDTO.setResponse(
          'SUCCESS',
          await this.userService.updateUser(id, user),
        ),
      );
  }

  @Delete(':id')
  async deleteUser(@Res() res, @Param('id') id: ObjectId) {
    await this.userService.deleteUser(id);
    return res.status(HttpStatus.OK).json({
      status: 'SUCCESS',
      message: 'User has been deleted.',
    });
  }

  @Post('upload')
  @UseGuards(UserGuard)
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
        const responseData = await this.userService.readAndStoreUser(
          file.buffer,
        );
        return res.status(HttpStatus.OK).json({
          status: 'SUCCESS',
          message: 'User has been uploaded successfully.',
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
