import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FleetModule } from './fleet/fleet.module';
import { UserModule } from './user/user.module';
import { DroneModule } from './drone/drone.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    // MongooseModule.forRoot("mongodb://localhost/testLocation"),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        console.log('🔍 MONGO_URI from configService:', uri);
        if (!uri) {
          throw new Error(
            '❌ MONGO_URI is not defined in the environment variables.',
          );
        }
        return {
          uri,
          retryAttempts: 5,
          retryDelay: 1000,
        };
      },
      inject: [ConfigService],
    }),
    FleetModule,
    UserModule,
    DroneModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
