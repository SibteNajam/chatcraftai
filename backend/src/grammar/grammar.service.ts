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

            CRITICAL INDEX RULES:
            - Use zero-based indexing
            - startIndex: position where the error begins
            - endIndex: position where the error ends (EXCLUSIVE - like JavaScript slice)
            - For word "thes" at position 0: startIndex=0, endIndex=4 (because "thes".length is 4)
            - For word "peen" at position 8: startIndex=8, endIndex=12
            - ALWAYS: endIndex = startIndex + original.length
            - Test your indices: text.slice(startIndex, endIndex) should equal the original error text
            
            VALIDATION EXAMPLES:
            - Text: "thes is peen"
            - Error 1: "thes" → startIndex=0, endIndex=4
            - Error 2: "peen" → startIndex=8, endIndex=12
            
            OTHER RULES:
            - Only flag actual errors, not style preferences
            - Provide clear, helpful suggestions
            - Focus on grammar, spelling, and punctuation errors only
            - Return ONLY the JSON object, no additional text
            - If no errors found, return hasErrors: false with empty corrections array`,
                    },
                    {
                        role: 'user',
                        content: `Please check this text for grammar, spelling, and punctuation errors and calculate precise indices: "${text}"

Text analysis:
- Text length: ${text.length}
- Characters: ${text.split('').map((char, i) => `${i}:'${char}'`).join(', ')}

Remember: endIndex must be startIndex + original.length`,
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
                result.corrections = result.corrections.map((correction, index) => {
                    // Fix endIndex if it's wrong
                    const expectedEndIndex = correction.startIndex + correction.original.length;

                    if (correction.endIndex !== expectedEndIndex) {
                        this.logger.warn(`Fixing endIndex for correction ${index}: was ${correction.endIndex}, should be ${expectedEndIndex}`);
                        correction.endIndex = expectedEndIndex;
                    }

                    // Validate the correction by extracting the text
                    const extractedText = text.slice(correction.startIndex, correction.endIndex);
                    if (extractedText !== correction.original) {
                        this.logger.error(`Index mismatch for correction ${index}: extracted "${extractedText}", expected "${correction.original}"`);

                        // Try to find the correct position
                        const correctStartIndex = text.indexOf(correction.original);
                        if (correctStartIndex !== -1) {
                            correction.startIndex = correctStartIndex;
                            correction.endIndex = correctStartIndex + correction.original.length;
                            this.logger.warn(`Fixed indices for "${correction.original}": ${correction.startIndex}-${correction.endIndex}`);
                        }
                    }

                    return correction;
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