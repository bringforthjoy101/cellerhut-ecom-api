import { Injectable } from '@nestjs/common';
import cellerHutAPI from '../common/celler-hut-client';
import {
  AuthResponse,
  ChangePasswordDto,
  ForgetPasswordDto,
  LoginDto,
  CoreResponse,
  RegisterDto,
  ResetPasswordDto,
  VerifyForgetPasswordDto,
  SocialLoginDto,
  OtpLoginDto,
  OtpResponse,
  VerifyOtpDto,
  OtpDto,
} from './dto/create-auth.dto';
import { User, Permission } from '../users/entities/user.entity';

@Injectable()
export class CellerHutAuthService {
  /**
   * Register a new user with Celler Hut API
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      const response = await cellerHutAPI.post('/ecommerce/auth/register', {
        name: registerDto.name,
        email: registerDto.email,
        password: registerDto.password,
      });

      const userData = response.data.user;
      const token = response.data.token;

      return {
        token: token,
        permissions: this.mapUserPermissions(userData.role),
        role: userData.role || 'customer',
      };
    } catch (error) {
      console.error('[Celler Hut Auth] Registration failed:', error);

      if (error.response?.status === 422) {
        throw new Error('Email already exists or invalid data provided');
      }

      throw new Error('Registration failed. Please try again.');
    }
  }

  /**
   * Login user with Celler Hut API
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      const response = await cellerHutAPI.post('/ecommerce/auth/login', {
        email: loginDto.email,
        password: loginDto.password,
      });

      const userData = response.data.user;
      const token = response.data.token;

      return {
        token: token,
        permissions: this.mapUserPermissions(userData.role),
        role: userData.role || 'customer',
      };
    } catch (error) {
      console.error('[Celler Hut Auth] Login failed:', error);

      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }

      throw new Error('Login failed. Please try again.');
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    changePasswordDto: ChangePasswordDto,
  ): Promise<CoreResponse> {
    try {
      await cellerHutAPI.post('/ecommerce/auth/change-password', {
        current_password: changePasswordDto.oldPassword,
        new_password: changePasswordDto.newPassword,
      });

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      console.error('[Celler Hut Auth] Change password failed:', error);

      if (error.response?.status === 400) {
        throw new Error('Current password is incorrect');
      }

      return {
        success: false,
        message: 'Failed to change password. Please try again.',
      };
    }
  }

  /**
   * Initiate forgot password process
   */
  async forgetPassword(
    forgetPasswordDto: ForgetPasswordDto,
  ): Promise<CoreResponse> {
    try {
      await cellerHutAPI.post('/ecommerce/auth/forgot-password', {
        email: forgetPasswordDto.email,
      });

      return {
        success: true,
        message: 'Password reset link sent to your email',
      };
    } catch (error) {
      console.error('[Celler Hut Auth] Forgot password failed:', error);

      if (error.response?.status === 404) {
        throw new Error('Email address not found');
      }

      return {
        success: false,
        message: 'Failed to send reset link. Please try again.',
      };
    }
  }

