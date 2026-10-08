import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateDashboardUserDto } from './dto/create-dashboard-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleName } from '../../common/constants/roles';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.findOneByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      firstName: createUserDto.first_name,
      lastName: createUserDto.last_name,
      email: createUserDto.email,
      password: hashedPassword,
    });

    const saved = await this.userRepository.save(user);
    return this.findOne(saved.id);
  }

  async createFromDashboard(dto: CreateDashboardUserDto) {
    const user = await this.create(dto);

    if (dto.isActive === false) {
      user.isActive = false;
      await this.userRepository.save(user);
    }

    if (dto.role_ids) {
      return this.setRoles(user.id, dto.role_ids);
    }

    return this.findOne(user.id);
  }

  findAll() {
    return this.userRepository.find({
      relations: { roles: true },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { roles: true },
    });

    if (!user) {
      throw new NotFoundException(`No existe el usuario con id ${id}`);
    }

    return user;
  }

  async findOneByEmail(email: string, withRoles = false) {
    return this.userRepository.findOne({
      where: { email: email.trim().toLowerCase() },
      relations: withRoles ? { roles: true } : undefined,
    });
  }

  async findOneById(id: number) {
    return this.userRepository.findOne({
      where: { id },
      relations: { roles: true },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto, actorId?: number) {
    const user = await this.findOne(id);

    if (updateUserDto.first_name !== undefined) {
      user.firstName = updateUserDto.first_name;
    }

    if (updateUserDto.last_name !== undefined) {
      user.lastName = updateUserDto.last_name;
    }

    if (updateUserDto.email !== undefined) {
      const existingUser = await this.findOneByEmail(updateUserDto.email);

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Ya existe un usuario con ese email');
      }

      user.email = updateUserDto.email;
    }

    if (updateUserDto.password !== undefined) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.isActive !== undefined) {
      if (updateUserDto.isActive === false) {
        await this.assertCanDeactivate(user, actorId);
      }
      user.isActive = updateUserDto.isActive;
    }

    await this.userRepository.save(user);

    if (updateUserDto.role_ids) {
      return this.setRoles(id, updateUserDto.role_ids);
    }

    return this.findOne(id);
  }

  async remove(id: number, actorId?: number) {
    const user = await this.findOne(id);
    await this.assertCanDeactivate(user, actorId);

    user.isActive = false;
    await this.userRepository.save(user);

    return this.findOne(id);
  }

  private async setRoles(userId: number, roleIds: number[]) {
    const user = await this.findOne(userId);
    const uniqueIds = [...new Set(roleIds)];
    const roles =
      uniqueIds.length === 0
        ? []
        : await this.roleRepository.findBy({ id: In(uniqueIds) });

    if (roles.length !== uniqueIds.length) {
      throw new NotFoundException('Uno o más roles no existen');
    }

    user.roles = roles;
    await this.userRepository.save(user);
    return this.findOne(userId);
  }

  private async assertCanDeactivate(user: User, actorId?: number) {
    if (actorId != null && user.id === actorId) {
      throw new BadRequestException('No puede desactivar su propia cuenta');
    }

    const isAdmin = (user.roles ?? []).some(
      (role) => role.name === RoleName.ADMIN && role.isActive,
    );

    if (!isAdmin || !user.isActive) {
      return;
    }

    const adminCount = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.name = :name', { name: RoleName.ADMIN })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .andWhere('role.isActive = :roleActive', { roleActive: true })
      .getCount();

    if (adminCount <= 1) {
      throw new BadRequestException(
        'No se puede desactivar al último administrador',
      );
    }
  }
}
