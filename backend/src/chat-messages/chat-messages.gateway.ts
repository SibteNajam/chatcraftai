// chat.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from 'src/chat/chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  private logger: Console = console;

  // @SubscribeMessage('join_chat')
  // async handleJoinChat(@MessageBody() data: { userId: string; otherUserId: string }, @ConnectedSocket() client: Socket) {
  //   const chat = await this.chatService.getOrCreateChat(data.userId, data.otherUserId);
  //   client.join(`chat-${chat.id}`);
  //   this.logger.log(`User ${data.userId} joined chat ${chat.id}`);
  // }

  @SubscribeMessage('send_message')
  async handleSendMessage(@MessageBody() data: { chatId: string; userId: string; message: string }) {
    console.log('123');
    const message = await this.chatService.createMessage(data.chatId, data.userId, data.message);
    this.server.emit('receive_message', message);
  }

  // @SubscribeMessage('disconnect_chat')
  // async handleDisconnectChat(@MessageBody() data: { chatId: string }, @ConnectedSocket() client: Socket) {
  //   client.leave(`chat-${data.chatId}`);
  //   this.logger.log(`User disconnected from chat ${data.chatId}`);
  // }

  server: Server;

  afterInit(server: Server) {
    this.server = server;
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
