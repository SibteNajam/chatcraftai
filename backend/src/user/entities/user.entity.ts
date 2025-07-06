
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { ChatMessage } from 'src/chat-messages/entities/chat-message.entity';
import { Chat } from 'src/chat/entities/chat.entity';

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: false })
  email: string;

  @ApiProperty()
  @Column({ unique: false })
  name: string;

  @ApiProperty()
  @Column({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  dateOfBirth: Date;


  @ApiHideProperty()
  @Column({ nullable: true })
  @Exclude()
  password: string;


  @Column({ default: false })
  isDeleted: boolean;

  @Exclude()
  @ApiHideProperty()
  @Column({ default: false })
  isVerified: boolean;

  @ApiProperty()
  @Exclude()
  @Column({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  passwordUpdatedAt: Date;

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

  @OneToMany(() => Chat, (chat) => chat.fromUser)
  chats: Chat[];

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.sender)
  chatMessage: ChatMessage[];


}

