import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, ConflictException, UnauthorizedException, NotFoundException, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { Public } from 'src/decorators/isPublic';
import { User } from 'src/user/entities/user.entity';
// import { LoginRequest } from 'src/utils/requests';
import { AuthService } from './auth.service';
import { LoginRequest } from 'src/utils/requests';
import {

  UseInterceptors,
  UploadedFile,

} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Auth Controller')
@Controller('auth')
@ApiBearerAuth('Authorization')
export class AuthController {
  constructor(
    private readonly authService: AuthService,

  ) { }


  @Public()
  @ApiBody({ type: LoginRequest })
  @Post('/login')
  public async login(@Body() body: LoginRequest) {
    const { email, password } = body;

    const user = await this.authService.findUserByEmail(email);
    if (user.isDeleted === true) {
      throw new UnauthorizedException({
        status: 'Fail',
        data: {},
        statusCode: 401,
        message: 'User not exists'
      });
    }
    if (user.isVerified === false) {
      throw new UnauthorizedException({
        status: 'Fail',
        data: {},
        statusCode: 401,
        message: 'User is not verified'
      });
    }


    if (user && user.isVerified === true) {
      const valid = user
        ? await this.authService.validateCredentials(user, password)
        : false;
      if (!valid) {
        throw new UnauthorizedException({
          status: 'Fail',
          data: {},
          statusCode: 401,
          message: 'Invalid credentials.'
        });
      }
    } else if (user && !user.isVerified) {
      throw new UnauthorizedException({
        status: 'Fail',
        data: {},
        statusCode: 401,
        message: 'User is not verified.'
      });
    } else {
      throw new UnauthorizedException({
        status: 'Fail',
        data: {},
        statusCode: 401,
        message: 'User does not exists.'
      });
    }
    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.authService.generateRefreshToken(user);

    delete user.password;
    delete user.passwordUpdatedAt;
    const payload = {
      ...this.buildResponsePayload(user, accessToken, refreshToken),

    };
    console.log('Login payload:', payload);
    return {
      status: 'Success',
      data: { data: payload },
      statusCode: 200,
      message: 'Login Succesfully'
    };
  }

  buildResponsePayload(user: User, accessToken: string, refreshToken?: string) {
    return {
      user: user,
      payload: {
        type: 'bearer',
        token: accessToken,
        ...(refreshToken ? { refresh_token: refreshToken } : {}),
      },
    };
  }
}
