
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class ClearSkyTokenService {
  private token: string | null = null;

  setToken(token: string) {
   
    this.token = token;
     console.log('getToken called; token is:', this.token);
  }

  getToken(): string {
    if (!this.token) {
      throw new InternalServerErrorException(
        'ClearSky token not yet initialized',
      );
    }
    return this.token;
  }
}
