import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessagesService } from './chat-messages.service';
import { ChatGateway } from './chat-messages.gateway';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatMessagesController } from './chat-messages.controller';
import { ChatModule } from 'src/chat/chat.module';
import { UserModule } from '../user/user.module';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage,User]), ChatModule, UserModule],
  providers: [ChatMessagesService],
  controllers: [ChatMessagesController],
})
export class ChatMessagesModule {}
