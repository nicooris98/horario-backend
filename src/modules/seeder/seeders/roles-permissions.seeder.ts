import { EntityManager } from 'typeorm';
import { Permission } from '../../permissions/entities/permission.entity';
import { Role } from '../../roles/entities/role.entity';

const roles = [
  { name: 'admin', description: 'Administrador del sistema' },
  { name: 'docente', description: 'Docente (solo lectura)' },
] as const;

const permissions = [
  { name: 'Crear roles', code: 'roles.create' },
  { name: 'Ver roles', code: 'roles.read' },
  { name: 'Editar/activar roles', code: 'roles.update' },
  { name: 'Asignar permisos a roles', code: 'roles.assign_permission' },

  { name: 'Crear permisos', code: 'permissions.create' },
  { name: 'Ver permisos', code: 'permissions.read' },
  { name: 'Editar permisos', code: 'permissions.update' },

  { name: 'Crear usuarios', code: 'users.create' },
  { name: 'Ver usuarios', code: 'users.read' },
  { name: 'Editar usuarios', code: 'users.update' },
  { name: 'Eliminar usuarios', code: 'users.delete' },
  { name: 'Asignar rol a usuarios', code: 'users.assign_role' },

  { name: 'Crear planes de estudio', code: 'study-plans.create' },
  { name: 'Ver planes de estudio', code: 'study-plans.read' },
  { name: 'Editar planes de estudio', code: 'study-plans.update' },
  { name: 'Eliminar planes de estudio', code: 'study-plans.delete' },

] as const;

const rolePermissionCodes: Record<string, readonly string[]> = {
  admin: permissions.map(({ code }) => code),
  docente: ['roles.read', 'permissions.read'],
};

export class RolesPermissionsSeeder {
  async run(manager: EntityManager): Promise<void> {
    const roleRepository = manager.getRepository(Role);
    const permissionRepository = manager.getRepository(Permission);
    const seededRoles = new Map<string, Role>();
    const seededPermissions = new Map<string, Permission>();

    for (const definition of roles) {
      let role = await roleRepository.findOne({
        where: { name: definition.name },
        relations: { permissions: true },
      });

      if (!role) {
        role = await roleRepository.save(
          roleRepository.create({
            ...definition,
            isActive: true,
            permissions: [],
          }),
        );
      }

      seededRoles.set(role.name, role);
    }

    for (const definition of permissions) {
      let permission = await permissionRepository.findOne({
        where: { code: definition.code },
      });

      if (!permission) {
        permission = await permissionRepository.save(
          permissionRepository.create({
            ...definition,
            isActive: true,
          }),
        );
      }

      seededPermissions.set(permission.code, permission);
    }

    for (const [roleName, permissionCodes] of Object.entries(
      rolePermissionCodes,
    )) {
      const role = seededRoles.get(roleName);
      if (!role) {
        throw new Error(`Seed role definition missing: ${roleName}`);
      }

      const missingCodes = permissionCodes.filter(
        (code) => !seededPermissions.has(code),
      );
      if (missingCodes.length > 0) {
        throw new Error(
          `Seed permissions missing for role ${roleName}: ${missingCodes.join(', ')}`,
        );
      }

      const assignedIds = new Set(
        (role.permissions ?? []).map((permission) => permission.id),
      );
      const additions = permissionCodes.flatMap((code) => {
        const permission = seededPermissions.get(code);
        return permission && !assignedIds.has(permission.id)
          ? [permission]
          : [];
      });

      if (additions.length > 0) {
        role.permissions = [...(role.permissions ?? []), ...additions];
        await roleRepository.save(role);
      }
    }
  }
}
