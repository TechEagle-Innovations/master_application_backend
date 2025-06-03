import { Controller, Post, Body, UseGuards, Get, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserDesignation } from './enums/user-designation.enum';

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

    // Example of a protected route without role restrictions
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile() {
    return { message: 'This is a protected route accessible to all authenticated users' };
  }
//   // Protected route for creating L3 users - only L3 users can create other L3 users
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
