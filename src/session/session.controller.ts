import { BadRequestException, Controller, ForbiddenException, Get, Query } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

@Controller('session')
export class SessionController {
  constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

  @Get()
  async getJwt(@Query('username') username, @Query('password') password) {
    if (!username || !password) {
      throw new BadRequestException('Username and password required.');
    }

    const user = await this.userService.findOneByUsernameWithPassword(username);
    const hash = user.password;
    const result = await bcrypt.compare(password, hash);
    if (result) {
      const permission = user.permission;
      return await this.jwtService.signAsync({ username, permission });
    } else {
      throw new ForbiddenException('Auth failed');
    }
  }
}
