import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { FranchiseStatsDto } from './dto/franchise-stats.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
        /*
    const hashedPassword = await bcrypt.hash(createUserDto.password,10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    */
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
  async findFranchises(): Promise<User[]> {
  return this.userRepository.find({
    where: {
      role: UserRole.FRANCHISE,
    },
  });
}

  async getFranchiseStats(): Promise<FranchiseStatsDto[]> {
    const franchises = await this.userRepository.find({
      where: {
        role: UserRole.FRANCHISE,
      },
      relations: {
        salesTickets: true,
      },
    });

    return franchises.map((franchise) => {
      const tickets = franchise.salesTickets.length;

      const revenue = franchise.salesTickets.reduce(
        (sum, ticket) => sum + Number(ticket.totalAmount),
        0,
      );

      return {
        id: franchise.id,
        name: franchise.name,
        city: franchise.city ?? "",
        tickets,
        revenue,
        isActive: franchise.isActive,
      };
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOne(id);

    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  async toggleStatus(id: number): Promise<User> {
    const user = await this.findOne(id);

    user.isActive = !user.isActive;

    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);

    await this.userRepository.remove(user);
  }

}