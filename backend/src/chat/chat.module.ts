import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ChatGateway } from 'src/chat-messages/chat-messages.gateway';
import { User } from 'src/user/entities/user.entity';
import { ChatMessage } from 'src/chat-messages/entities/chat-message.entity';
import { ChatController } from './chat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Chat,User,ChatMessage])],
  controllers: [ChatController],
  providers: [ChatService,ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
