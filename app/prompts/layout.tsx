'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PromptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="mr-2"
            >
              ← Повернутися до чату
            </Button>
            <nav className="flex items-center space-x-4 lg:space-x-6">
              <Link 
                href="/prompts" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Усі промпти
              </Link>
              <Link 
                href="/prompts/add" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Додати промпт
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
