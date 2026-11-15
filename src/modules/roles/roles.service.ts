import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isAdminRoleName, isCriticalPermissionCode } from '../../common/constants/roles';
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
    return this.roleRepository.find({ relations: { permissions: true } });
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
    this.assertAdminRoleProtected(role, updateRoleDto);
    Object.assign(role, updateRoleDto);
    return this.roleRepository.save(role);
  }

  async setActive(id: number, isActive: boolean) {
    // Bloquea la fila del rol (FOR UPDATE): espera a que terminen las
    // asignaciones en curso que lo tienen con FOR SHARE. Si algo falla,
    // la transaccion se revierte.
    return this.roleRepository.manager.transaction(async (manager) => {
      const role = await manager.findOne(Role, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!role) {
        throw new NotFoundException(`Role #${id} not found`);
      }
      if (!isActive && isAdminRoleName(role.name)) {
        throw new ConflictException(
          'No se puede desactivar el rol admin: el sistema quedaría sin administración',
        );
      }
      role.isActive = isActive;
      return manager.save(Role, role);
    });
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
    const permission = role.permissions.find((p) => p.id === permissionId);
    if (
      permission &&
      isAdminRoleName(role.name) &&
      isCriticalPermissionCode(permission.code)
    ) {
      throw new ConflictException(
        `No se puede quitar el permiso crítico "${permission.code}" del rol admin`,
      );
    }
    role.permissions = role.permissions.filter((p) => p.id !== permissionId);
    await this.roleRepository.save(role);
    return role;
  }

  // El rol admin no se puede renombrar ni desactivar por update(): ambos
  // caminos romperían los chequeos @Roles('admin') y el guard de permisos.
  private assertAdminRoleProtected(role: Role, dto: UpdateRoleDto) {
    if (!isAdminRoleName(role.name)) {
      return;
    }
    if (dto.isActive === false) {
      throw new ConflictException(
        'No se puede desactivar el rol admin: el sistema quedaría sin administración',
      );
    }
    if (dto.name !== undefined && dto.name.trim().toLowerCase() !== 'admin') {
      throw new ConflictException(
        'No se puede renombrar el rol admin',
      );
    }
  }
}
