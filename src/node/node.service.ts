import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CreateNodeDto } from './dto/create-node.dto';
import { Node, NodeDocument } from './schemas/node.schema';

@Injectable()
export class NodeService {
  private readonly clearSkyApiKey: string;
  private readonly clearSkyBaseUrl: string;

  constructor(
    @InjectModel(Node.name) private nodeModel: Model<NodeDocument>,
    private configService: ConfigService,
  ) {
    this.clearSkyApiKey = this.configService.get<string>('CLEARSKY_API_KEY');
    this.clearSkyBaseUrl = this.configService.get<string>('CLEARSKY_API_URL');
  }

  async create(createNodeDto: CreateNodeDto): Promise<Node> {
    const createdNode = new this.nodeModel(createNodeDto);
    return createdNode.save();
  }

  async fetchClearSkyLocationData() {
    try {
      const response = await axios.get(`${this.clearSkyBaseUrl}/locations`, {
        headers: {
          'Authorization': `Bearer ${this.clearSkyApiKey}`,
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
