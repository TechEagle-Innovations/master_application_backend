import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ClearSkyTokenService } from './clearsky-token.service';
import { ClearSkyCronService } from './clearsky-cron.service';
//console.log('ClearSkyModule loaded');
@Global()
@Module({
  imports: [
    ConfigModule,               // so ConfigService is available
  ],
  providers: [
    ClearSkyTokenService,       // the in-memory token store
    ClearSkyCronService,        // the cron job that needs token + config
  ],
  exports: [
    ClearSkyTokenService,       // make the token store available globally
  ],
})
export class ClearSkyModule {}
