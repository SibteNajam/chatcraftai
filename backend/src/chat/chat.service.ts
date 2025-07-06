// chat.service.ts
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { ChatMessage } from 'src/chat-messages/entities/chat-message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Get or create a chat between two users
  async getOrCreateChat(fromUserId: string, toUserId: string) {
    const existingChat = await this.chatRepository
      .createQueryBuilder('chat')
      .where(
        '(chat.fromUser = :fromUserId AND chat.toUser = :toUserId) OR (chat.fromUser = :toUserId AND chat.toUser = :fromUserId)',
        { fromUserId, toUserId },
      )
      .getOne();

    if (existingChat) {
      return {
        status: 'Success',
        data: {data:existingChat},
        statusCode:200,
        message:'Successful'
      };
    }

    const chat = this.chatRepository.create({
      fromUser: await this.userRepository.findOne({where:{id:fromUserId}}),
      toUser: await this.userRepository.findOne({where:{id:toUserId}})
    });
    let chatObj = await this.chatRepository.save(chat);
    return {
      status: 'Success',
      data: {data:chatObj},
      statusCode:200,
      message:'Successful'
    };
  }

  // Create a new message in a chat
  async createMessage(chatId: string, userId: string, content: string) {
    
    const chat = await this.chatRepository.findOne({where:{id:chatId},relations:['fromUser','toUser']});
    let receiverId;
    if(userId === chat.fromUser.id){
      receiverId = chat.toUser.id
    }else{
      receiverId = chat.fromUser.id
    }
    const reciever = await this.userRepository.findOne({where:{id:receiverId}})
    const sender = await this.userRepository.findOne({where:{id:userId}});
    let chatMessage = new ChatMessage();
    chatMessage.chat = chat;
    chatMessage.sender = sender;
    chatMessage.message = content;
    console.log(chatMessage);
    console.log(reciever);
    let message = await this.chatMessageRepository.save(chatMessage);

    // return message
  }

  // Get all messages for a particular chat
  async getChat(chatId: string){
    const chats = await this.chatRepository.findOne({
      where: { id:chatId },
      order: { createdAt: 'ASC' },
    });
    if(chats){
      return {
        status: 'Success',
        data: {data:chats},
        statusCode:200,
        message:'Successful'
      };
    }else{
      throw new UnprocessableEntityException({
        status: 'Fail',
        data: {},
        statusCode:422,
        message:'Chat not found'
      });
    }
    
  }
  // Get all messages for a particular chat
  async getChatMessages(chatId: string){
    const chatMessages = await this.chatMessageRepository.find({
      where: { chat:{id:chatId} },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
      select:{id:true, message:true,sender:{id:true, name:true} }
    });
    if(chatMessages){
      return {
        status: 'Success',
        data: {data:chatMessages},
        statusCode:200,
        message:'Successful'
      };
    }else{
      throw new UnprocessableEntityException({
        status: 'Fail',
        data: {},
        statusCode:422,
        message:'Chat not found'
      });
    }
  }

  // Get all messages for a particular chat
  async getChatWithMessages(userId: string){
    const chats = await this.chatRepository.find({
      where: [
        { fromUser: { id: userId } },  // First condition: fromUserId = userId
        { toUser: { id: userId } }     // Second condition: toUserId = userId
      ],
      
      relations:['chatMessage','fromUser','toUser'],
      order: { createdAt: 'DESC' },
    });

    const filteredChats = chats.filter(chat => chat.chatMessage && chat.chatMessage.length > 0);
    // Transform the data to include only the other user and the latest message
    const transformedChats = await Promise.all(
      filteredChats.map(async (chat) => {
        // Determine if the current user is the sender (fromUser) or the recipient (toUser)
        const otherUser = chat.fromUser.id === userId ? chat.toUser : chat.fromUser;

        // Get the latest message by ordering chatMessages by createdAt in descending order
        const latestMessage = chat.chatMessage.length > 0
          ? chat.chatMessage.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]  // Latest message
          : null;


        // Return the transformed chat with other user details and latest message
        return {
          id: chat.id,
          isActive: chat.isActive,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
          },
          latestMessage: latestMessage ? {
            id: latestMessage.id,
            content: latestMessage.message,
            createdAt: latestMessage.createdAt,
          } : null,
        };
      })
    );
    
    const sortedData = transformedChats.sort((a, b) => {
      const dateA = new Date(a.latestMessage.createdAt);
      const dateB = new Date(b.latestMessage.createdAt);
      //@ts-ignore
      return dateB - dateA; // descending order (most recent first)
    });
    if(chats){
      return {
        status: 'Success',
        data: {data:sortedData},
        statusCode:200,
        message:'Successful'
      };
    }else{
      throw new UnprocessableEntityException({
        status: 'Fail',
        data: {},
        statusCode:422,
        message:'Chat not found'
      });
    }
  }
}
