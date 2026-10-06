import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Request,
  UseGuards,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('api/v1/users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get profile' })
  @Get('me')
  getProfile(@Request() req: any) {
    // Return full profile from DB instead of just token payload
    return this.usersService.getUserById(req.user.userId);
  }

  @ApiOperation({ summary: 'Get all users' })
  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @ApiOperation({ summary: 'Update profile' })
  @Patch('me')
  updateProfile(
    @Request() req: any,
    @Body() updateData: any, // { name, gender, occupation, profilePhoto }
  ) {
    return this.usersService.updateUser(req.user.userId, updateData);
  }

  @ApiOperation({ summary: 'Get public user profile' })
  @Get(':id')
  getUserProfile(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @ApiOperation({ summary: 'Delete profile/account' })
  @Delete('me')
  deleteProfile(@Request() req: any) {
    return this.usersService.deleteUser(req.user.userId);
  }
}
