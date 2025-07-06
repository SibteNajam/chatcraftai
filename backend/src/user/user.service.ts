/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  BadRequestException,
  HttpException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { randomStr } from 'src/utils/utilities';
import { SignOptions, TokenExpiredError } from 'jsonwebtoken';
import { BASE_OPTIONS, JWT_EXPIRY, JWT_REFRESH_EXPIRY, RefreshTokenPayload } from 'src/utils/jwtOptions';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserRequest } from 'src/utils/requests';
const nodemailer = require("nodemailer");

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {
  }
  async createUser(createUserDto: RegisterUserRequest) {
    const foundUser = await this.userRepository.findOne({
      where: { email: createUserDto.email, isDeleted: false },
    });
    let user;
    if (foundUser) {
      throw new UnprocessableEntityException({
        status: 'Fail',
        data: {},
        statusCode: 422,
        message: 'User already exists with this email.'
      });
    } else {
      user = new User();
    }
    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new UnprocessableEntityException({
        status: 'Fail',
        statusCode: 422,
        message: 'Passwords do not match.',
        data: {},
      });
    }
    user.name = createUserDto.displayName;
    user.email = createUserDto.email;
    user.secretToken = randomStr();
    user.secretTokenCreatedAt = new Date();
    user.isVerified = true;
    user.password = await bcrypt.hashSync(createUserDto.password, 10);
    this.validateUser(user);
    const createdUser = await this.userRepository.save(user);
    if (!createdUser) {
      throw new UnprocessableEntityException(
        {
          status: 'Fail',
          data: {},
          statusCode: 422,
          message: 'Unable to create user. Please try again.'

        }
      );
    }
    return {
      status: 'Success',
      data: {
        user: {
          id: createdUser.id,
          email: createdUser.email,
          displayName: createdUser.name, // Map 'name' to 'displayName'
          createdAt: createdUser.createdAt.toISOString(),
        }
      },
      statusCode: 201,
      message: 'User created successfully'
    };

  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    return user;
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new UnauthorizedException({
        status: 'Fail',
        data: {},
        statusCode: 401,
        message: 'Unauthorized'
      });
    }
    return {
      status: 'Success',
      data: { data: user },
      statusCode: 200,
      message: 'User detail'
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto);
    let user = await this.userRepository.findOne({ where: { id: id } });
    return {
      status: 'Success',
      data: { data: { user: user } },
      statusCode: 200,
      message: 'User detail'
    };
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,

      },
    });
    if (user) {
      return user;
    } else {
      throw new BadRequestException({
        status: 'Fail',
        data: {},
        statusCode: 400,
        message: 'Invalid credentials.'
      });
    }
  }

  async validateCredentials(user: User, password: string) {
    return await bcrypt.compare(password, user.password);
  }

  private checkPassword(password: string) {
    if (!password) {
      throw new UnprocessableEntityException({
        status: 'Fail',
        data: {},
        statusCode: 422,
        message: 'Password is required.'
      });
    }
    // if (
    //   password.length < 6 &&
    //   !/^(?=.*[0-9])(?=.*[A-Za-z])[\w\W]{6,16}$/.test(password)
    // ) {
    //   throw new UnprocessableEntityException(
    //     'Password should be more than 6 characters and should have letters and numbers.',
    //   );
    // }
  }
  private async createHash(password: string) {
    return await bcrypt.hashSync(password, 10);
  }

  async remove(id: string) {
    let user = await this.userRepository.findOne({
      where: {
        id: id
      },
    });
    if (user) {
      //add here
      await this.userRepository.update(id, { isDeleted: true });
      return {
        status: 'Success',
        data: { data: "User Deleted" },
        statusCode: 200,
        message: 'User'
      };
    } else {
      throw new BadRequestException({
        status: 'Fail',
        data: {},
        statusCode: 401,
        message: 'User not found'
      });
    }

  }


  validateUser(user: User) {

    if (!user.email) {
      throw new UnprocessableEntityException('Email is required.');
    }
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(user.email)) {
      throw new UnprocessableEntityException(
        {
          status: 'Fail',
          data: {},
          statusCode: 422,
          message: 'A valid email address is required.'
        }
      );
    }
    this.checkPassword(user.password);
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