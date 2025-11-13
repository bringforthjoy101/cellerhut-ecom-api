import { PartialType, PickType } from '@nestjs/swagger';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { User } from 'src/users/entities/user.entity';

enum Permission {
  SUPER_ADMIN = 'Super admin',
  STORE_OWNER = 'Store owner',
  STAFF = 'Staff',
  CUSTOMER = 'Customer',
}
export class RegisterDto extends PickType(User, ['name', 'email', 'password']) {
  permission: Permission = Permission.CUSTOMER;
}

export class LoginDto extends PartialType(
  PickType(User, ['email', 'password']),
) {}

export class SocialLoginDto {
  provider: string;
  access_token: string;
}
export class ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}
export class ForgetPasswordDto {
  email: string;
}
export class VerifyForgetPasswordDto {
  email: string;
  token: string;
}
export class ResetPasswordDto {
  email: string;
  token: string;
  password: string;
}

export class AuthResponse {
  token: string;
  permissions: string[];
  role?: string;
  id?: number | string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;  // Support both naming conventions
  last_name?: string;
}
export class CoreResponse extends CoreMutationOutput {}
export class VerifyOtpDto {
  otp_id: string;
  code: string;
  phone_number: string;
}
export class OtpResponse {
  id: string;
  message: string;
  success: boolean;
  phone_number: string;
  provider: string;
  is_contact_exist: boolean;
}
export class OtpDto {
  phone_number: string;
}
export class OtpLoginDto {
  otp_id: string;
  code: string;
  phone_number: string;
  name?: string;
  email?: string;
}

// Registration OTP DTOs (Email verification flow)
export class InitiateRegistrationDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export class VerifyRegistrationDto {
  otpId: string;
  otp: string;
}

export class ResendRegistrationOtpDto {
  otpId: string;
}

export class InitiateRegistrationResponse {
  success: boolean;
  otpId: string;
  email: string;
  expiresIn: number;
  message: string;
}

export class RegistrationResponse {
  token: string;
  permissions: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    emailVerified: boolean;
    avatar: string | null;
  };
}

export class ResendOtpResponse {
  success: boolean;
  message: string;
  attemptsRemaining: number;
}
