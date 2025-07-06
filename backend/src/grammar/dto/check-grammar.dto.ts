import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CheckGrammarDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(5000, { message: 'Text cannot exceed 5000 characters' })
    text: string;
}