import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface GrammarError {
    original: string;
    suggestion: string;
    startIndex: number;
    endIndex: number;
    type: 'grammar' | 'spelling' | 'punctuation';
    message?: string;
}

export interface GrammarCheckResult {
    hasErrors: boolean;
    corrections: GrammarError[];
}

@Injectable()
export class GrammarService {
    private readonly logger = new Logger(GrammarService.name);
    private openai: OpenAI;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (apiKey) {
            this.openai = new OpenAI({
                apiKey,
            });
            this.logger.log('OpenAI client initialized successfully');
        } else {
            this.logger.warn('OpenAI API key not found in environment variables');
        }
    }

    async checkGrammar(text: string): Promise<GrammarCheckResult> {
        if (!this.openai) {
            throw new Error('OpenAI API key not configured');
        }

        if (!text.trim()) {
            return {
                hasErrors: false,
                corrections: [],
            };
        }

        try {
            this.logger.debug(`Checking grammar for text: "${text.substring(0, 50)}..."`);

            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are a professional grammar and spelling checker. Analyze the given text and return a JSON object with the following structure:
            {
              "hasErrors": boolean,
              "corrections": [
                {
                  "original": "original incorrect text",
                  "suggestion": "corrected text",
                  "startIndex": number,
                  "endIndex": number,
                  "type": "grammar|spelling|punctuation",
                  "message": "brief explanation of the error"
                }
              ]
            }

            IMPORTANT RULES:
            - Only flag actual errors, not style preferences
            - Be extremely precise with startIndex and endIndex (zero-based indexing)
            - Provide clear, helpful suggestions
            - Focus on grammar, spelling, and punctuation errors only
            - Return ONLY the JSON object, no additional text
            - If no errors found, return hasErrors: false with empty corrections array
            - Ensure startIndex and endIndex match the exact position of the error in the original text
            - Double-check your indices before responding`,
                    },
                    {
                        role: 'user',
                        content: `Please check this text for grammar, spelling, and punctuation errors: "${text}"`,
                    },
                ],
                max_tokens: 1000,
                temperature: 0,
            });

            const content = response.choices[0].message.content;
            this.logger.debug(`OpenAI response: ${content}`);

            let result: GrammarCheckResult;

            try {
                result = JSON.parse(content);
            } catch (parseError) {
                this.logger.error(`Failed to parse OpenAI response: ${content}`, parseError.stack);
                throw new Error('Invalid response format from OpenAI');
            }

            // Validate the response structure
            if (typeof result.hasErrors !== 'boolean' || !Array.isArray(result.corrections)) {
                this.logger.error(`Invalid response structure: ${JSON.stringify(result)}`);
                throw new Error('Invalid response format from OpenAI');
            }

            // Validate each correction
            if (result.corrections) {
                result.corrections.forEach((correction, index) => {
                    if (
                        typeof correction.startIndex !== 'number' ||
                        typeof correction.endIndex !== 'number' ||
                        correction.startIndex < 0 ||
                        correction.endIndex > text.length ||
                        correction.startIndex >= correction.endIndex
                    ) {
                        this.logger.warn(`Invalid correction indices at index ${index}: ${JSON.stringify(correction)}`);
                    }
                });
            }

            this.logger.debug(`Grammar check completed. Found ${result.corrections?.length || 0} errors`);
            return result;
        } catch (error) {
            this.logger.error('OpenAI API error:', error.stack);

            if (error.code === 'insufficient_quota') {
                throw new Error('OpenAI API quota exceeded');
            }

            if (error.code === 'rate_limit_exceeded') {
                throw new Error('OpenAI API rate limit exceeded');
            }

            throw new Error('Failed to check grammar');
        }
    }
}