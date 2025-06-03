import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserInfo, UserInfoDocument } from '../schema/user/userInfo.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserInfo.name) private userModel: Model<UserInfoDocument>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ useremail: email }).exec();
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isApproved) {
      throw new UnauthorizedException('User not approved');
    }

    if (!user.active) {
      throw new UnauthorizedException('User account is inactive');
    }

    return user;
  }

  async login(user: UserInfoDocument) {
    const payload = {
      email: user.useremail,
      sub: user._id,
      userName: user.userName,
      permission: user.permission,
      designation: user.designation
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.useremail,
        userName: user.userName,
        permission: user.permission,
        location: user.location,
        designation: user.designation
      }
    };
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
} 