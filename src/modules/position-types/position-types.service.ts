import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, QueryFailedError, Repository } from 'typeorm';
import { FOREIGN_KEY_VIOLATION } from '../../common/constants/database.constants';
import { pick, requireText } from '../../common/helpers';
import {
  FIELDS,
  POSITION_TYPE_STATUSES,
} from './constants/position-types.constants';
import { CreatePositionTypeDto } from './dto/create-position-type.dto';
import { UpdatePositionTypeDto } from './dto/update-position-type.dto';
import { PositionType } from './entities/position-type.entity';

@Injectable()
export class PositionTypesService {
  constructor(
    @InjectRepository(PositionType)
    private readonly repository: Repository<PositionType>,
  ) {}

  async create(dto: CreatePositionTypeDto) {
    const data = this.normalize(pick(dto, [...FIELDS]));
    this.validate(data);
    await this.requireUniqueName(data.name);
    return this.repository.save(this.repository.create(data));
  }

  findAll() {
    return this.repository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const item = await this.repository.findOneBy({ id });
    if (!item) throw new NotFoundException(`Position type ${id} not found`);
    return item;
  }

  async update(id: number, dto: UpdatePositionTypeDto) {
    const item = await this.findOne(id);
    const data = this.normalize({ ...item, ...pick(dto, [...FIELDS]) });
    this.validate(data);
    if (data.name.toLowerCase() !== item.name.toLowerCase()) {
      await this.requireUniqueName(data.name, id);
    }
    return this.repository.save(Object.assign(item, data));
  }

  async deactivate(id: number) {
    const item = await this.findOne(id);
    item.status = 'INACTIVO';
    return this.repository.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    try {
      return await this.repository.remove(item);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === FOREIGN_KEY_VIOLATION
      ) {
        throw new ConflictException(
          `Position type ${id} has assignments and cannot be deleted; deactivate it instead`,
        );
      }
      throw error;
    }
  }

  // "Interino" e "interino" cuentan como el mismo tipo de cargo.
  private async requireUniqueName(name: string, exceptId?: number) {
    const existing = await this.repository.findOneBy({
      name: ILike(name.replace(/[\\%_]/g, '\\$&')),
    });
    if (existing && existing.id !== exceptId) {
      throw new ConflictException(
        `A position type named "${existing.name}" already exists (id ${existing.id})`,
      );
    }
  }

  private normalize(p: Partial<PositionType>) {
    return {
      ...p,
      name: requireText(p.name, 'name'),
      description: p.description?.trim() || null,
      allowsSubstitute: p.allowsSubstitute ?? false,
      // La columna estado del script no tiene DEFAULT y synchronize está en
      // false, así que un default en la entidad no llegaría a la base.
      status: requireText(p.status ?? 'ACTIVO', 'status').toUpperCase(),
    };
  }

  private validate(p: ReturnType<PositionTypesService['normalize']>) {
    if (typeof p.allowsSubstitute !== 'boolean') {
      throw new BadRequestException('allowsSubstitute must be true or false');
    }
    if (!(POSITION_TYPE_STATUSES as readonly string[]).includes(p.status)) {
      throw new BadRequestException(
        `status must be one of: ${POSITION_TYPE_STATUSES.join(', ')}`,
      );
    }
  }
}
