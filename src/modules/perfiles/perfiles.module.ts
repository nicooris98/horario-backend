import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilesService } from './perfiles.service';
import { PerfilesController } from './perfiles.controller';
import { Perfil } from './entities/perfil.entity';
import { PerfilPermiso } from './entities/perfil-permiso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Perfil, PerfilPermiso])],
  controllers: [PerfilesController],
  providers: [PerfilesService],
  exports: [TypeOrmModule, PerfilesService],
})
export class PerfilesModule {}
