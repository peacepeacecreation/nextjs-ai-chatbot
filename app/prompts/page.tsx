'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/toast';
import type { UserPrompt } from '@/lib/db/schema';

export default function PromptsListPage() {
  const [prompts, setPrompts] = useState<UserPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch('/api/prompts');
        
        if (!response.ok) {
          throw new Error('Помилка при отриманні промптів');
        }
        
        const data = await response.json();
        setPrompts(data);
      } catch (error) {
        console.error('Error fetching prompts:', error);
        toast({
          type: 'error',
          description: error instanceof Error ? error.message : 'Не вдалося завантажити промпти'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  const getPromptTypeName = (type: string) => {
    const types: { [key: string]: string } = {
      'lesson': 'Урок',
      'question': 'Запитання',
      'task': 'Завдання',
      'story': 'Історія',
      'custom': 'Власний',
    };
    return types[type] || type;
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Мої промпти</h1>
        <Link href="/prompts/add">
          <Button>Додати новий промпт</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-500 mb-4">У вас поки немає збережених промптів</p>
          <Link href="/prompts/add">
            <Button>Створити перший промпт</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <Card key={`${prompt.userId}-${prompt.promptType}`} className="h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{getPromptTypeName(prompt.promptType)}</CardTitle>
                  <Link
                    href={`/prompts/edit?type=${prompt.promptType}`}
                    className="p-2 hover:bg-muted rounded-full"
                  >
                    <span className="sr-only">Редагувати</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                    >
                      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </Link>
                </div>
                <CardDescription>
                  Оновлено: {new Date(prompt.updatedAt).toLocaleDateString('uk-UA')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="whitespace-pre-wrap">
                  {prompt.promptText.length > 300 
                    ? `${prompt.promptText.substring(0, 300)}...` 
                    : prompt.promptText}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
