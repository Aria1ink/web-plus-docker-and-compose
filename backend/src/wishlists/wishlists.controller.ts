import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Wishlist } from './entities/wishlist.entity';
import { RequestSelfUser } from 'src/users/users.controller';

@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getWishlists(@Request() req: RequestSelfUser): Promise<Wishlist[]> {
    return await this.wishlistsService.getWishlists(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createWishlists(
    @Request() req: RequestSelfUser,
    @Body() createWishlistDto: CreateWishlistDto,
  ): Promise<Wishlist> {
    return await this.wishlistsService.createWishlists(
      req.user,
      createWishlistDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getWishlist(
    @Request() req: RequestSelfUser,
    @Param('id') id: string,
  ): Promise<Wishlist> {
    return await this.wishlistsService.getWishlist(req.user, +id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateWishlist(
    @Request() req: RequestSelfUser,
    @Param('id') id: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    return await this.wishlistsService.updateWishlist(
      req.user,
      +id,
      updateWishlistDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeWishlist(
    @Request() req: RequestSelfUser,
    @Param('id') id: string,
  ): Promise<Wishlist> {
    return await this.wishlistsService.removeWishlist(req.user, +id);
  }
}
