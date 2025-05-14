'use client';

import { startTransition, useMemo, useOptimistic, useState, useEffect } from 'react';

import { saveChatModelAsCookie } from '@/app/(chat)/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chatModels } from '@/lib/ai/models';
import { cn } from '@/lib/utils';

import { CheckCircleFillIcon, ChevronDownIcon } from './icons';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import type { Session } from 'next-auth';
import type { UserPrompt } from '@/lib/db/schema';

export function ModelSelector({
  session,
  selectedModelId,
  className,
}: {
  session: Session;
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);
  const [userPrompts, setUserPrompts] = useState<UserPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user prompts when component mounts
  useEffect(() => {
    const fetchUserPrompts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/prompts');
        
        if (response.ok) {
          const data = await response.json();
          setUserPrompts(data);
        }
      } catch (error) {
        console.error('Error fetching user prompts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPrompts();
  }, []);

  const userType = session.user.type;
  const { availableChatModelIds } = entitlementsByUserType[userType];

  const availableChatModels = chatModels.filter((chatModel) =>
    availableChatModelIds.includes(chatModel.id),
  );

  // Get the prompt type name for display
  const getPromptTypeName = (type: string) => {
    const types: { [key: string]: string } = {
      'lesson': 'English',
      'question': 'Запитання',
      'task': 'Завдання',
      'story': 'Історія',
      'custom': 'Власний',
    };
    return types[type] || type;
  };

  // Create custom model objects for user prompts
  const customPromptModels = useMemo(() => {
    return userPrompts.map(prompt => ({
      id: "custom-" + prompt.promptType,
      name: getPromptTypeName(prompt.promptType),
      description: prompt.promptText.substring(0, 100) + (prompt.promptText.length > 100 ? '...' : ''),
      promptType: prompt.promptType
    }));
  }, [userPrompts]);

  // Determine if the selected model is a standard model or a custom prompt
  const selectedChatModel = useMemo(() => {
    if (optimisticModelId.startsWith('custom-')) {
      const promptType = optimisticModelId.replace('custom-', '');
      const customModel = customPromptModels.find(model => model.promptType === promptType);
      return customModel;
    }
    
    return availableChatModels.find(
      (chatModel) => chatModel.id === optimisticModelId,
    );
  }, [optimisticModelId, availableChatModels, customPromptModels]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          data-testid="model-selector"
          variant="outline"
          className="md:px-2 md:h-[34px]"
        >
          {selectedChatModel?.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {/* Standard Models */}
        {availableChatModels.map((chatModel) => {
          const { id } = chatModel;

          return (
            <DropdownMenuItem
              data-testid={"model-selector-item-" + id}
              key={id}
              onSelect={() => {
                setOpen(false);

                startTransition(() => {
                  setOptimisticModelId(id);
                  saveChatModelAsCookie(id);
                });
              }}
              data-active={id === optimisticModelId}
              asChild
            >
              <button
                type="button"
                className="gap-4 group/item flex flex-row justify-between items-center w-full"
              >
                <div className="flex flex-col gap-1 items-start">
                  <div>{chatModel.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {chatModel.description}
                  </div>
                </div>

                <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                  <CheckCircleFillIcon />
                </div>
              </button>
            </DropdownMenuItem>
          );
        })}

        {userPrompts.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-sm font-semibold">Ваші власні промпти</div>
            
            {/* Custom Prompts from user */}
            {customPromptModels.map((promptModel) => (
              <DropdownMenuItem
                key={promptModel.id}
                onSelect={() => {
                  setOpen(false);

                  startTransition(() => {
                    setOptimisticModelId(promptModel.id);
                    saveChatModelAsCookie(promptModel.id);
                  });
                }}
                data-active={promptModel.id === optimisticModelId}
                asChild
              >
                <button
                  type="button"
                  className="gap-4 group/item flex flex-row justify-between items-center w-full"
                >
                  <div className="flex flex-col gap-1 items-start">
                    <div>{promptModel.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {promptModel.description}
                    </div>
                  </div>

                  <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                    <CheckCircleFillIcon />
                  </div>
                </button>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Default export for compatibility with both named and default imports
export default ModelSelector;
