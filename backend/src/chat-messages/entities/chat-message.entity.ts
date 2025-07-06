import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Chat } from 'src/chat/entities/chat.entity';
import { User } from '../../user/entities/user.entity';

@Entity('chatmessages')
export class ChatMessage {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @ManyToOne(() => Chat, (chat) => chat.id)
  chat: Chat;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255, charset: 'utf8mb4' })
  message: string;

  @ApiProperty()
  @ManyToOne(() => User, (user) => user.id)
  sender: User;



  @ApiProperty()
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', default: null, nullable: true })
  deletedAt: Date;
}
