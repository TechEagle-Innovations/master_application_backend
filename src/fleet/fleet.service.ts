import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  RequestTimeoutException,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import * as dayjs from 'dayjs';
import { throwException } from 'src/utility/throwError';
import { ConfigService } from '@nestjs/config';
import { io, Socket } from 'socket.io-client';
import * as jwt from 'jsonwebtoken';
import { once } from 'src/utility/socket-helpers';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  FlightRecord,
  FlightRecordDocument,
} from '../schema/flight-record.schema';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClearSkyTokenService } from 'src/clearsky/clearsky-token.service';

@Injectable()
export class FleetService {
  private readonly logger = new Logger(FleetService.name);
  private droneSocket: Socket | null = null;
  private readonly CLEARSKY_BASE_URL = process.env.CLEAR_SKY_BACKEND_URL;


  constructor(
    @InjectModel(FlightRecord.name)
    private readonly flightModel: Model<FlightRecordDocument>,
    private readonly config: ConfigService,
    private readonly tokenService: ClearSkyTokenService
  ) {}

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
        `${this.CLEARSKY_BASE_URL}/flight/get_all_flights`,
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
          `Failed to fetch flight: ${response.statusText}`,
        );
      }

      const data = await response.json();
      //console.log('Fetched Drones:', data);
      return data.data;
    } catch (err) {
      console.error('Error in fetchAllDrones:', err.message);
      throw new InternalServerErrorException(
        err.message || 'Unexpected error occurred while fetching drones.',
      );
    }
  }
  // This method extracts image URLs from the checklist items.
  getImgArray(checklist: {}): string[] {
    // This method extracts image URLs from the checklist items.
    if (!checklist || typeof checklist !== 'object') {
      throw new BadRequestException('Invalid checklist data provided.');
    }
    const imgArray: string[] = [];
    Object.values(checklist).forEach((item: any) => {
      if (item && item.image) {
        imgArray.push(item.image);
      }
    });
    return imgArray;
  }

  // This method filters flights based on the provided query parameters.
  findMatchingDrones(query, droneArray) {
    return droneArray.filter((drone) => {
      if (query.$or) {
        // Return true if any of the $or conditions match
        return query.$or.some((condition) =>
          Object.entries(condition).every(
            ([key, value]) => drone[key] === value,
          ),
        );
      }

      // Fallback: match all key-value pairs in query
      return Object.entries(query).every(
        ([key, value]) => drone[key] === value,
      );
    });
  }

  // This method fetches flight history for a specific drone ID.
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
      throwException(code, errMsg);
    }
  }

  // This method fetches flight history for a specific location ID.
  async flightHistoryOfLocation(req: Request, id: string) {
    try {
      if (!id) {
        throw new NotFoundException(
          'Location ID is not provided in the request.',
        );
      }
      const flightData = await this.fetchAllFlight();
      if (!flightData || !Array.isArray(flightData)) {
        throw new InternalServerErrorException(
          'Failed to fetch flight data from Clear Sky.',
        );
      }
      console.log('Flight Data:', flightData);
      const query = {
        // This query filters flight based on the provided parameters.
        $or: [{ start_location: id }, { end_location: id }],
      };

      const flight = this.findMatchingDrones(query, flightData); // Filter flight based on the query

      if (!flight || flight.length === 0) {
        throw new BadGatewayException(
          `No Flight history found for location ID ${id}.`,
        );
      }

      return {
        status: 'success',
        message: `Flight history for location ID ${id} fetched successfully`,
        data: flight,
      };
    } catch (error) {
      console.error('Error fetching flight history:', error);
      const errMsg =
        error.response?.message || error.message || 'Unknown error';
      const code = error.status || 500;
      throwException(code, errMsg);
    }
  }

  // this method fetch the pre flight checklist from the socket io of the clearsky
  async getPreflightChecklist(userJwt: string): Promise<{
    status: string;
    message: string;
    data: any[];
  }> {
    const url = this.config.get<string>('CLEARSKY_CLIENT_SOCKET_URL');
    let socket: Socket;

    try {
      socket = io(url, {
        auth: { token: userJwt, page: 'monitor-all-drones' },
        transports: ['websocket'],
        timeout: 5000,
        reconnectionAttempts: 1,
      });

      // 1. Wait for connection or error
      try {
        await once<void>(socket, 'connect');
      } catch (err: any) {
        if (err.message.includes('Unauthorized')) {
          throw new UnauthorizedException('Invalid or expired token');
        }
        throw new InternalServerErrorException(
          `Socket connect failed: ${err.message}`,
        );
      }

      // 2. Ask for the checklist
      socket.emit('client:getPreFlightChecklistItems', {});

      // 3. Wait for the checklist or timeout
      let items: any;
      try {
        items = await once<any>(socket, 'server:setPreFlightChecklistItems');
      } catch {
        throw new RequestTimeoutException('Checklist response timed out');
      }

      console.log('Received checklist items:', items);

      //const list = Array.isArray(items) ? items : [items];

      // 5. Validate
      // if (list.length === 0) {
      //   throw new NotFoundException('No pre-flight checklist items found');
      // }

      return {
        status: 'success',
        message: 'Pre-flight checklist fetched successfully',
        data: items,
      };
    } finally {
      // 6. Always clean up
      if (socket) {
        socket.disconnect();
      }
    }
  }

  // This method is to connect to te drone socket
  async connectDrone(
    droneId: string,
  ): Promise<{ status: string; message: string }> {
    if (this.droneSocket) {
      return {
        status: 'success',
        message: 'Drone already connected',
      };
    }

    const secret = this.config.get<string>('CLEARSKY_SECRET_KEY');
    if (!secret) {
      throw new InternalServerErrorException(
        'CLEARSKY_SECRET_KEY is not set in .env',
      );
    }
    let token: string;

    try {
      token = jwt.sign({ droneId }, secret);
      //console.log('Generated drone token:', token);
    } catch (err) {
      throw new UnauthorizedException('Failed to generate drone token');
    }

    const url = this.config.get<string>('CLEARSKY_DRONE_SOCKET_URL');
    this.droneSocket = io(url, {
      auth: { token },
      transports: ['websocket'],
      timeout: 5000,
      reconnectionAttempts: 1,
    });

    try {
      await Promise.race([
        once<void>(this.droneSocket, 'connect'),
        once(this.droneSocket, 'connect_error').then(([err]) => {
          if (err.message?.toLowerCase().includes('unauthorized')) {
            throw new UnauthorizedException('Unauthorized drone connection');
          }
          throw new InternalServerErrorException(
            `Socket connection error: ${err.message}`,
          );
        }),
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(
                new RequestTimeoutException(
                  'Drone socket connection timed out',
                ),
              ),
            6000,
          ),
        ),
      ]);

      // Emit ping to initialize monitor
      this.droneSocket.emit('drone:monitor_data', { ping: true });
      await new Promise((resolve) => setTimeout(resolve, 200));

      return {
        status: 'success',
        message: 'Drone connected and ping sent successfully',
      };
    } catch (error) {
      console.error('Error connecting to drone socket:', error);
      const errMsg =
        error.response?.message || error.message || 'Unknown error';
      const code = error.status || 500;
      throwException(code, errMsg);
    }
  }

  // //This method is to mark the pre flight checklist as done.
  // async completeChecklist(req: Request,token: string, updates: Record<number, any>) {
  //   const url = this.config.get<string>('CLEARSKY_CLIENT_SOCKET_URL');
  //   let socket: Socket;

  //   try {
  //     // 1. Check if all items are confirmed
  //     const allConfirmed = Object.values(updates).every(
  //       (item: any) => item.confirm === true,
  //     );
  //     if (!allConfirmed) {
  //       throw new BadRequestException(
  //         'Pre-flight checklist is incomplete. All items must be confirmed.',
  //       );
  //     }

  //     // 2. Connect socket
  //     socket = io(url, {
  //       auth: { token, page: 'monitor' },
  //       transports: ['websocket'],
  //       timeout: 5000,
  //       reconnectionAttempts: 1,
  //     });

  //     await once(socket, 'connect');

  //     let flightData: any;
  //     // socket.on('server:setFlightData', (payload) => {
  //     //   const flight = payload && payload.flight ? payload.flight : payload;
  //     //   console.log('Flight info:', flight);
  //     //   flightData = flight;
  //     // });

  //     // //console.log('FLIGHT DATA 1', flightData);

  //     // if (!flightData) {
  //     //   // 2. Ask for the flight data
  //     //   socket.emit('client:getFlightData', null, (ack) => {
  //     //     console.log('server acknowledged', ack);

  //     //   });

  //     //   try {
  //     //     await once(socket, 'server:setFlightData');
  //     //   } catch (err) {
  //     //     console.error('Error waiting for flight data:', err);
  //     //     throw new InternalServerErrorException(
  //     //       'Failed to receive flight data from Clear Sky',
  //     //     );
  //     //   }
  //     // }
  //     //console.log('FLIGHT DATA 2', flightData)

  //     console.log('Flight ID:', flightData._id);
  //     if(flightData.isPreFlightChecklistCompleted){
  //       throw new BadRequestException(
  //         'Pre-flight checklist is already completed for this flight.',
  //       )
  //     }
  //     if (flightData.isCompleted){
  //       throw new BadRequestException(
  //         'This flight is already completed. You cannot mark the pre-flight checklist as done.',
  //       );
  //     }

  //     // 3. Emit checklist updates
  //     await new Promise<void>((resolve, reject) => {
  //       socket.emit('client:updatePreFlightChecklistItems', updates, () => {
  //         socket.emit('client:updatePreFlightChecklistDone', {}, () => {
  //           resolve();
  //         });
  //       });

  //       setTimeout(
  //         () =>
  //           reject(
  //             new RequestTimeoutException(
  //               'Timeout. Please verify your clearsky token.',
  //             ),
  //           ),
  //         5000,
  //       );
  //     });
  //     const preFlightImages = this.getImgArray(updates);
  //     console.log('USER', req.user);
  //     console.log('Drone ID', flightData?.drone_id);
  //     // 4. Save flight record
  //     if (flightData) {
  //       const flightRecord = new this.flightModel({
  //         droneId: flightData.drone_id,
  //         clearskyId: flightData._id,
  //         pilotEmail: flightData.pilot_id1,
  //         preFlightAppUserId: req.user['email'],
  //         preFlightChecklist: updates,
  //         preFlightImages,
  //         flightData: flightData,
  //         createdAt: new Date(),
  //       });
  //       await flightRecord.save();
  //       console.log('Flight record saved successfully:', flightRecord);
  //     } else {
  //       throw new InternalServerErrorException(
  //         'Flight data not received after checklist completion',
  //       );
  //     }

  //     return {
  //       status: 'success',
  //       message: 'Pre-flight checklist marked complete.',
  //     };
  //   } catch (error) {
  //     console.error('Checklist completion error:', error);
  //     const errMsg =
  //       error.response?.message || error.message || 'Unknown error';
  //     const code = error.status || 500;
  //     throwException(code, errMsg);
  //   } finally {
  //     if (socket?.connected) socket.disconnect();
  //   }
  // }

  // This method is to mark the pre-flight checklist as done.
  async completeChecklist(
    req: Request,
    token: string,
    updates: Record<number, any>,
  ) {
    console.log('UPDATES', updates);
    const url = this.config.get<string>('CLEARSKY_CLIENT_SOCKET_URL');
    let socket: Socket;

    try {
      const allConfirmed = Object.values(updates).every(
        (item: any) => item.confirm === true,
      );
      if (!allConfirmed) {
        throw new BadRequestException(
          'Pre-flight checklist is incomplete. All items must be confirmed.',
        );
      }

      socket = io(url, {
        auth: { token, page: 'monitor' },
        transports: ['websocket'],
        timeout: 5000,
        reconnectionAttempts: 1,
      });
      await once(socket, 'connect');

      const flightData: any = await new Promise<any>((resolve, reject) => {
        const onPush = (payload: any) => {
          socket.off('server:setFlightData', onPush);
          resolve(payload?.flight ?? payload);
        };
        socket.on('server:setFlightData', onPush);

        socket
          .timeout(5000)
          .emit('client:getFlightData', null, (err: any, ack: any) => {
            if (err) return; // continue waiting for the push
            socket.off('server:setFlightData', onPush);
            resolve(ack?.flight ?? ack);
          });

        setTimeout(() => {
          socket.off('server:setFlightData', onPush);
          reject(
            new InternalServerErrorException(
              'Failed to receive flight data from Clear Sky',
            ),
          );
        }, 5000);
      });

      console.log('Flight ID:', flightData._id);
      if (flightData.isPreFlightChecklistCompleted) {
        throw new BadRequestException(
          'Pre-flight checklist is already completed for this flight.',
        );
      }
      if (flightData.isCompleted) {
        throw new BadRequestException(
          'This flight is already completed. You cannot mark the pre-flight checklist as done.',
        );
      }

      await new Promise<void>((resolve, reject) => {
        socket.emit('client:updatePreFlightChecklistItems', updates, () => {
          socket.emit('client:updatePreFlightChecklistDone', {}, () => {
            resolve();
          });
        });

        setTimeout(
          () =>
            reject(
              new RequestTimeoutException(
                'Timeout. Please verify your clearsky token.',
              ),
            ),
          5000,
        );
      });

      const preFlightImages = this.getImgArray(updates);
      console.log('USER', req.user);
      console.log('Drone ID', flightData?.drone_id);

      if (flightData) {
        const flightRecord = new this.flightModel({
          droneId: flightData.drone_id,
          clearskyId: flightData._id,
          pilotEmail: flightData.pilot_id1,
          preFlightAppUserId: req.user['email'],
          preFlightChecklist: updates,
          preFlightImages,
          flightData,
          createdAt: new Date(),
        });
        await flightRecord.save();
        console.log('Flight record saved successfully:', flightRecord);
      } else {
        throw new InternalServerErrorException(
          'Flight data not received after checklist completion',
        );
      }

      return {
        status: 'success',
        message: 'Pre-flight checklist marked complete.',
      };
    } catch (error) {
      console.error('Checklist completion error:', error);
      const errMsg =
        error.response?.message || error.message || 'Unknown error';
      const code = error.status || 500;
      throwException(code, errMsg);
    } finally {
      if (socket?.connected) socket.disconnect();
    }
  }

  // This method fetches the post-flight checklist from the socket io of the clearsky
  async getPostflightChecklist(userJwt: string): Promise<{
    status: string;
    message: string;
    data: any[];
  }> {
    const url = this.config.get<string>('CLEARSKY_CLIENT_SOCKET_URL');
    let socket: Socket;

    try {
      socket = io(url, {
        auth: { token: userJwt, page: 'monitor-all-drones' },
        transports: ['websocket'],
        timeout: 5000,
        reconnectionAttempts: 1,
      });

      // 1. Wait for connection or error
      try {
        await once<void>(socket, 'connect');
      } catch (err: any) {
        if (err.message.includes('Unauthorized')) {
          throw new UnauthorizedException('Invalid or expired token');
        }
        throw new InternalServerErrorException(
          `Socket connect failed: ${err.message}`,
        );
      }

      // 2. Ask for the checklist
      socket.emit('client:getPostFlightChecklistItems', {});

      // 3. Wait for the checklist or timeout
      let items: any;
      try {
        items = await once<any>(socket, 'server:setPostFlightChecklistItems');
      } catch {
        throw new RequestTimeoutException('Checklist response timed out');
      }

      console.log('Received checklist items:', items);

      //const list = Array.isArray(items) ? items : [items];

      // 5. Validate
      // if (list.length === 0) {
      //   throw new NotFoundException('No pre-flight checklist items found');
      // }

      return {
        status: 'success',
        message: 'Post-flight checklist fetched successfully',
        data: items,
      };
    } finally {
      // 6. Always clean up
      if (socket) {
        socket.disconnect();
      }
    }
  }

  // This method marks the post-flight checklist as done with the updates provided in body.
  async completePostflightChecklist(
    req: Request,
    userJwt: string,
    updates: Record<number, any>,
  ): Promise<{ status: string; message: string }> {
    console.log('POST FLIGHT DATA', updates, userJwt);
    const updObj = (updates as any).updates ?? updates;

    const url = this.config.get<string>('CLEARSKY_CLIENT_SOCKET_URL');
    const socket = io(url, {
      auth: { token: userJwt, page: 'monitor-all-drones' },
      transports: ['websocket'],
      timeout: 5000,
      reconnectionAttempts: 1,
    });

    try {
      await Promise.race([
        once<void>(socket, 'connect'),
        once(socket, 'connect_error').then(([err]) => {
          if (err.message.includes('Unauthorized'))
            throw new UnauthorizedException('Invalid token');
          throw new InternalServerErrorException(
            `Connection error: ${err.message}`,
          );
        }),
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(
                new RequestTimeoutException(
                  'Timeout. Please verify your clearsky token.',
                ),
              ),
            6000,
          ),
        ),
      ]);

      const flightData: any = await new Promise<any>((resolve, reject) => {
        const onPush = (payload: any) => {
          socket.off('server:setFlightData', onPush);
          resolve(payload?.flight ?? payload);
        };
        socket.on('server:setFlightData', onPush);

        socket
          .timeout(5000)
          .emit('client:getFlightData', null, (err: any, ack: any) => {
            if (err) return; // keep waiting for push
            socket.off('server:setFlightData', onPush);
            resolve(ack?.flight ?? ack);
          });

        setTimeout(() => {
          socket.off('server:setFlightData', onPush);
          reject(
            new InternalServerErrorException(
              'Failed to receive flight data from Clear Sky',
            ),
          );
        }, 5000);
      });
      if (!flightData) {
        throw new InternalServerErrorException(
          'Flight data not received after checklist completion',
        );
      }

      console.log('FLIGHT ID', flightData._id);

      if (flightData.isPostFlightChecklistCompleted) {
        throw new BadRequestException(
          'Post-flight checklist is already completed for this flight.',
        );
      }
      if (!flightData.isCompleted) {
        throw new BadRequestException(
          'This flight is not completed yet. You cannot mark the post-flight checklist as done.',
        );
      }

      socket.emit('client:updatePostFlightChecklistItems', updObj);
      socket.emit('client:updatePostFlightChecklistDone', {});

      const postFlightImages = this.getImgArray(updObj);

      const flightRecord = await this.flightModel.findOne({
        clearskyId: flightData._id,
      });
      if (!flightRecord)
        throw new NotFoundException(
          `Flight record not found for clearskyId ${flightData._id}`,
        );

      flightRecord.postFlightChecklist = updObj;
      flightRecord.postFlightImages = postFlightImages;
      flightRecord.postFlightAppUserId = req.user['email'];
      flightRecord.updatedAt = new Date();
      await flightRecord.save();
      console.log('Flight record updated successfully:', flightRecord);

      return {
        status: 'success',
        message: 'Post-flight checklist completed successfully',
      };
    } catch (err) {
      console.error('Error completing post-flight checklist:', err);
      const errMsg = err.response?.message || err.message || 'Unknown error';
      const code = err.status || 500;
      throwException(code, errMsg);
    } finally {
      socket.disconnect();
    }
  }
  // create a cron job for the below function for every hour

  @Cron(CronExpression.EVERY_HOUR)
  async syncPendingShipments() {
    try {
      const shipToken = process.env.SHIPMENT_API_KEY;
      if (!shipToken) throw new Error('SHIPMENT_API_KEY missing');

      const allShipmentsResp = await fetch(
        'https://lapp.techeagle.in/api/v1/user/shipment/get/',
        { headers: { Authorization: shipToken } },
      );
      const allShipments = (await allShipmentsResp.json()).data || [];
      const existingSkus = new Set(
        allShipments
          .flatMap((s: any) => s.products || [])
          .map((p: any) => p.SKU),
      );

      /** 2️⃣  fetch flights from ClearSky */
      const flights = await this.fetchAllFlight();
      const pending = flights.filter(
        (f) =>
          !f.isCompleted &&
          !f.isPreFlightChecklistCompleted &&
          dayjs(f.date_created).isAfter(dayjs().subtract(10, 'day')),
      );

      console.log(`Found ${pending.length} pending flights to sync shipments`);
      //console.log("pending flights", pending);

      for (const flight of pending) {
        if (existingSkus.has(flight._id)) {
          // duplicate shipment already exists
          console.log(`Skipping flight ${flight._id} - already exists`);
          continue;
        }

        const shipmentBody = {
          governmentId: 'NA',
          invoiceNumber: `INV-${flight.order_no || flight.localFlightId}`,
          invoiceDate: dayjs(flight.date_created).format('YYYY-MM-DD HH:mm:ss'),
          isScheduledConfirmed: true,
          receiverDetails: {
            email: 'dnyaneshwar.suryavanshi@techeagle.in',
            address: {
              city: flight.end_location,
              state: 'Destination State',
              addressLine: 'Receiver address',
              pincode: '654321',
            },
            pincode: '654321',
            phoneNo: '8888888888',
            altPhoneNo: '5656565656',
          },
          senderDetails: {
            email: 'dnyaneshwar.suryavanshi@techeagle.in',
            address: {
              city: flight.start_location,
              state: 'Hub State',
              addressLine: 'Sender address',
              pincode: '123456',
            },
            pincode: '123456',
            phoneNo: '9999999999',
            altPhoneNo: '9898989898',
          },
          paymentDetails: {
            isPaymentDone: false,
            paymentMode: 'NA',
            paymentTransactionId: 'NA',
            amount: 0,
          },
          shipmentDetails: {
            dimensions: { length: 50, width: 50, height: 50 },
            weight: 500,
            vWeight: 500,
            eWayBillNo: 'NA',
          },
          products: [
            {
              SKU: flight._id,
              price: 0,
              quantity: 1,
              productId: flight.order_id || 'ProductId',
            },
          ],
        };

        await fetch('https://lapp.techeagle.in/api/v1/user/shipment/new', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: shipToken,
          },
          body: JSON.stringify(shipmentBody),
        });
      }

      return { status: 'success', message: `Synced ${pending.length} flights` };
    } catch (error: any) {
      console.error('Error syncing shipments:', error.message);

      const errMsg =
        error.response?.message || error.message || 'Unknown error';
      const code = error.status || 500;
      throwException(code, errMsg);
    }
  }

  async shipmentsForUserLocation(req: Request) {
    const user = req.user as { curLocation?: string };
    console.log('USER', user);
    if (!user || !user.curLocation) {
      throw new InternalServerErrorException(
        'User location is not available in the request object.',
      );
    }

    const token = process.env.SHIPMENT_API_KEY;
    if (!token)
      throw new InternalServerErrorException('SHIPMENT_API_KEY missing');

    try {
      const resp = await fetch(
        'https://lapp.techeagle.in/api/v1/user/shipment/get/',
        { headers: { Authorization: token } },
      );

      if (!resp.ok) {
        const txt = await resp.text();
        throw new InternalServerErrorException(
          `Shipment API error (${resp.status}): ${txt}`,
        );
      }

      const data = await resp.json();
      const shipments = Array.isArray(data?.data) ? data.data : [];

      const filtered = shipments.filter(
        (s: any) =>
          s?.senderDetails?.address?.city === user.curLocation ||
          s?.receiverDetails?.address?.city === user.curLocation,
      );

      return {
        status: 'success',
        message: `Shipments for location ${user.curLocation} fetched successfully`,
        data: filtered,
      };
    } catch (error) {
      console.error('Error fetching shipments:', error);
      const errMsg =
        error.response?.message || error.message || 'Unknown error';
      const code = error.status || 500;
      throwException(code, errMsg);
    }
  }

  async shipmentsForFlight(id: string, req: Request) {
    const token = process.env.SHIPMENT_API_KEY;
    if (!token)
      throw new InternalServerErrorException('SHIPMENT_API_KEY missing');

    try {
      const resp = await fetch(
        'https://lapp.techeagle.in/api/v1/user/shipment/get/',
        { headers: { Authorization: token } },
      );

      if (!resp.ok) {
        const txt = await resp.text();
        throw new InternalServerErrorException(
          `Shipment API error (${resp.status}): ${txt}`,
        );
      }

      const data = await resp.json();
      const shipments = Array.isArray(data?.data) ? data.data : [];
      console.log('Fetched Shipments:', shipments[10]);

      const filtered = shipments.filter(
        (s: any) =>
          Array.isArray(s.products) &&
          s.products.some((p: any) => p?.SKU === id),
      );

      console.log('Filtered Shipments:', filtered);
      return {
        status: 'success',
        message: `Shipments for flight ${id} fetched successfully`,
        data: filtered,
      };
    } catch (error) {
      console.error('Error fetching shipments:', error);
      const errMsg =
        error.response?.message || error.message || 'Unknown error';
      const code = error.status || 500;
      throwException(code, errMsg);
    }
  }
}
