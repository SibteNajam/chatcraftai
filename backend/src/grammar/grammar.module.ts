import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GrammarService } from './grammar.service';
import { GrammarController } from './grammar.controller';

@Module({
    imports: [ConfigModule],
    controllers: [GrammarController],
    providers: [GrammarService],
    exports: [GrammarService],
})
export class GrammarModule { }