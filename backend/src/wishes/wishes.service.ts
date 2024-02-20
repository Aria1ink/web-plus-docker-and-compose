import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfileResponseDto } from 'src/users/dto/user-profile-response.dto';
import { Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish) private wishRepository: Repository<Wish>,
  ) {}

  async createWish(createWishDto: CreateWishDto, id: number) {
    const wish = {
      ...createWishDto,
      owner: { id },
    };

    await this.wishRepository.save(wish);
  }

  async findLastWishes() {
    const wishes: Wish[] = await this.wishRepository.find({
      order: {
        createdAt: 'desc',
      },
      take: 40,
    });

    return wishes;
  }

  async findTopWishes() {
    const wishes: Wish[] = await this.wishRepository.find({
      order: {
        copied: 'desc',
      },
      take: 20,
    });

    return wishes;
  }

  async findWishById(user: UserProfileResponseDto, wishId: number) {
    const wish: Wish = await this.wishRepository.findOne({
      where: { id: +wishId },
      relations: {
        owner: true,
        offers: {
          user: true,
        },
      },
    });

    if (!wish) throw new NotFoundException('такого подарка не существует');

    const { offers, ...partialWish } = wish;

    const offersResponse = offers.map((offer) => {
      const { user, ...rest } = offer;
      return {
        ...rest,
        name: user.username,
      };
    });

    return { ...partialWish, offers: offersResponse };
  }

  async updateWishById(
    user: UserProfileResponseDto,
    wishId: number,
    updateWishDto: UpdateWishDto,
  ) {
    const { affected } = await this.wishRepository.update(
      { owner: { id: user.id }, id: wishId, raised: 0 },
      updateWishDto,
    );

    if (!affected)
      throw new BadRequestException(
        'Не удалось изменить подарок. Возможно его кто-то уже поддержал?',
      );
  }

  async removeWishById(user: UserProfileResponseDto, wishId: number) {
    const removedWish = await this.wishRepository.findOne({
      where: { owner: { id: user.id }, id: wishId, raised: 0 },
    });

    if (!removedWish)
      throw new BadRequestException(
        'Не удалось удалить подарок. Возможно его кто-то уже поддержал?',
      );

    await this.wishRepository.delete({
      owner: { id: user.id },
      id: wishId,
    });

    return removedWish;
  }

  async copyWithById(user: UserProfileResponseDto, wishId: number) {
    const { id, name, link, image, price, description, owner } =
      await this.wishRepository.findOne({
        where: { id: wishId },
        relations: { owner: true },
      });

    if (user.id === owner.id)
      throw new BadRequestException('Такой подарок уже был добавлен');

    const createWishDto: CreateWishDto = {
      name,
      link,
      image,
      price,
      description,
    };

    await this.createWish(createWishDto, user.id);
    await this.wishRepository.increment({ id }, 'copied', 1);
  }
}
