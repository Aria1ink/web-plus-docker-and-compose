import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfileResponseDto } from 'src/users/dto/user-profile-response.dto';
import { Wish } from 'src/wishes/entities/wish.entity';
import { Repository, In } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishListRepository: Repository<Wishlist>,
    @InjectRepository(Wish) private wishRepository: Repository<Wish>,
  ) {}

  async getWishlists(user: UserProfileResponseDto) {
    return await this.wishListRepository.findBy({ owner: { id: user.id } });
  }

  async createWishlists(
    user: UserProfileResponseDto,
    createWishlistDto: CreateWishlistDto,
  ) {
    const { name, image, itemsId } = createWishlistDto;
    const wishes = await this.wishRepository.findBy({ id: In(itemsId) });

    return await this.wishListRepository.save({
      name,
      image,
      owner: user,
      items: wishes,
    });
  }

  async getWishlist(user: UserProfileResponseDto, wishlistId: number) {
    const wishlist = await this.wishListRepository.findOne({
      where: { id: wishlistId, owner: { id: user.id } },
      relations: { owner: true, items: true },
    });

    return wishlist;
  }

  async updateWishlist(
    user: UserProfileResponseDto,
    wishlistId: number,
    updateWishlistDto: UpdateWishlistDto,
  ) {
    const { itemsId, ...wishlist } = updateWishlistDto;

    if (!itemsId) {
      const wishes = await this.wishRepository.findBy({
        id: In(updateWishlistDto.itemsId),
      });
      wishlist['items'] = wishes;
    }
    const { affected } = await this.wishListRepository.update(
      { id: wishlistId, owner: { id: user.id } },
      wishlist,
    );

    if (!affected)
      throw new BadRequestException(
        'Не удалось изменить вишлист. Попробуйте обновить страницу.',
      );

    return await this.wishListRepository.findOneBy({ id: wishlistId });
  }

  async removeWishlist(user: UserProfileResponseDto, wishlistId: number) {
    const removedWishlist = await this.getWishlist(user, wishlistId);

    if (!removedWishlist)
      throw new BadRequestException(
        'Не удалось удалить вишлист. Попробуйте обновить страницу.',
      );

    await this.wishListRepository.delete({
      owner: { id: user.id },
      id: wishlistId,
    });
    return removedWishlist;
  }
}
