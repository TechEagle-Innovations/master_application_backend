import { Controller, Post, Body, UseGuards, Get, UnauthorizedException, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LogoutDto } from './dto/logout.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    console.log('forgotPasswordDto', forgotPasswordDto);
    return this.authService.generatePasswordResetOtp(forgotPasswordDto.email);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyPasswordResetOtp(verifyOtpDto.email, verifyOtpDto.otp);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPasswordWithOtp(
      resetPasswordDto.email,
      resetPasswordDto.newPassword
    );
    return { message: 'Password has been reset successfully' };
  } 

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    return this.authService.logout(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile() {
    return { message: 'This is a protected route accessible to all authenticated users' };
  }

  // Example of a protected route without role restrictions
//   @Post('register/l3')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(UserDesignation.L3)
//   @HttpCode(HttpStatus.CREATED)
//   async createL3User(@Body() createUserDto: CreateUserDto) {
//     // Force the designation to be L3
//     return this.userService.createUser({
//       ...createUserDto,
//       designation: UserDesignation.L3,
//       isApproved: true, // L3 users are automatically approved
//     });
//   }

//   // Example of a route accessible only to L3 users
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(UserDesignation.L3)
//   @Get('admin-dashboard')
//   getAdminDashboard() {
//     return { message: 'Welcome to L3 Admin Dashboard' };
//   }

//   // Example of a route accessible only to client users
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(UserDesignation.CLIENT_USER)
//   @Get('client-dashboard')
//   getClientDashboard() {
//     return { message: 'Welcome to Client Dashboard' };
//   }

//   // Example of a route accessible to both L3 and client users
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(UserDesignation.L3, UserDesignation.CLIENT_USER)
//   @Get('common-dashboard')
//   getCommonDashboard() {
//     return { message: 'Welcome to Common Dashboard' };
//   }
}
