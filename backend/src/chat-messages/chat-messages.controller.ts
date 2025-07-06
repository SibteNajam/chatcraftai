import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { ApiParam, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChatMessagesService } from './chat-messages.service';

@ApiBearerAuth('Authorization')
@ApiTags('Chat Messages')
@Controller('chat-messages')
@UseInterceptors(ClassSerializerInterceptor)
export class ChatMessagesController {
  constructor(private chatMessageService: ChatMessagesService) {}


}
