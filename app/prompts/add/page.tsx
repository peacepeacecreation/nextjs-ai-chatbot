'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/toast';

// A mapping of common prompt types that can be used as suggestions
const promptTypes: { [key: string]: string } = {
  'lesson': 'English',
  'question': 'Запитання',
  'task': 'Завдання',
  'story': 'Історія',
  'custom': 'Власний',
};

export default function AddPromptsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [promptType, setPromptType] = useState('');
  const [promptText, setPromptText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promptType.trim()) {
      toast({
        type: 'error',
        description: 'Тип промпта не може бути порожнім'
      });
      return;
    }
    
    if (!promptText.trim()) {
      toast({
        type: 'error',
        description: 'Текст промпта не може бути порожнім'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptType,
          promptText,
        }),
      });

      if (!response.ok) {
        throw new Error('Щось пішло не так при додаванні промпта');
      }

      toast({
        type: 'success',
        description: 'Промпт успішно додано'
      });
      
      // Reset form
      setPromptText('');
      setPromptType('');
      
      // Redirect to prompts page
      router.push('/prompts');
    } catch (error) {
      console.error('Помилка при додаванні промпта:', error);
      toast({
        type: 'error',
        description: error instanceof Error ? error.message : 'Щось пішло не так'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Додавання нових промптів</h1>
      
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Новий промпт</CardTitle>
            <CardDescription>
              Створіть новий промпт, який можна буде використовувати в чаті
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="promptType">Тип промпта</Label>
              <Input
                id="promptType"
                placeholder="Введіть тип промпта..."
                value={promptType}
                onChange={(e) => setPromptType(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(promptTypes).map(([key, label]) => (
                  <Button 
                    key={key} 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPromptType(key)}
                    className="text-xs"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="promptText">Текст промпта</Label>
              <Textarea
                id="promptText"
                placeholder="Введіть текст промпта..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="min-h-[300px]"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Скасувати
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Збереження...' : 'Зберегти промпт'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
