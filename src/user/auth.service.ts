import { Injectable, UnauthorizedException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserInfo, UserInfoDocument } from '../schema/user/userInfo.schema';
import { LogoutDto } from './dto/logout.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserInfo.name) private userModel: Model<UserInfoDocument>,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    console.log(email, password);
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
      designation: user.designation,
      location: user.location
    };

    // Generate access token and refresh token
    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Save refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
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

  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken);

      // Find user with this refresh token
      const user = await this.userModel.findOne({
        useremail: payload.email,
        refreshToken: refreshToken
      }).exec();

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const newPayload = {
        email: user.useremail,
        sub: user._id,
        userName: user.userName,
        permission: user.permission,
        designation: user.designation
      };

      const accessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      // Update refresh token in database
      user.refreshToken = newRefreshToken;
      await user.save();

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
        user: {
          id: user._id,
          email: user.useremail,
          userName: user.userName,
          permission: user.permission,
          location: user.location,
          designation: user.designation
        }
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async generatePasswordResetOtp(email: string): Promise<{ message: string }> {
      const user = await this.userModel.findOne({ useremail: email }).exec();
      // Always return the same message to prevent email enumeration
      if (!user) {
        // Optionally, log this event for monitoring
        throw new UnauthorizedException('Invalid email');
      }

      // Throttle: Prevent too frequent OTP requests
      // if (user.resetPasswordOtpExpires && user.resetPasswordOtpExpires > new Date(Date.now() - 9 * 60 * 1000)) {
      //   throw new Error('OTP recently sent. Please wait before requesting again.');
      // }

      const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
      user.resetPasswordOtp = otp;
      user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
      user.resetPasswordOtpVerified = false;
      await user.save();

      // TODO: Send OTP via email (handle email errors separately)
      // await this.emailService.sendOtp(user.useremail, otp);

      return { message: 'If the email exists, an OTP has been sent.' };
  
  }

  async verifyPasswordResetOtp(email: string, otp: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ useremail: email }).exec();
    console.log('OTP', otp);
    if (!user) {
      throw new NotFoundException('Invalid email');
    }
    if (
      !user.resetPasswordOtp ||
      user.resetPasswordOtp !== otp ||
      !user.resetPasswordOtpExpires ||
      user.resetPasswordOtpExpires < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    user.resetPasswordOtpVerified = true;
    await user.save();

    return { message: 'OTP verified successfully' };
  }

  async resetPasswordWithOtp(email: string, newPassword: string): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findOne({ useremail: email }).exec();
      if (!user || !user.resetPasswordOtpVerified) {
        throw new UnauthorizedException('OTP not verified or session expired');
      }

      user.password = await this.hashPassword(newPassword);
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpires = undefined;
      user.resetPasswordOtpVerified = false;
      await user.save();

      return { message: 'Password has been reset successfully' };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      console.error('Error in resetPasswordWithOtp:', error);
      throw new InternalServerErrorException('Could not reset password.');
    }
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async logout(userId: LogoutDto): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.refreshToken = undefined;
    await user.save();
    console.log('User logged out', user);
    return { message: 'Successfully logged out' };
  }
} 