import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const role = await this.roleRepository.findOne({
      where: { id: createUserDto.idRole },
    });
    if (!role) {
      throw new NotFoundException(`Role #${createUserDto.idRole} not found`);
    }
    const user = this.userRepository.create({
      nombre: createUserDto.nombre,
      apellido: createUserDto.apellido,
      email: createUserDto.email,
      password: createUserDto.password,

    });
    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find({ relations: { role: true, userRoles: true } });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { role: true, userRoles: true },
    });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }
  async findOneByEmail(email: string) {
  return this.userRepository.findOne({
    where:{email

    }
  })
  }
  


  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (updateUserDto.idRole !== undefined) {
      const role = await this.roleRepository.findOne({
        where: { id: updateUserDto.idRole },
      });
      if (!role) {
        throw new NotFoundException(`Role #${updateUserDto.idRole} not found`);
      }
      user.role = role;
    }
    if (updateUserDto.nombre !== undefined) user.nombre = updateUserDto.nombre;
    if (updateUserDto.apellido !== undefined) user.apellido = updateUserDto.apellido;
    if (updateUserDto.email !== undefined) user.email = updateUserDto.email;
    if (updateUserDto.password !== undefined) user.password = updateUserDto.password;
    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.userRepository.softRemove(user);
    return user;
  }
}
