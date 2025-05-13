import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  compatibility: 'strict', // strict mode, enable when using the OpenAI API
});

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': openai('gpt-4o-mini'),
        'chat-model-reasoning': wrapLanguageModel({
            model: openai('gpt-4o-mini'),
            middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': openai('gpt-4o-mini'),
        'artifact-model': openai('gpt-4o-mini'),
      },
      imageModels: {
        'small-model': openai.image('dall-e-3'),
      },
    });
