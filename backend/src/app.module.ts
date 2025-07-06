import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { databaseProvider } from './utils/connectionOptions';
import { APP_GUARD } from '@nestjs/core';
import { GrammarModule } from './grammar/grammar.module';
import { JWTGuard } from './guards/jwt.guard';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { ChatMessagesModule } from './chat-messages/chat-messages.module';


@Module({
  imports: [
    TypeOrmModule.forRoot(databaseProvider),
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    GrammarModule,
    AuthModule,
    ChatModule,
    ChatMessagesModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JWTGuard,
    },
  ],
})
export class AppModule { }
