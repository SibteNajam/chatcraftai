import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { BASE_OPTIONS, JWT_EXPIRY, JWT_REFRESH_EXPIRY, RefreshTokenPayload } from 'src/utils/jwtOptions';
import { RefreshTokenService } from './refreshToken.service';
import { JwtService } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
const path = require('path');

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {
  }  

  public async generateRefreshToken(user: User): Promise<string> {
    const token = await this.refreshTokenService.createRefreshToken(
      user,
      31556926,
    );
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      expiresIn: JWT_REFRESH_EXPIRY,
      subject: String(user.id),
      jwtid: String(token.id),
    };
    return this.jwtService.signAsync({}, opts);
  }
  public async generateAccessToken(user: User): Promise<string> {
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      subject: String(user.id),
      expiresIn: JWT_EXPIRY,
    };

    return this.jwtService.signAsync({}, opts);
  }

  async validateCredentials(user: User, password: string) {
    return this.userService.validateCredentials(user, password);
  }
  async findUserByEmail(email: string) {
    return this.userService.findUserByEmail(email);
  }
  
  async findById(id:string){
    return await this.userService.findById(id);
  }

}
