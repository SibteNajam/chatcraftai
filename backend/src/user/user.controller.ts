import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/isPublic';
import { RegisterUserRequest } from 'src/utils/requests';

@ApiBearerAuth('Authorization')
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }


  @Public()
  @Post('register-user')
  registerUser(@Body() createUserDto: RegisterUserRequest) {
    console.log('User registration hit'); // for debugging
    return this.userService.createUser(createUserDto);
  }


  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Public()

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

}
