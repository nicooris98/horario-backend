import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { AccountActivationChallenge } from './entities/account-activation-challenge.entity';
import { UserActivationService } from './activation/user-activation.service';
import { EmailModule } from '../../common/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, AccountActivationChallenge]),
    EmailModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserActivationService],
  exports: [UsersService],
})
export class UsersModule {}