  /**
   * Verify forgot password token
   */
  async verifyForgetPasswordToken(
    verifyDto: VerifyForgetPasswordDto,
  ): Promise<CoreResponse> {
    try {
      await cellerHutAPI.post('/ecommerce/auth/verify-reset-token', {
        token: verifyDto.token,
        email: verifyDto.email,
      });

      return {
        success: true,
        message: 'Token verified successfully',
      };
    } catch (error) {
      console.error('[Celler Hut Auth] Token verification failed:', error);

      if (error.response?.status === 400) {
        throw new Error('Invalid or expired token');
      }

      return {
        success: false,
        message: 'Token verification failed',
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<CoreResponse> {
    try {
      await cellerHutAPI.post('/ecommerce/auth/reset-password', {
        token: resetPasswordDto.token,
        email: resetPasswordDto.email,
        password: resetPasswordDto.password,
      });

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      console.error('[Celler Hut Auth] Password reset failed:', error);

      if (error.response?.status === 400) {
        throw new Error('Invalid or expired token');
      }

      return {
        success: false,
        message: 'Password reset failed. Please try again.',
      };
    }
  }

  /**
   * Social login (Google, Facebook, etc.)
   */
  async socialLogin(socialLoginDto: SocialLoginDto): Promise<AuthResponse> {
    try {
      const response = await cellerHutAPI.post('/ecommerce/auth/social-login', {
        provider: socialLoginDto.provider,
        access_token: socialLoginDto.access_token,
      });

      const userData = response.data.user;
      const token = response.data.token;

      return {
        token: token,
        permissions: this.mapUserPermissions(userData.role),
        role: userData.role || 'customer',
      };
    } catch (error) {
      console.error('[Celler Hut Auth] Social login failed:', error);
      throw new Error('Social login failed. Please try again.');
    }
  }

  /**
   * OTP-based login
   */
  async otpLogin(otpLoginDto: OtpLoginDto): Promise<AuthResponse> {
    try {
      const response = await cellerHutAPI.post('/ecommerce/auth/otp-login', {
        phone_number: otpLoginDto.phone_number,
        otp_code: otpLoginDto.code,
        otp_id: otpLoginDto.otp_id,
      });

      const userData = response.data.user;
      const token = response.data.token;

      return {
        token: token,
        permissions: this.mapUserPermissions(userData.role),
        role: userData.role || 'customer',
      };
    } catch (error) {
      console.error('[Celler Hut Auth] OTP login failed:', error);

      if (error.response?.status === 400) {
        throw new Error('Invalid OTP code');
      }

      throw new Error('OTP login failed. Please try again.');
    }
  }

  /**
   * Send OTP code to phone number
   */
  async sendOtpCode(otpDto: OtpDto): Promise<OtpResponse> {
    try {
      const response = await cellerHutAPI.post('/ecommerce/auth/send-otp', {
        phone_number: otpDto.phone_number,
      });

      return {
        success: true,
        message: 'OTP sent successfully',
        id: response.data.otp_id,
        provider: 'sms',
        phone_number: otpDto.phone_number,
        is_contact_exist: response.data.user_exists || false,
      };
    } catch (error) {
      console.error('[Celler Hut Auth] Send OTP failed:', error);

      return {
        success: false,
        message: 'Failed to send OTP. Please try again.',
        id: null,
        provider: 'sms',
        phone_number: otpDto.phone_number,
        is_contact_exist: false,
      };
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOtpCode(verifyOtpDto: VerifyOtpDto): Promise<CoreResponse> {
    try {
      await cellerHutAPI.post('/ecommerce/auth/verify-otp', {
        phone_number: verifyOtpDto.phone_number,
        otp_code: verifyOtpDto.code,
        otp_id: verifyOtpDto.otp_id,
      });

      return {
        success: true,
        message: 'OTP verified successfully',
      };
    } catch (error) {
      console.error('[Celler Hut Auth] OTP verification failed:', error);

      if (error.response?.status === 400) {
        return {
          success: false,
          message: 'Invalid OTP code',
        };
      }

      return {
        success: false,
        message: 'OTP verification failed',
      };
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await cellerHutAPI.get('/ecommerce/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return this.transformCellerHutUser(response.data);
    } catch (error) {
      console.error('[Celler Hut Auth] Get current user failed:', error);
      throw new Error('Failed to get user profile');
    }
  }

  /**
   * Logout user
   */
  async logout(token: string): Promise<CoreResponse> {
    try {
      await cellerHutAPI.post(
        '/ecommerce/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      console.error('[Celler Hut Auth] Logout failed:', error);

      return {
        success: true,
        message: 'Logged out successfully', // Always return success for logout
      };
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await cellerHutAPI.post('/ecommerce/auth/refresh', {
        refresh_token: refreshToken,
      });

      const userData = response.data.user;
      const token = response.data.token;

      return {
        token: token,
        permissions: this.mapUserPermissions(userData.role),
        role: userData.role || 'customer',
      };
    } catch (error) {
      console.error('[Celler Hut Auth] Token refresh failed:', error);
      throw new Error('Token refresh failed. Please login again.');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(token: string, profileData: any): Promise<User> {
    try {
      const response = await cellerHutAPI.put(
        '/ecommerce/auth/profile',
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return this.transformCellerHutUser(response.data);
    } catch (error) {
      console.error('[Celler Hut Auth] Profile update failed:', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Map Celler Hut user roles to PickBazar permissions
   */
  private mapUserPermissions(role: string): string[] {
    const rolePermissions = {
      super_admin: ['super_admin', 'store_owner', 'customer'],
      admin: ['store_owner', 'customer'],
      store_owner: ['store_owner', 'customer'],
      staff: ['customer'],
      customer: ['customer'],
    };

    return rolePermissions[role] || ['customer'];
  }

  /**
   * Transform Celler Hut user data to PickBazar User entity
   */
  private transformCellerHutUser(cellerHutUser: any): User {
    // Create permissions array
    const permissions: Permission[] = this.mapUserPermissions(
      cellerHutUser.role,
    ).map((role, index) => ({
      id: index + 1,
      name: role,
      guard_name: 'api',
      created_at: new Date(),
      updated_at: new Date(),
    }));

    return {
      id: cellerHutUser.id,
      name: cellerHutUser.name,
      email: cellerHutUser.email,
      created_at: new Date(cellerHutUser.created_at),
      updated_at: new Date(cellerHutUser.updated_at),
      is_active: cellerHutUser.is_active || true,
      profile: {
        id: cellerHutUser.profile?.id || cellerHutUser.id,
        avatar: cellerHutUser.profile?.avatar || cellerHutUser.avatar || null,
        bio: cellerHutUser.profile?.bio || null,
        socials: cellerHutUser.profile?.socials || [],
        contact: cellerHutUser.profile?.contact || cellerHutUser.phone || null,
        created_at: new Date(cellerHutUser.created_at),
        updated_at: new Date(cellerHutUser.updated_at),
        customer: {
          id: cellerHutUser.id,
          name: cellerHutUser.name,
          email: cellerHutUser.email,
          created_at: new Date(cellerHutUser.created_at),
          updated_at: new Date(cellerHutUser.updated_at),
        },
      },
      address: cellerHutUser.address || [],
      permissions: permissions,
    };
  }

  /**
   * Validate user age for liquor purchases (South African law: 18+)
   */
  async validateUserAge(userId: number): Promise<boolean> {
    try {
      const response = await cellerHutAPI.get(
        `/ecommerce/users/${userId}/age-verification`,
      );
      return response.data.is_of_legal_age || false;
    } catch (error) {
      console.error('[Celler Hut Auth] Age validation failed:', error);
      return false;
    }
  }

  /**
   * Get user's liquor purchase history for compliance
   */
  async getUserPurchaseHistory(
    userId: number,
    limit: number = 10,
  ): Promise<any[]> {
    try {
      const response = await cellerHutAPI.get(
        `/ecommerce/users/${userId}/purchase-history`,
        {
          params: { limit, liquor_only: true },
        },
      );

      return response.data.data || [];
    } catch (error) {
      console.error('[Celler Hut Auth] Get purchase history failed:', error);
      return [];
    }
  }
}
