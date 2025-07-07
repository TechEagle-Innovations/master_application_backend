import { Injectable } from "@nestjs/common";

const userOtpContainerMap = new Map();

@Injectable()
export class OtpGenerator {
  private readonly OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

  getRndmInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  public async generateOtp(user: any) {
    console.log("Generating OTP for user:", user.useremail);
    
    const randomInteger = await this.getRndmInteger(100000, 999999);
    const email = user.useremail; // Simplified key - just use email
    
    // Clear any existing OTP for this user
    if (userOtpContainerMap.has(email)) {
      const existingData = userOtpContainerMap.get(email);
      clearTimeout(existingData.timeoutId);
      userOtpContainerMap.delete(email);
    }
    
    // Set timeout for 10 minutes
    const timeoutId = setTimeout(() => {
      userOtpContainerMap.delete(email);
      console.log(`OTP expired for user: ${user.useremail}`);
    }, this.OTP_EXPIRY_TIME);
    
    // Store OTP with creation timestamp
    const otpData = {
      otp: randomInteger,
      timeoutId: timeoutId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.OTP_EXPIRY_TIME)
    };
    
    userOtpContainerMap.set(email, otpData);
    console.log(`OTP generated for ${user.useremail}: ${randomInteger} (expires in 10 minutes)`);
    
    return randomInteger;
  }

  public async verifyOtp(user: any) {
    console.log("Verifying OTP for user:", user.useremail);
    
    const email = user.useremail;
    
    if (!userOtpContainerMap.has(email)) {
      console.log(`No OTP found for user: ${user.useremail}`);
      return { status: "failed", message: "OTP is expired or not found" };
    }
    
    const otpData = userOtpContainerMap.get(email);
    const currentTime = new Date();
    
    // Check if OTP has expired
    if (currentTime > otpData.expiresAt) {
      clearTimeout(otpData.timeoutId);
      userOtpContainerMap.delete(email);
      console.log(`OTP expired for user: ${user.useremail}`);
      return { status: "failed", message: "OTP has expired" };
    }
    
    // Verify OTP
    if (otpData.otp === parseInt(user.otp)) {
      clearTimeout(otpData.timeoutId);
      userOtpContainerMap.delete(email);
      console.log(`OTP verified successfully for user: ${user.useremail}`);
      return { status: "success", message: "OTP verified successfully" };
    } else {
      console.log(`Invalid OTP provided for user: ${user.useremail}`);
      return { status: "failed", message: "Invalid OTP" };
    }
  }

  // Helper method to get OTP expiry time for testing/debugging
  public getOtpExpiryTime(): number {
    return this.OTP_EXPIRY_TIME;
  }

  // Helper method to check if OTP exists for a user
  public hasOtp(email: string): boolean {
    return userOtpContainerMap.has(email);
  }

  // Helper method to get remaining time for an OTP
  public getRemainingTime(email: string): number | null {
    if (!userOtpContainerMap.has(email)) {
      return null;
    }
    
    const otpData = userOtpContainerMap.get(email);
    const remainingTime = otpData.expiresAt.getTime() - Date.now();
    return remainingTime > 0 ? remainingTime : 0;
  }
}