import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CryptoModule } from '../crypto/crypto.module';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CryptoModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule.forFeature([User])],
})
export class UserModule {}
