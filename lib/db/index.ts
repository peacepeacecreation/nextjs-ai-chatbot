import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Get database connection string from environment variable
const connectionString = process.env.DATABASE_URL || '';

// Create the connection
const client = postgres(connectionString);

// Create the drizzle client
export const db = drizzle(client, { schema });
