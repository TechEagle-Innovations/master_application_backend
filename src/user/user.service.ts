import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInfo, UserInfoDocument } from '../schema/user/userInfo.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserInfo.name) private userModel: Model<UserInfoDocument>,
    private authService: AuthService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserInfo> {
    try {
      // Check if user with email already exists
      const existingUser = await this.userModel.findOne({ 
        useremail: createUserDto.useremail 
      }).exec();

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash the password
      const hashedPassword = await this.authService.hashPassword(createUserDto.password);

      // Create new user with hashed password
      const newUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
        verification: 'incomplete',
        active: true,
        cart: [],
        order: [],
        permission: 'Not Granted'
      });

      // Save the user
      const savedUser = await newUser.save();

      // Remove password from response
      const userResponse = savedUser.toObject();
      delete userResponse.password;

      return userResponse;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Failed to create user');
    }
  }

  async findByEmail(email: string): Promise<UserInfo | null> {
    return this.userModel.findOne({ useremail: email }).exec();
  }
}
