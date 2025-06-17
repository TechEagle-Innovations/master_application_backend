import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { NodeService } from './node.service';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import * as fs from 'fs';
import * as path from 'path';

// @ApiTags('nodes')
// // @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('nodes')
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @Post()
  create(@Body() createNodeDto: CreateNodeDto) {
    return this.nodeService.create(createNodeDto);
  }


  @UseGuards(JwtAuthGuard)
  @Get('location')
  async getLocationData(@Req() req) {
    try {
      // Get the auth token from the request
      console.log("req.headers",req.headers);
      const authToken = req.headers.authorization?.split(' ')[1];
      if (!authToken) {
        throw new Error('No authentication token provided');
      }

      // Check if cached data exists and is less than 1 hour old
      const cacheFilePath = path.join(process.cwd(), 'cache', 'location_data.json');
      const cacheExists = fs.existsSync(cacheFilePath);
      
      if (cacheExists) {
        const stats = fs.statSync(cacheFilePath);
        const cacheAge = Date.now() - stats.mtimeMs;
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

        if (cacheAge < oneHour) {
          // Return cached data if it's less than 1 hour old
          const cachedData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
          return {
            status: 'success',
            message: 'Data retrieved from cache',
            data: cachedData,
            source: 'cache'
          };
        }
      }

      // If no cache or cache is old, fetch from ClearSky
      const clearSkyData = await this.nodeService.fetchClearSkyLocationData();
      
      // Ensure cache directory exists
      const cacheDir = path.join(process.cwd(), 'cache');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      // Cache the new data
      fs.writeFileSync(cacheFilePath, JSON.stringify(clearSkyData, null, 2));

      return {
        status: 'success',
        message: 'Data retrieved from ClearSky and cached',
        data: clearSkyData,
        source: 'clearsky'
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to fetch location data',
        error: error.message
      };
    }
  }

  @Get()
  findAll() {
    return this.nodeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nodeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNodeDto: UpdateNodeDto) {
    return this.nodeService.update(+id, updateNodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nodeService.remove(+id);
  }

}
