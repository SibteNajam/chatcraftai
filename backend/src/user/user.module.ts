import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { OPTIONS } from 'src/utils/jwtOptions';

@Module({
  imports: [TypeOrmModule.forFeature([User]),
  JwtModule.register(OPTIONS),
],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
