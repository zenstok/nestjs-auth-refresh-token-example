import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, {
  DatabaseConfig,
  EnvironmentVariables,
} from './config/env/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/authentication/guards/jwt-auth.guard';
import { RoleGuard } from './modules/authorization/guards/role.guard';
import { DbInitializationModule } from './modules/db-initialization/db-initialization.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { CryptoModule } from './modules/crypto/crypto.module';
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './modules/user/user.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    AuthenticationModule,
    AuthorizationModule,
    CryptoModule,
    DbInitializationModule,
    HealthModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => {
        const databaseConfig = configService.get<DatabaseConfig>('database');

        return {
          type: 'postgres',
          host: databaseConfig?.host,
          port: 5432,
          username: databaseConfig?.username,
          password: databaseConfig?.password,
          database: databaseConfig?.name,
          useUTC: databaseConfig?.timezone === 'UTC',
          autoLoadEntities: Boolean(databaseConfig?.typeormSync),
          synchronize: Boolean(databaseConfig?.typeormSync),
        };
      },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 1000,
      },
    ]),
    ScheduleModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
