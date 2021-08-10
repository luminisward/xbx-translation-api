import { Body, Controller, Delete, Get, Headers, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const { password } = createUserDto;
    createUserDto.password = await bcrypt.hash(password, 10);
    await this.userService.create(createUserDto);
    return 'Success';
  }

  @Get()
  async getSelf(@Headers('authorization') jwt) {
    const decoded = await this.jwtService.verifyAsync(jwt.replace('Bearer ', ''));
    return this.userService.findOneByUsername(decoded.username);
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.userService.findOneByUsername(username);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
