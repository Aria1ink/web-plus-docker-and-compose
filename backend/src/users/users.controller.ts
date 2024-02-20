import {
  Controller,
  Get,
  Post,
  Request,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request as IRequest } from 'express';
import { FindUsersDto } from './dto/find-users.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

export interface RequestSelfUser extends IRequest {
  user: UserProfileResponseDto;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getOwnUser(@Request() req: RequestSelfUser) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateOwnProfile(
    @Request() req: RequestSelfUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.updateSelfProfile(
      req.user.id,
      updateUserDto,
    );

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/wishes')
  async getOwnWishes(@Request() req: RequestSelfUser) {
    return await this.usersService.getSelfWishes(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('find')
  findMany(@Body() findUsersDto: FindUsersDto) {
    return this.usersService.findMany(findUsersDto.query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':username')
  async getUser(@Param('username') username: string) {
    const user = await this.usersService.findByName(username);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':username/wishes')
  async getUserWishes(@Param('username') username: string) {
    const user = await this.usersService.getUserWishes(username);
    return user;
  }
}
