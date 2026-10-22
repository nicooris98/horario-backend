import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { EntityManager, In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateDashboardUserDto } from './dto/create-dashboard-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleName } from '../../common/constants/roles';
import { UserActivationService } from './activation/user-activation.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly activationService: UserActivationService,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.findOneByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const { userId, delivery } = await this.userRepository.manager.transaction(
      async (manager) => {
        const user = manager.create(User, {
          firstName: createUserDto.first_name,
          lastName: createUserDto.last_name,
          email: createUserDto.email,
          password: hashedPassword,
          isActive: false,
        });
        const saved = await manager.save(User, user);
        const activationDelivery =
          await this.activationService.createInitialChallenge(manager, saved);
        return { userId: saved.id, delivery: activationDelivery };
      },
    );

    await this.activationService.sendActivationCode(delivery);
    return this.findOne(userId);
  }

  async createFromDashboard(dto: CreateDashboardUserDto) {
    const existingUser = await this.findOneByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }



    const { savedId, delivery } = await this.userRepository.manager.transaction(
      async (manager) => {
        // Validar roles dentro de la transaccion, bloqueandolos (FOR SHARE)
        // para que no se puedan desactivar hasta que termine la asignacion
        const roles = dto.role_ids
          ? await this.resolveActiveRoles(manager, dto.role_ids)
          : undefined;


        const user = manager.create(User, {
          firstName: dto.first_name,
          lastName: dto.last_name,
          email: dto.email,

          password: null,
          isActive: false,
        });


        if (roles) {
          user.roles = roles;
        }

        const saved = await manager.save(User, user);

        const activationDelivery =
          await this.activationService.createInitialChallenge(manager, saved);
        return { savedId: saved.id, delivery: activationDelivery };
      },
    );

    await this.activationService.sendActivationCode(delivery);
    return this.findOne(savedId);
  }

  verifyActivationCode(email: string, code: string) {
    return this.activationService.verifyCode(email, code);
  }

  setActivationPassword(token: string, password: string, confirmation: string) {
    return this.activationService.setPassword(token, password, confirmation);
  }

  resendActivationCode(email: string): Promise<{ message: string }> {
    return this.activationService.resendCode(email);

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

  async findOneWithPermissions(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { roles: { permissions: true } },
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
      if (!user.password) {
        throw new BadRequestException(
          'La contraseña debe configurarse mediante el flujo de activación',
        );
      }
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.isActive !== undefined) {
      if (updateUserDto.isActive && !user.isActive) {
        throw new BadRequestException(
          'La cuenta debe activarse con el código de activación',
        );
      }
      if (updateUserDto.isActive === false) {
        await this.assertCanDeactivate(user, actorId);
      }
      user.isActive = updateUserDto.isActive;
    }

    // Datos del usuario y relaciones de roles en una sola transaccion.
    // Los roles se validan dentro de ella con bloqueo FOR SHARE.
    await this.userRepository.manager.transaction(async (manager) => {
      if (updateUserDto.role_ids) {
        user.roles = await this.resolveActiveRoles(
          manager,
          updateUserDto.role_ids,
        );
      }
      await manager.save(User, user);
    });

    return this.findOne(id);
  }

  async remove(id: number, actorId?: number) {
    const user = await this.findOne(id);
    await this.assertCanDeactivate(user, actorId);

    user.isActive = false;
    await this.userRepository.save(user);

    return this.findOne(id);
  }


  async ensureConfiguredAdmin(
    manager: EntityManager,
    configuration: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    },
  ): Promise<{ created: boolean; roleAssigned: boolean }> {
    const adminRole = await manager.findOne(Role, {
      where: { name: RoleName.ADMIN },
    });

    if (!adminRole) {
      throw new NotFoundException(
        'The admin role must be seeded before the administrator account',
      );
    }

    if (!adminRole.isActive) {
      throw new BadRequestException(
        'The configured admin role is inactive; activate it explicitly before seeding',
      );
    }

    let user = await manager.findOne(User, {
      where: { email: configuration.email },
      relations: { roles: true },
    });
    let created = false;

    if (!user) {
      const hashedPassword = await bcrypt.hash(configuration.password, 10);
      user = manager.create(User, {
        firstName: configuration.firstName,
        lastName: configuration.lastName,
        email: configuration.email,
        password: hashedPassword,
        roles: [adminRole],
      });
      await manager.save(User, user);
      created = true;
    } else {
      if (!user.isActive) {
        throw new BadRequestException(
          'The configured admin account is inactive; activate it explicitly before seeding',
        );
      }

      const roleAssigned = (user.roles ?? []).some(
        (role) => role.id === adminRole.id,
      );
      if (!roleAssigned) {
        user.roles = [...(user.roles ?? []), adminRole];
        await manager.save(User, user);
      }
      return { created, roleAssigned: !roleAssigned };
    }

    return { created, roleAssigned: true };
  }


  private async resolveActiveRoles(
    manager: EntityManager,
    roleIds: number[],
  ): Promise<Role[]> {
    const uniqueIds = [...new Set(roleIds)];
    // pessimistic_read = SELECT ... FOR SHARE: las asignaciones concurrentes no
    // se bloquean entre si, pero una desactivacion (FOR UPDATE) debe esperar.
    const roles =
      uniqueIds.length === 0
        ? []
        : await manager.find(Role, {
          where: { id: In(uniqueIds) },
          lock: { mode: 'pessimistic_read' },
          order: { id: 'ASC' },
        });

    if (roles.length !== uniqueIds.length) {
      const found = new Set(roles.map((role) => role.id));
      const missing = uniqueIds.filter((roleId) => !found.has(roleId));

      throw new BadRequestException(`Roles inexistentes: ${missing.join(', ')}`);


    }

    const inactivos = roles.filter((role) => !role.isActive);
    if (inactivos.length > 0) {
      const nombres = inactivos.map((role) => role.name).join(', ');
      throw new BadRequestException(`Roles inactivos: ${nombres}`);
    }

    return roles;
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
