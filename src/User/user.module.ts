import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserDAL } from './user.dal';
import { UserService } from './user.service';
import { UserSchema } from './user.entity';
import { CSVParser } from 'src/Helper/csv.helper';
@Module({
  imports: [MongooseModule.forFeature([{ name: 'user', schema: UserSchema }])],
  controllers: [UserController],
  providers: [UserService, UserDAL, CSVParser],
  exports: [UserService],
})
export class UserModule {}
