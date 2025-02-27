import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { Permission } from './user/entities/permission.entity';
import { Role } from './user/entities/role.entity';
import { User } from './user/entities/user.entiey';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpInterceptor } from './common/interceptor/http.interceptor';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { LoginGuard } from './common/guard/login.guard';
import { PermissionGuard } from './common/guard/permission.guard';
import { UploadModule } from './upload/upload.module';
import { MeetingRoomModule } from './meeting-room/meeting-room.module';
import { MeetingRoom } from './meeting-room/entities/meeting-room.entity';

import { BookingModule } from './booking/booking.module';
import { Booking } from './booking/entities/booking.entity';
import { StatisticModule } from './statistic/statistic.module';
import { MinioModule } from './minio/minio.module';
import { AuthModule } from './auth/auth.module';
import * as path from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('db_host'),
        port: configService.get('db_port'),
        username: configService.get('db_username'),
        password: configService.get('db_password'),
        database: configService.get('db_database'),
        synchronize: true,
        logging: true,
        entities: [User, Role, Permission, MeetingRoom, Booking],
        poolSize: 10,
        connectorPackage: 'mysql2',
        extra: {
          authPlugin: 'sha256_password',
        },
      }),
    }),
    UserModule,
    RedisModule,
    EmailModule,
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: ['src/.env'],
      envFilePath: path.join(__dirname, '.env'),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt_secret'),
        signOptions: {
          expiresIn: configService.get('jwt_access_token_expires_time'),
        },
      }),
    }),
    UploadModule,
    MeetingRoomModule,
    BookingModule,
    StatisticModule,
    MinioModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: LoginGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
