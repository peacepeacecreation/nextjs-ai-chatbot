'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/toast';
import { UserPrompt } from '@/lib/db/schema';

export default function EditPromptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const promptType = searchParams.get('type');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [prompt, setPrompt] = useState<UserPrompt | null>(null);
  const [promptText, setPromptText] = useState('');

  useEffect(() => {
    const fetchPrompt = async () => {
      if (!promptType) {      toast({
        type: 'error',
        description: 'Не вказано тип промпта для редагування'
      });
        router.push('/');
        return;
      }

      try {
        const response = await fetch('/api/prompts');
        
        if (!response.ok) {
          throw new Error('Помилка при отриманні промптів');
        }
        
        const prompts = await response.json();
        const currentPrompt = prompts.find((p: UserPrompt) => p.promptType === promptType);
        
        if (!currentPrompt) {            toast({
              type: 'error',
              description: 'Промпт не знайдено'
            });
          router.push('/');
          return;
        }
        
        setPrompt(currentPrompt);
        setPromptText(currentPrompt.promptText);
      } catch (error) {
        console.error('Error fetching prompt:', error);
        toast({
          type: 'error',
          description: error instanceof Error ? error.message : 'Не вдалося завантажити промпт'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompt();
  }, [promptType, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promptText.trim() || !promptType) {
      toast({
        type: 'error',
        description: 'Текст промпта не може бути порожнім'
      });
      return;
    }

    setIsSaving(true);

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
        throw new Error('Щось пішло не так при оновленні промпта');
      }

      toast({
        type: 'success',
        description: 'Промпт успішно оновлено'
      });
      
      router.push('/');
    } catch (error) {
      console.error('Помилка при оновленні промпта:', error);
      toast({
        type: 'error',
        description: error instanceof Error ? error.message : 'Щось пішло не так'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!promptType || !window.confirm('Ви впевнені, що хочете видалити цей промпт?')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/prompts?promptType=${encodeURIComponent(promptType)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Щось пішло не так при видаленні промпта');
      }

      toast({
        type: 'success',
        description: 'Промпт успішно видалено'
      });
      
      router.push('/');
    } catch (error) {
      console.error('Помилка при видаленні промпта:', error);
      toast({
        type: 'error',
        description: error instanceof Error ? error.message : 'Щось пішло не так'
      });
    } finally {
      setIsDeleting(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center py-10">
          <p className="text-xl text-gray-500 mb-4">Промпт не знайдено</p>
          <Button onClick={() => router.push('/')}>Повернутися до списку</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Редагування промпта</h1>
      
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Редагування промпта: {getPromptTypeName(promptType || '')}</CardTitle>
            <CardDescription>
              Змініть текст промпта або видаліть його
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">            
            <div className="space-y-2">
              <Label htmlFor="promptText">Текст промпта</Label>
              <Textarea
                id="promptText"
                placeholder="Введіть текст промпта..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="min-h-[350px]"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" type="button" onClick={() => router.push('/')}>
                Скасувати
              </Button>
              <Button 
                variant="destructive" 
                type="button" 
                onClick={handleDelete} 
                disabled={isDeleting || isSaving}
              >
                {isDeleting ? 'Видалення...' : 'Видалити промпт'}
              </Button>
            </div>
            <Button type="submit" disabled={isSaving || isDeleting}>
              {isSaving ? 'Збереження...' : 'Зберегти зміни'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
