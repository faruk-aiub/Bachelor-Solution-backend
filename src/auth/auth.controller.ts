import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register' })
  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  @ApiOperation({ summary: 'Login' })
  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.phone, body.password);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change password' })
  @Patch('change-password')
  changePassword(
    @Request() req: any,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.changePassword(
      req.user.userId,
      oldPassword,
      newPassword,
    );
  }

  @ApiOperation({ summary: 'Verify OTP' })
  @Post('verify-otp')
  verifyOtp(@Body('phone') phone: string, @Body('otp') otp: string) {
    return this.authService.verifyOtp(phone, otp);
  }

  @ApiOperation({ summary: 'Reset password (Forgot Password)' })
  @Patch('reset-password')
  resetPassword(
    @Body('phone') phone: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(phone, newPassword);
  }
}
