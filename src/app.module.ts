import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './common/configs/app.config';
import authConfig from './common/configs/auth.config';
import databaseConfig from './common/configs/database.config';
import { GiftsModule } from './gift/gifts.module';

import type { StringValue } from 'ms';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions =>
        configService.getOrThrow<TypeOrmModuleOptions>('database'),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.getOrThrow<string>('auth.jwtSecret'),
        signOptions: {
          expiresIn: configService.getOrThrow<StringValue>('auth.jwtExpiresIn'),
        },
      }),
    }),
    GiftsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
