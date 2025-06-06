import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
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

    // Generate access token and refresh token
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
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
        refresh_token: newRefreshToken
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async generatePasswordResetToken(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ useremail: email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate reset token valid for 1 hour
    const resetToken = this.jwtService.sign(
      { email: user.useremail, type: 'password_reset' },
      { expiresIn: '1h' }
    );

    // Save reset token and expiry
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now
    await user.save();

    // In a real application, you would send this token via email
    // For now, we'll just return a success message
    return { message: 'Password reset instructions have been sent to your email' };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Verify the token
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'password_reset') {
        throw new UnauthorizedException('Invalid reset token');
      }

      // Find user with this token and check if token is expired
      const user = await this.userModel.findOne({
        useremail: payload.email,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      }).exec();

      if (!user) {
        throw new UnauthorizedException('Invalid or expired reset token');
      }

      // Hash the new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password and clear reset token fields
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
} 