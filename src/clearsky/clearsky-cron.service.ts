import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';


import refresh from 'src/utility/update-clearsky-token';
import { ClearSkyTokenService } from './clearsky-token.service';


@Injectable()
export class ClearSkyCronService implements OnModuleInit {
  private readonly logger = new Logger(ClearSkyCronService.name);

  constructor(
    private readonly tokenService: ClearSkyTokenService, 
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.run(); // ensure it's awaited
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async run() {
    const email = this.configService.get<string>('CLEARSKY_USER');
    const password = this.configService.get<string>('CLEARSKY_PASS');

    try {
      const newToken = await refresh({ useremail: email, password });
      this.tokenService.setToken(newToken); // store in memory
    } catch (err) {
      this.logger.error(`Token refresh failed: ${err.message}`);
    }
  }
}
