import { BadGatewayException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import * as dayjs from 'dayjs';

@Injectable()
export class FleetService {
  // This method fetches all flights from the Clear Sky API
  async fetchAllFlight() {
    try {
      const token = process.env.CLEAR_SKY_API_KEY;
      if (!token) {
        throw new InternalServerErrorException(
          'CLEAR_SKY_API_KEY is not set in .env',
        );
      }

      const body = {
        filterBy: 'ALL',
        duration: {
          d: 'custom',
          details: {
            from: '2024-01-01T00:00:00.000Z',
            to: dayjs().toISOString(),
          },
        },
        sourceLocation: 'ALL',
        page: 1,
        itemPerPage: 100000,
      };

      const response = await fetch(
        'https://test.clearsky.techeagle.org/flight/get_all_flights',
        {
          method: 'POST',
          headers: {
            authorization: `${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new InternalServerErrorException(
          `Failed to fetch drones: ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log('Fetched Drones:', data);
      return data.data;
    } catch (err) {
      console.error('Error in fetchAllDrones:', err.message);
      throw new InternalServerErrorException(
        err.message || 'Unexpected error occurred while fetching drones.',
      );
    }
  }

    // This method filters flights based on the provided query parameters.
  findMatchingDrones(query, droneArray) {
    return droneArray.filter((droneArray) =>
      Object.entries(query).every(([key, value]) => droneArray[key] === value),
    );
  }

  async flightHistoryOfDrone(req: Request, id: string) {
    try {
            if (!id) {
              throw new NotFoundException('Drone ID is not provided in the request.');
            }
                  const flightData = await this.fetchAllFlight();
                  if (!flightData || !Array.isArray(flightData)) {
                    throw new InternalServerErrorException(
                      'Failed to fetch flight data from Clear Sky.',
                    );
                  }
            
                  const query = {
                    // This query filters flight based on the provided parameters.
                    //hub_id: location,
                    drone_id: id,
                  };
            
                  const flight = this.findMatchingDrones(query, flightData); // Filter flight based on the query
            
                  if (!flight || flight.length === 0) {
                    throw new BadGatewayException(
                      `No Flight history found for drone ID ${id}.`,
                    );
                  }

                  return {
                    status: 'success',
                    message: `Flight history for drone ID ${id} fetched successfully`,
                    data: flight,
                  };

    } catch (error) {
      console.error('Error fetching flight history:', error);
      const errMsg =
        error.response?.message || error.message || 'Unknown error';
      const code = error.status || 500;
      throw new InternalServerErrorException(errMsg, code);
      
    }
  }
}
