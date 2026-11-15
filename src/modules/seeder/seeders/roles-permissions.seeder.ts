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

  { name: 'Crear materias', code: 'subjects.create' },
  { name: 'Ver materias', code: 'subjects.read' },
  { name: 'Editar materias', code: 'subjects.update' },
  { name: 'Eliminar materias', code: 'subjects.delete' },

  { name: 'Crear carreras', code: 'degrees.create' },
  { name: 'Ver carreras', code: 'degrees.read' },
  { name: 'Editar carreras', code: 'degrees.update' },
  { name: 'Eliminar carreras', code: 'degrees.delete' },

  { name: 'Crear ciclos lectivos', code: 'academic-cycles.create' },
  { name: 'Ver ciclos lectivos', code: 'academic-cycles.read' },
  { name: 'Editar ciclos lectivos', code: 'academic-cycles.update' },
  { name: 'Eliminar ciclos lectivos', code: 'academic-cycles.delete' },

  { name: 'Crear horas cátedra', code: 'class-hours.create' },
  { name: 'Ver horas cátedra', code: 'class-hours.read' },
  { name: 'Editar horas cátedra', code: 'class-hours.update' },
  { name: 'Eliminar horas cátedra', code: 'class-hours.delete' },

  { name: 'Crear cursos/división', code: 'course-sections.create' },
  { name: 'Ver cursos/división', code: 'course-sections.read' },
  { name: 'Editar cursos/división', code: 'course-sections.update' },
  { name: 'Eliminar cursos/división', code: 'course-sections.delete' },

  { name: 'Crear tipos de cargo', code: 'position-types.create' },
  { name: 'Ver tipos de cargo', code: 'position-types.read' },
  { name: 'Editar tipos de cargo', code: 'position-types.update' },
  { name: 'Eliminar tipos de cargo', code: 'position-types.delete' },

  { name: 'Crear regímenes', code: 'regimes.create' },
  { name: 'Ver regímenes', code: 'regimes.read' },
  { name: 'Editar regímenes', code: 'regimes.update' },
  { name: 'Eliminar regímenes', code: 'regimes.delete' },

  { name: 'Crear horarios', code: 'schedules.create' },
  { name: 'Ver horarios', code: 'schedules.read' },
  { name: 'Editar horarios', code: 'schedules.update' },
  { name: 'Eliminar horarios', code: 'schedules.delete' },

  { name: 'Crear cuatrimestres', code: 'semesters.create' },
  { name: 'Ver cuatrimestres', code: 'semesters.read' },
  { name: 'Editar cuatrimestres', code: 'semesters.update' },
  { name: 'Eliminar cuatrimestres', code: 'semesters.delete' },

  { name: 'Crear turnos', code: 'shifts.create' },
  { name: 'Ver turnos', code: 'shifts.read' },
  { name: 'Editar turnos', code: 'shifts.update' },
  { name: 'Eliminar turnos', code: 'shifts.delete' },

  {
    name: 'Crear planes por ciclo lectivo',
    code: 'study-plan-academic-cycles.create',
  },
  {
    name: 'Ver planes por ciclo lectivo',
    code: 'study-plan-academic-cycles.read',
  },
  {
    name: 'Editar planes por ciclo lectivo',
    code: 'study-plan-academic-cycles.update',
  },
  {
    name: 'Eliminar planes por ciclo lectivo',
    code: 'study-plan-academic-cycles.delete',
  },

  {
    name: 'Crear asignaciones docentes',
    code: 'teacher-assignments.create',
  },
  { name: 'Ver asignaciones docentes', code: 'teacher-assignments.read' },
  {
    name: 'Editar asignaciones docentes',
    code: 'teacher-assignments.update',
  },
  {
    name: 'Eliminar asignaciones docentes',
    code: 'teacher-assignments.delete',
  },

  { name: 'Crear docentes', code: 'teachers.create' },
  { name: 'Ver docentes', code: 'teachers.read' },
  { name: 'Editar docentes', code: 'teachers.update' },
  { name: 'Eliminar docentes', code: 'teachers.delete' },

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
