import { Injectable, UnauthorizedException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserInfo, UserInfoDocument } from '../schema/user/userInfo.schema';
import { LogoutDto } from './dto/logout.dto';
import { OtpGenerator } from 'src/emailService/generateOtp';
import { EmailTemplate } from 'src/emailService/emailTemplate';
import axios from 'axios';

@Injectable()
export class AuthService {
  otpGenerator = new OtpGenerator()
  constructor(
    @InjectModel(UserInfo.name) private userModel: Model<UserInfoDocument>,
    private jwtService: JwtService, private emailTemplate: EmailTemplate
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
      const generateOtp = await this.otpGenerator.generateOtp(user)
        // console.log(generateOtp)
        const emailTemplate = await this.emailTemplate.passwordChangeOTPEmail(user.userName, user.useremail, generateOtp)
        // console.log("emailTempalte", emailTemplate)
        const sentEmail = await axios({
          url: "http://localhost:9999/notification/Send_notification",
          method: "POST",
          headers: {
            // authorization: userCookie.token,
          },
          data: emailTemplate
        })
        // console.log("email Sent", sentEmail.data)
        if (sentEmail.data.status === "failed") {
          return { message: "Failed to send Email" }
        }

      // Throttle: Prevent too frequent OTP requests
      // if (user.resetPasswordOtpExpires && user.resetPasswordOtpExpires > new Date(Date.now() - 9 * 60 * 1000)) {
      //   throw new Error('OTP recently sent. Please wait before requesting again.');
      // }

      // const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
      // user.resetPasswordOtp = otp;
      // user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
      // user.resetPasswordOtpVerified = false;
      // await user.save();

      // TODO: Send OTP via email (handle email errors separately)
      // await this.emailService.sendOtp(user.useremail, otp);

      return { message: 'OTP has been sent to your email' };
  
  }

  async verifyPasswordResetOtp(email: string, otp: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ useremail: email }).exec();
    console.log('OTP', otp);
    if (!user) {
      throw new NotFoundException('Invalid email');
    }
    console.log("userEmail", user)
    const userData = {
      useremail: user.useremail,
      otp: otp,
    }
    const verifyOtp = await this.otpGenerator.verifyOtp(userData)
    if (verifyOtp.status === "success") {
      // Mark OTP as verified in the database
      user.resetPasswordOtpVerified = true;
      user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // Set expiry for password reset session
      await user.save();
      console.log(`OTP verified and marked as verified for user: ${user.useremail}`);
      return { message: "OTP Verified successfully" }
    } else {
      return { message: verifyOtp.message }
    }
  }

  async resetPasswordWithOtp(email: string, newPassword: string): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findOne({ useremail: email }).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      if (!user.resetPasswordOtpVerified) {
        throw new UnauthorizedException('OTP not verified. Please verify your OTP first.');
      }

      // Check if the verification session is still valid (within 10 minutes of OTP verification)
      if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
        throw new UnauthorizedException('OTP verification session expired. Please request a new OTP.');
      }

      user.password = await this.hashPassword(newPassword);
      // Reset the OTP verification status after successful password reset
      user.resetPasswordOtpVerified = false;
      user.resetPasswordExpires = undefined;
      await user.save();

      // Send password change confirmation email
      try {
        const emailTemplate = await this.emailTemplate.passwordChangedEmail(user.userName, user.useremail);
        const sentEmail = await axios({
          url: "http://localhost:9999/notification/Send_notification",
          method: "POST",
          headers: {},
          data: emailTemplate
        });
        
        if (sentEmail.data.status === "failed") {
          console.log(`Failed to send password change confirmation email to ${user.useremail}`);
        } else {
          console.log(`Password change confirmation email sent to ${user.useremail}`);
        }
      } catch (emailError) {
        console.error('Error sending password change confirmation email:', emailError);
        // Don't throw error for email failure, password reset is still successful
      }

      console.log(`Password reset successfully for user: ${user.useremail}`);
      return { message: 'Password has been reset successfully' };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof NotFoundException) throw error;
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