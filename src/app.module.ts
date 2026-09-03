import { Module } from '@nestjs/common';
import { AsignaturasModule } from './modules/asignaturas/asignaturas.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('DB_HOST', configService.get<string>('DB_NAME'))
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          database: configService.get<string>('DB_NAME'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASS'),
          port: configService.get<number>('DB_PORT'),
          entities: [
          __dirname + '/**/*.entity{.ts,.js}',
      ],
          synchronize: true
        }
      }
    }),
    AsignaturasModule,
    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
