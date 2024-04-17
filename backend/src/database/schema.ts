import { relations } from 'drizzle-orm';
import {
   integer, json, pgTable, serial, text, timestamp,
} from 'drizzle-orm/pg-core';

export const laboratories = pgTable('laboratories', {
   id: serial('id').primaryKey(),
   name: text('name'),
   code: text('code').notNull().unique(),
   createdAt: timestamp('created_at').notNull().defaultNow(),
   updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const computers = pgTable('computers', {
   id: serial('id').primaryKey(),
   mac: text('mac').notNull().unique(),
   ip: text('ip').notNull().unique(),
   laboratoryId: integer('laboratory_id').references(() => laboratories.id),
   info: json('info'),
   createdAt: timestamp('created_at').notNull().defaultNow(),
   updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
