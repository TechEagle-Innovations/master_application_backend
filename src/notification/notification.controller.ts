import { Controller, Post, Delete, Body, Request, UseGuards, HttpCode, HttpStatus, BadRequestException, ValidationPipe } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { SendNotificationDto } from './dto/send-notification.dto';

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

  @Post('remove-token')
  @HttpCode(HttpStatus.OK)
  async removeToken(@Request() req, @Body('pushToken') pushToken: string) {
    if (!pushToken) throw new BadRequestException('pushToken is required');
    await this.notificationService.removeToken(req.user.sub, pushToken);
    return { message: 'Token removed' };
  }

  // Optional: Admin/test endpoint to send notification
  @Post('send')
  async sendNotification(@Body(new ValidationPipe()) sendNotificationDto: SendNotificationDto) {
    const { pushToken, title, body: messageBody, data } = sendNotificationDto;
    console.log("PUSHTOKEN", pushToken, title, messageBody, data );
    return this.notificationService.sendNotification(pushToken, title, messageBody, data);
  }
} 