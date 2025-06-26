import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GetAllDroneDto } from './dto/get-drone.dto';
import { throwException } from 'src/utility/throwError';
import { Request } from 'express';
@Injectable()
export class DroneService {
  private droneCache: Record<string, { data: any[]; cachedAt: number }> = {};
  private allDrones: { data: any[]; cachedAt: number } = {
    data: [],
    cachedAt: 0,
  };
  private readonly TTL = 48 * 60 * 60 * 1000; // 48 hours in milliseconds for caching
  private readonly CLEARSKY_BASE_URL = process.env.CLEAR_SKY_BACKEND_URL;

  // This method filters drones based on the provided query parameters.
  findMatchingDrones(query, droneArray) {
    return droneArray.filter((droneArray) =>
      Object.entries(query).every(([key, value]) => droneArray[key] === value),
    );
  }

  // This method fetches all drones from the Clear Sky API. It uses the API key stored in the environment variable CLEAR_SKY_API_KEY.
  async getAllDrones() {
    try {
      let token = process.env.CLEAR_SKY_API_KEY;
      if (!token) {
        throw new InternalServerErrorException(
          'API key for Clear Sky is not set in environment variables.',
        );
      }
      console.log("URL", this.CLEARSKY_BASE_URL);
      const data = await fetch(
        `${this.CLEARSKY_BASE_URL}/drone/get_all_drones`,
        {
          method: 'GET',
          headers: {
            authorization: `${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      if (!data.ok) {
        throw new InternalServerErrorException(
          `Error fetching drones: ${data.statusText}`,
        );
      }
      const response = await data.json();
       console.log('Drone data:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching drones:', error);
      if (error instanceof InternalServerErrorException) {
        throw error; // Re-throw the internal server error
      } else {
        throw new InternalServerErrorException(
          'An unexpected error occurred while fetching drones from Clearsky.',
        );
      }
    }
  }

  // This method retrieves all drones based on the provided GetAllDroneDto. It fetches data from the Clear Sky API.
  async allDrone(getAllDroneDto: GetAllDroneDto) {
    try {
      if (
        this.allDrones.data.length > 0 &&
        Date.now() - this.allDrones.cachedAt < this.TTL
      ) {
        console.log('Returning cached drone data');
        return {
          status: 'success',
          message: 'All drones fetched successfully',
          data: this.allDrones.data,
        };
      }
      const clearskyResponse = await this.getAllDrones();
      if (!clearskyResponse) {
        throw new InternalServerErrorException(
          'Failed to fetch drone data from Clear Sky.',
        );
      }
      //console.log('Drone data:', clearskyResponse);
      this.allDrones = { data: clearskyResponse, cachedAt: Date.now() }; // Cache the fetched drone data
      return {
        status: 'success',
        message: 'All drones fetched successfully',
        data: clearskyResponse,
      };
    } catch (error) {
      console.error('Error', error);
      const errMsg = error.response.message;
      const code = error.status;
      throwException(code, errMsg);
    }
  }

  // This method retrieves all commissioned drones for the given hub location. It fetches data from the Clear Sky API and chace it in local storage.
  async allCommissionedDronesAtHub(req: Request) {
    try {
      const user = req.user as { location?: string }; //get the user from the request object and assert location exists
      //console.log('User from request:', user);
      if (!user || !user.location) {
        throw new InternalServerErrorException(
          'User location is not available in the request object.',
        );
      }
      const location = user.location; // Assuming the user's location is stored in the request object
      if (!location) {
        throw new NotFoundException(
          'Location is not provided in the request.',
        );
      }

      const cache = this.droneCache[location]; // Check if the data is cached and still valid

      if (cache && Date.now() - cache.cachedAt < this.TTL) {
        console.log('Returning cached data for location:', this.droneCache);

        return {
          status: 'success',
          message: `All commissioned drones at hub location ${location} fetched successfully`,
          data: cache.data,
        };
      }
      console.log('Fetching new drone data for location:', location);
      const dronesData = await this.getAllDrones();
      if (!dronesData || !Array.isArray(dronesData)) {
        throw new InternalServerErrorException(
          'Failed to fetch drone data from Clear Sky.',
        );
      }

      const query = {
        // This query filters drones based on the provided parameters.
        hub_location: location,
        drone_phase: 'Commissioned',
      };

      const drones = this.findMatchingDrones(query, dronesData); // Filter drones based on the query

      if (!drones || drones.length === 0) {
        throw new BadGatewayException(
          `No commissioned drones found at hub location: ${location}`,
        );
      }

      this.droneCache[location] = { data: drones, cachedAt: Date.now() };
      return {
        status: 'success',
        message: `All commissioned drones at hub location ${location} fetched successfully`,
        data: drones,
      };
    } catch (error) {
      console.error('Error fetching commissioned drones:', error);
      const errMsg =
        error.response?.message || error.message || 'Unknown error';
      const code = error.status || 500;
      throwException(code, errMsg);
    }
  }

  // This method retrives all drones for the hub location which are in-flight(i.e current_flight_id field is not empty)
  async allInFlightDronesAtHub(req: Request) {
    try {
      const user = req.user as { location?: string }; //get the user from the request object and assert location exists
      if (!user || !user.location) {
        throw new InternalServerErrorException(
          'User location is not available in the request object.',
        );
      }
      const location = user.location; // Assuming the user's location is stored in the request object
      if (!location) {
        throw new NotFoundException(
          'Location is not provided in the request.',
        );
      }
      const allDronesAtHub = await this.getAllDrones();
      if (!allDronesAtHub || !Array.isArray(allDronesAtHub)) {
        throw new BadGatewayException(
          'Failed to fetch drone data from Clear Sky.',
        );
      }
      const query = {
        // This query filters drones based on the provided parameters.
        hub_location: location,
        drone_phase: 'Commissioned',
        current_flight_id: { $ne: '' }, // Filter drones that are currently in-flight
      };
      const drones = this.findMatchingDrones(query, allDronesAtHub); // Filter drones based on the query
      if (!drones || drones.length === 0) {
        throw new BadRequestException(
          `No in-flight drones found at hub location: ${location}`,
        );
      }
    } catch (error) {
      console.error('Error fetching commissioned drones:', error);
      const errMsg =
        error.response?.message || error.message || 'Unknown error';
      const code = error.status || 500;
      throwException(code, errMsg);
    }
  }
}
