import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import { and, eq } from 'drizzle-orm';
import postgres from 'postgres';
import { userPrompt } from '@/lib/db/schema';
import { auth } from '@/app/(auth)/auth';

// Create DB connection
const connectionString = process.env.DATABASE_URL || '';
const client = postgres(connectionString);
const db = drizzle(client, { schema: { userPrompt } });

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Необхідно авторизуватися' },
        { status: 401 }
      );
    }

    const { promptType, promptText } = await req.json();

    if (!promptType || !promptText) {
      return NextResponse.json(
        { error: 'Тип та текст промпта є обов\'язковими' },
        { status: 400 }
      );
    }

    // Check if this user already has a prompt of this type
    const existingPrompts = await db
      .select()
      .from(userPrompt)
      .where(
        and(
          eq(userPrompt.userId, session.user.id),
          eq(userPrompt.promptType, promptType)
        )
      );

    // If a prompt already exists, update it
    if (existingPrompts.length > 0) {
      await db
        .update(userPrompt)
        .set({
          promptText,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(userPrompt.userId, session.user.id),
            eq(userPrompt.promptType, promptType)
          )
        );

      return NextResponse.json(
        { message: 'Промпт успішно оновлено' },
        { status: 200 }
      );
    }

    // Otherwise, insert a new prompt
    const result = await db.insert(userPrompt).values({
      userId: session.user.id,
      promptType,
      promptText,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Промпт успішно додано', id: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding prompt:', error);
    return NextResponse.json(
      { error: 'Помилка при додаванні промпта' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Необхідно авторизуватися' },
        { status: 401 }
      );
    }

    const prompts = await db
      .select()
      .from(userPrompt)
      .where(eq(userPrompt.userId, session.user.id));

    return NextResponse.json(prompts, { status: 200 });
  } catch (error) {
    console.error('Error getting prompts:', error);
    return NextResponse.json(
      { error: 'Помилка при отриманні промптів' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Необхідно авторизуватися' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const promptType = searchParams.get('promptType');
    
    if (!promptType) {
      return NextResponse.json(
        { error: 'Тип промпта є обов\'язковим параметром' },
        { status: 400 }
      );
    }

    await db
      .delete(userPrompt)
      .where(
        and(
          eq(userPrompt.userId, session.user.id),
          eq(userPrompt.promptType, promptType)
        )
      );

    return NextResponse.json(
      { message: 'Промпт успішно видалено' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { error: 'Помилка при видаленні промпта' },
      { status: 500 }
    );
  }
}
