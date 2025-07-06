import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatService } from 'src/chat/chat.service';
import { UserService } from 'src/user/user.service';
import { ChatMessageSchema } from 'src/utils/Requests';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';

@Injectable()
export class ChatMessagesService {

  // async getChatMessages(chatid: string) {
  //   return await this.chatMessageRepository.find({
  //     where: {
  //       chat: {
  //         id: chatid,
  //       },
  //     },
  //     relations: ['sender', 'chat'],
  //   });
  // }
  // constructor(
  //   @InjectRepository(ChatMessage)
  //   private readonly chatMessageRepository: Repository<ChatMessage>,
  //   private readonly chatService: ChatService,
  //   private readonly userService: UserService,
  // ) {}

  // async create(createChatMessageDto: ChatMessageSchema, userid: string) {
  //   let user, chat;
  //   if (
  //     createChatMessageDto.chatid !== null &&
  //     createChatMessageDto.chatid !== undefined
  //   ) {
  //     chat = await this.chatService.findOne({where:{id:createChatMessageDto.chatid}});  
  //   } else {
  //     throw new Error('Chat id is required');
  //   }
  //   if (
  //     createChatMessageDto.chatid !== null &&
  //     createChatMessageDto.chatid !== undefined
  //   ) {
  //     user = await this.userService.findOne(userid);
  //   } else {
  //     throw new Error('User id is required');
  //   }
  //   const chatMessage = new ChatMessage();
  //   chatMessage.message = createChatMessageDto.message;
  //   chatMessage.messageType = createChatMessageDto.messagetype;
  //   chatMessage.chat = chat;
  //   chatMessage.sender = user;
  //   if (
  //     chatMessage.message !== null &&
  //     chatMessage.message !== undefined &&
  //     chatMessage.message.length > 0
  //   ) {
  //     if (
  //       chatMessage.messageType !== null &&
  //       chatMessage.messageType !== undefined
  //     ) {
  //       return await this.chatMessageRepository.save(chatMessage);
  //     } else {
  //       throw new Error('Message type is required');
  //     }
  //   } else {
  //     throw new Error('Message cannot be empty');
  //   }
  // }

}
