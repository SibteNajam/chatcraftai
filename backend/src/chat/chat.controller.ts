import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Public } from 'src/decorators/isPublic';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@Controller('chat')
@ApiBearerAuth('Authorization')
@ApiTags('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

 

  @Public()
  @Post(':fromUserId/:toUserId')
  async follow(@Param('fromUserId') fromUserId: string, @Param('toUserId') toUserId: string) {
      return this.chatService.getOrCreateChat(fromUserId, toUserId);
  }

  @Public()
  @Get('chat/:id')
  async getChats(@Param('id') id: string) {
      return this.chatService.getChat(id);
  }

  @Public()
  @Get('chat/:id/chat-messages')
  async getChatMessages(@Param('id') id: string) {
      return this.chatService.getChatMessages(id);
  }

  @Public()
  @Get('/chat-messages/:userId')
  async getChatWithMessages(@Param('userId') userId: string) {
      return this.chatService.getChatWithMessages(userId);
  }

//   @Get()
//   findAll() {
//     return this.favouriteService.findAll();
//   }
}
