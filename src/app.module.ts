import { Injectable, Logger, Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { BatteryModule } from './battery/battery.module';
import { NodeModule } from './node/node.module';
import { DroneModule } from './drone/drone.module';
import { FleetModule } from './fleet/fleet.module';
import { MaintainanceModule } from './maintainance/maintainance.module';
import { ScheduleModule, Cron, CronExpression } from '@nestjs/schedule';
import refresh from 'src/utility/update-clearsky-token';


@Injectable()
class ClearSkyCronService implements OnModuleInit {
  private readonly logger = new Logger(ClearSkyCronService.name);

  constructor(private readonly cfg: ConfigService) {}

  onModuleInit() {
    return this.run();          
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  // @Cron('*/5 * * * * *') // every 5 seconds
  run() {
    const email = this.cfg.get<string>('CLEARSKY_USER');
    const password = this.cfg.get<string>('CLEARSKY_PASS');
    return refresh({ useremail: email, password }).catch(err =>
      this.logger.error(err.message),
    );
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    // MongooseModule.forRoot("mongodb://localhost/testLocation"),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        //console.log('MONGO_URI from configService:', uri);
        if (!uri) {
          throw new Error(
            'MONGO_URI is not defined in the environment variables.',
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
    UserModule,
    BatteryModule,
    NodeModule,
    DroneModule,
    FleetModule,
    MaintainanceModule,
  ],
  controllers: [AppController],
  providers: [AppService, ClearSkyCronService],
})
export class AppModule {}
