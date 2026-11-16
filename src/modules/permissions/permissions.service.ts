import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isCriticalPermissionCode } from '../../common/constants/roles';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  create(createPermissionDto: CreatePermissionDto) {
    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  findAll() {
    return this.permissionRepository.find();
  }

  async findOne(id: number) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException(`Permission #${id} not found`);
    }
    return permission;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.findOne(id);
    if (
      updatePermissionDto.code !== undefined &&
      isCriticalPermissionCode(permission.code) &&
      updatePermissionDto.code !== permission.code
    ) {
      throw new ConflictException(
        `No se puede cambiar el code del permiso crítico "${permission.code}"`,
      );
    }
    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  async setActive(id: number, isActive: boolean) {
    const permission = await this.findOne(id);
    if (!isActive && isCriticalPermissionCode(permission.code)) {
      throw new ConflictException(
        `No se puede desactivar el permiso crítico "${permission.code}"`,
      );
    }
    permission.isActive = isActive;
    return this.permissionRepository.save(permission);
  }
}
