import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationToken, NotificationTokenDocument } from '../schema/notificationToken.schema';
import fetch from 'node-fetch';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    @InjectModel(NotificationToken.name)
    private readonly notificationTokenModel: Model<NotificationTokenDocument>,
  ) {}

  async registerToken(userId: string, pushToken: string): Promise<void> {
    if (!pushToken || !userId) throw new BadRequestException('Missing token or userId');
    await this.notificationTokenModel.findOneAndUpdate(
      { userId },
      { userId, push_token: pushToken },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  async removeToken(userId: string, pushToken: string): Promise<void> {
    const result = await this.notificationTokenModel.deleteOne({ userId, push_token: pushToken });
    if (result.deletedCount === 0) throw new NotFoundException('Token not found');
  }

  async sendNotification(pushToken: string, title: string, body: string, data?: any): Promise<any> {
    const message = {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data,
    };
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    if (!response.ok) {
      this.logger.error(`Expo push failed: ${response.statusText}`);
      throw new InternalServerErrorException('Expo push failed');
    }
    return response.json();
  }

  async getUserTokens(userId: string): Promise<string[]> {
    const tokens = await this.notificationTokenModel.find({ userId }).exec();
    return tokens.map(t => t.push_token);
  }
} 