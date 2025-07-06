import { ApiProperty } from '@nestjs/swagger';

export class GrammarErrorDto {
    @ApiProperty({
        description: 'Original incorrect text',
        example: 'teh',
    })
    original: string;

    @ApiProperty({
        description: 'Suggested correction',
        example: 'the',
    })
    suggestion: string;

    @ApiProperty({
        description: 'Start index of the error in the original text',
        example: 5,
    })
    startIndex: number;

    @ApiProperty({
        description: 'End index of the error in the original text',
        example: 8,
    })
    endIndex: number;

    @ApiProperty({
        description: 'Type of error',
        enum: ['grammar', 'spelling', 'punctuation'],
        example: 'spelling',
    })
    type: 'grammar' | 'spelling' | 'punctuation';

    @ApiProperty({
        description: 'Brief explanation of the error',
        example: 'Spelling error',
        required: false,
    })
    message?: string;
}

export class GrammarResponseDto {
    @ApiProperty({
        description: 'Whether the text has grammar errors',
        example: true,
    })
    hasErrors: boolean;

    @ApiProperty({
        description: 'Array of grammar corrections',
        type: [GrammarErrorDto],
    })
    corrections: GrammarErrorDto[];

    @ApiProperty({
        description: 'Original text that was checked',
        example: 'This is a sample text with potencial errors.',
    })
    originalText: string;
}