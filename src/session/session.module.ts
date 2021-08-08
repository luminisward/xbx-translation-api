import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [SessionController],
})
export class SessionModule {}
