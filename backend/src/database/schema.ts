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
  name: text('name').notNull().unique(),
  laboratoryId: integer('laboratory_id').references(() => laboratory.id),
  info: json('info'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const computer_log = pgTable('computer_log', {
  id: serial('id').primaryKey(),
  computerId: integer('computer_id').references(() => computer.id),
  oldObject: json('old_object').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});