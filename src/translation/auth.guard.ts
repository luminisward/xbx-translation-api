import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(JwtService)
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;
    const { authorization } = headers;
    try {
      const decoded = await this.jwtService.verifyAsync(authorization.replace('Bearer ', ''));
      return decoded.permission > 0;
    } catch (error) {
      return false;
    }
  }
}
