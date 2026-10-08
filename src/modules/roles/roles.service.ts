import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly permissionsService: PermissionsService,
  ) {}

  create(createRoleDto: CreateRoleDto) {
    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  findAll() {
    return this.roleRepository.find();
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role #${id} not found`);
    }
    return role;
  }

  async findOneWithPermissions(id: number) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { permissions: true },
    });
    if (!role) {
      throw new NotFoundException(`Role #${id} not found`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne(id);
    Object.assign(role, updateRoleDto);
    return this.roleRepository.save(role);
  }

  async setActive(id: number, isActive: boolean) {
    const role = await this.findOne(id);
    role.isActive = isActive;
    return this.roleRepository.save(role);
  }

    async addPermission(roleId: number, permissionId: number) {
    const role = await this.findOneWithPermissions(roleId);
    const permission = await this.permissionsService.findOne(permissionId);

    const yaLoTiene = role.permissions.some((p) => p.id === permission.id);
    if (!yaLoTiene) {
      role.permissions.push(permission);
      await this.roleRepository.save(role);
    }
    return role;
  }

  async removePermission(roleId: number, permissionId: number) {
    const role = await this.findOneWithPermissions(roleId);
    role.permissions = role.permissions.filter((p) => p.id !== permissionId);
    await this.roleRepository.save(role);
    return role;
  }
}