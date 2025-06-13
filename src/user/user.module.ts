import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { UserInfo, UserInfoSchema } from '../schema/user/userInfo.schema';
import jwtConfig from '../config/jwt.config';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    MongooseModule.forFeature([
      { name: UserInfo.name, schema: UserInfoSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService, AuthService, RolesGuard],
  exports: [UserService, AuthService],
})
export class UserModule {}
