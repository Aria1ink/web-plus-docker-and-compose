import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { Wish } from 'src/wishes/entities/wish.entity';
import { UserPublicProfileResponseDto } from './dto/user-public-profile-response.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Wish) private wishRepository: Repository<Wish>,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const userAlreadyExists = await this.userRepository.findBy([
      { email: createUserDto.email },
      { username: createUserDto.username },
    ]);

    if (userAlreadyExists.length > 0)
      throw new ConflictException(
        'Пользователь с таким email или username уже зарегистрирован',
      );

    const password = await bcrypt.hash(createUserDto.password, 10);

    const userDTO = {
      ...createUserDto,
      password: password,
    };

    const user = await this.userRepository.save(userDTO);
    return user;
  }

  async findSelfProfile(username: string): Promise<CreateUserDto> {
    const user: CreateUserDto = await this.userRepository
      .createQueryBuilder('user')
      .where({ username })
      .addSelect(['user.email', 'user.password'])
      .getOne();
    return user;
  }

  async getSelfWishes(userId: number) {
    const wishes: Wish[] = await this.wishRepository.findBy({
      owner: { id: userId },
    });
    return wishes;
  }

  async updateSelfProfile(userId: number, updateUserDto: UpdateUserDto) {
    const users = await this.userRepository.findBy([
      { email: updateUserDto.email },
      { username: updateUserDto.username },
    ]);

    if (users.length > 0) {
      for (const user of users) {
        if (user.id !== userId)
          throw new ConflictException(
            'Пользователь с таким логином или email уже зарегистрирован',
          );
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.userRepository.update(userId, updateUserDto);
    const user: UserProfileResponseDto = await this.userRepository
      .createQueryBuilder('user')
      .where({ id: userId })
      .addSelect('user.email')
      .getOne();

    return user;
  }

  async findById(userId: number) {
    const user: UserProfileResponseDto = await this.userRepository.findOneBy({
      id: userId,
    });
    return user;
  }

  async findByName(username: string) {
    const user: UserPublicProfileResponseDto =
      await this.userRepository.findOneBy({ username });
    return user;
  }

  async findMany(query: string) {
    const users: UserPublicProfileResponseDto[] =
      await this.userRepository.findBy([
        { username: Like(`%${query}%`) },
        { email: Like(`%${query}%`) },
      ]);

    return users;
  }

  async getUserWishes(username: string) {
    const user: UserPublicProfileResponseDto =
      await this.userRepository.findOneBy({ username });
    const wishes: Wish[] = await this.wishRepository.findBy({
      owner: { id: user.id },
    });
    return wishes;
  }
}
