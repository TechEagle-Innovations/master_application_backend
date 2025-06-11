import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GetAllDroneDto } from './dto/get-drone.dto';
import { throwException } from 'src/utility/throwError';

@Injectable()
export class DroneService {
  async allDrone(getAllDroneDto: GetAllDroneDto) {
    try {
      let token = process.env.CLEAR_SKY_API_KEY;
      if (!token) {
        throw new InternalServerErrorException(
          'API key for Clear Sky is not set in environment variables.',
        );
      }
      const clearskyResponse = await fetch(
        'https://api.clearsky.com/drone/all',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      if (!clearskyResponse.ok) {
        throw new InternalServerErrorException(
          `Error fetching drones: ${clearskyResponse.statusText}`,
        );
      }
      const data = await clearskyResponse.json();
      console.log('Drone data:', data);
      return {
        status: 'success',
        message: 'All drones fetched successfully',
        data: data,
      };
    } catch (error) {
      console.error('Error', error);
      const errMsg = error.response.message;
      const code = error.status;
      throwException(code, errMsg);
    }
  }

  findAll() {
    return `This action returns all drone`;
  }

  findOne(id: number) {
    return `This action returns a #${id} drone`;
  }

  remove(id: number) {
    return `This action removes a #${id} drone`;
  }
}
