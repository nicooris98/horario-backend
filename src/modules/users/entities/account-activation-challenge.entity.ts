import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  Index,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { User } from './user.entity';

@Entity('account_activation_challenges')
@Index(
  'UQ_account_activation_password_setup_token',
  ['passwordSetupTokenHash'],
  {
    unique: true,
    where: '"password_setup_token_hash" IS NOT NULL',
  },
)
export class AccountActivationChallenge {
  @PrimaryColumn({ name: 'user_id', type: 'integer' })
  userId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ name: 'code_hash', type: 'char', length: 64 })
  codeHash: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'failed_attempts', type: 'smallint', default: 0 })
  failedAttempts: number;

  @Column({ name: 'last_sent_at', type: 'timestamptz' })
  lastSentAt: Date;

  @Column({ name: 'send_window_started_at', type: 'timestamptz' })
  sendWindowStartedAt: Date;

  @Column({ name: 'sends_in_window', type: 'smallint', default: 1 })
  sendsInWindow: number;

  @Column({ name: 'consumed_at', type: 'timestamptz', nullable: true })
  consumedAt: Date | null;

  @Column({
    name: 'password_setup_token_hash',
    type: 'char',
    length: 64,
    nullable: true,
  })
  passwordSetupTokenHash: string | null;

  @Column({
    name: 'password_setup_token_expires_at',
    type: 'timestamptz',
    nullable: true,
  })
  passwordSetupTokenExpiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
