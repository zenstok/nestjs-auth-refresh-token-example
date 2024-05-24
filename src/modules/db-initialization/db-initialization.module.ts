import { Module } from '@nestjs/common';
import { DbInitializationService } from './db-initialization.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [DbInitializationService],
})
export class DbInitializationModule {}
