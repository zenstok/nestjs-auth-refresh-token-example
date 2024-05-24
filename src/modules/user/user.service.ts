import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CryptoService } from '../crypto/crypto.service';
import { FindDto } from '../../api/utils/find.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private cryptoService: CryptoService,
  ) {}

  async create({ password, ...rest }: CreateUserDto) {
    const user = this.userRepository.create({
      ...rest,
      password: await this.cryptoService.generateHash(password),
    });

    return await this.userRepository.save(user);
  }

  async findAll(findDto: FindDto) {
    const [results, count] = await this.userRepository.findAndCount({
      skip: findDto.offset,
      take: findDto.limit === -1 ? undefined : findDto.limit,
      order: {
        id: 'ASC',
      },
    });

    return {
      results,
      total: count,
    };
  }

  findOne(id: number, options?: FindOneOptions<User>): Promise<User | null> {
    return this.userRepository.findOne({
      ...options,
      where: { ...options?.where, id },
    });
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async update(id: number, { password, ...rest }: UpdateUserDto) {
    return this.userRepository.update(
      { id },
      {
        ...(password
          ? {
              password: await this.cryptoService.generateHash(password),
            }
          : {}),
        ...rest,
      },
    );
  }

  remove(id: number) {
    return this.userRepository.delete({ id });
  }
}
