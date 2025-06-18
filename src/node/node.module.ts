import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NodeController } from './node.controller';
import { NodeService } from './node.service';
import { LocationInfo, LocationInfoSchema } from 'src/schema/location/locationInfo.schema';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: LocationInfo.name, schema: LocationInfoSchema }
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
  controllers: [NodeController],
  providers: [NodeService],
  exports: [NodeService]
})
export class NodeModule {}
