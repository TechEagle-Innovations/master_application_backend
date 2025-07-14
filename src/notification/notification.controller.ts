import { Controller, Post, Delete, Body, Request, UseGuards, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';

@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('register-token')
  @HttpCode(HttpStatus.OK)
  async registerToken(@Request() req, @Body('pushToken') pushToken: string) {
    if (!pushToken) throw new BadRequestException('pushToken is required');
    await this.notificationService.registerToken(req.user.sub, pushToken);
    return { message: 'Token registered' };
  }

  @Delete('remove-token')
  @HttpCode(HttpStatus.OK)
  async removeToken(@Request() req, @Body('pushToken') pushToken: string) {
    if (!pushToken) throw new BadRequestException('pushToken is required');
    await this.notificationService.removeToken(req.user.sub, pushToken);
    return { message: 'Token removed' };
  }

  // Optional: Admin/test endpoint to send notification
  // @Post('send')
  // async sendNotification(@Body() body: { pushToken: string, title: string, message: string, data?: any }) {
  //   return this.notificationService.sendNotification(body.pushToken, body.title, body.message, body.data);
  // }
} 