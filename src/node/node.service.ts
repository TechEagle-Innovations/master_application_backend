import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CreateNodeDto } from './dto/create-node.dto';
import { LocationInfo } from 'src/schema/location/locationInfo.schema';
import { UpdateNodeDto } from './dto/update-node.dto';

@Injectable()
export class NodeService {
  private readonly clearSkyBaseUrl: string;

  constructor(
    @InjectModel(LocationInfo.name) private nodeModel: Model<LocationInfo>,
    private configService: ConfigService,
  ) {
    this.clearSkyBaseUrl = this.configService.get<string>('CLEARSKY_API_URL');
  }

  async create(createNodeDto: CreateNodeDto) {
    const createdNode = new this.nodeModel(createNodeDto);
    return createdNode.save();
  }

  findAll() {
    return this.nodeModel.find();
  }

  findOne(id: number) {
    return this.nodeModel.findById(id);
  }
  
  update(id: number, updateNodeDto: UpdateNodeDto) {
    return `This action updates a #${id} node`;
  }

  remove(id: number) {
    return `This action removes a #${id} node`;
  }

  async fetchClearSkyLocationData() {
    const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InByYW5qYWxpLnNpbmhhQHRlY2hlYWdsZS5pbiIsImlhdCI6MTc0OTgyMTAxMSwiZXhwIjoxNzQ5ODMxODExfQ.OH5_CCTP8JKoCzLKwXSbm-H9A30BwLcQMR9q3blagA0";
    try {
      const response = await axios.get(`${this.clearSkyBaseUrl}/location/get_allLocation`, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      });

      if (response.status !== 200) {
        throw new HttpException(
          'Failed to fetch data from ClearSky',
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Error fetching ClearSky data',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
