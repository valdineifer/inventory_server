import {
  integer, json, pgTable, serial, text, timestamp,
} from 'drizzle-orm/pg-core';

export const laboratory = pgTable('laboratory', {
  id: serial('id').primaryKey(),
  name: text('name'),
  code: text('code').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const computer = pgTable('computer', {
  id: serial('id').primaryKey(),
  mac: text('mac').notNull().unique(),
  ip: text('ip').notNull().unique(),
  laboratoryId: integer('laboratory_id').references(() => laboratory.id),
  info: json('info'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
