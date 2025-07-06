import {
    Controller,
    Post,
    Body,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GrammarService } from './grammar.service';
import { CheckGrammarDto } from './dto/check-grammar.dto';
import { GrammarResponseDto } from './dto/grammar-response.dto';
import { Public } from 'src/decorators/isPublic';

@ApiBearerAuth('Authorization')
@ApiTags('Grammar')
@Controller('grammar')
export class GrammarController {
    constructor(private readonly grammarService: GrammarService) { }

    @Public()
    @Post('check')
    @ApiOperation({
        summary: 'Check text for grammar, spelling, and punctuation errors',
        description: 'Analyzes the provided text using AI to identify and suggest corrections for grammar, spelling, and punctuation errors.',
    })
    @ApiResponse({
        status: 200,
        description: 'Grammar check completed successfully',
        type: GrammarResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - invalid input',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error - OpenAI API error',
    })
    async checkGrammar(@Body() checkGrammarDto: CheckGrammarDto): Promise<GrammarResponseDto> {
        try {
            const result = await this.grammarService.checkGrammar(checkGrammarDto.text);

            return {
                hasErrors: result.hasErrors,
                corrections: result.corrections,
                originalText: checkGrammarDto.text,
            };
        } catch (error) {
            console.error('Grammar check error:', error);

            if (error.message === 'OpenAI API key not configured') {
                throw new HttpException(
                    {
                        status: 'Error',
                        message: 'Grammar checking service is not configured',
                        statusCode: 500,
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            if (error.message === 'Failed to check grammar') {
                throw new HttpException(
                    {
                        status: 'Error',
                        message: 'Unable to check grammar at this time. Please try again.',
                        statusCode: 500,
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            throw new HttpException(
                {
                    status: 'Error',
                    message: 'An unexpected error occurred',
                    statusCode: 500,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}