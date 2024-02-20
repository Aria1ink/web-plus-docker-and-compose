import {
  Controller,
  Get,
  Post,
  Request,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Offer } from './entities/offer.entity';
import { RequestSelfUser } from 'src/users/users.controller';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createOffer(
    @Request() req: RequestSelfUser,
    @Body() createOfferDto: CreateOfferDto,
  ): Promise<Record<string, never>> {
    await this.offersService.createOffer(req.user, createOfferDto);
    return {};
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getOffers(): Promise<Offer[]> {
    return await this.offersService.getOffers();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOfferById(@Param('id') id: string): Promise<Offer> {
    return await this.offersService.getOfferById(+id);
  }
}
