import { relations } from 'drizzle-orm';
import {
  integer, jsonb, pgEnum, pgTable, text, timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { ComputerInfo, Settings } from '~/types/models';

export const laboratory = pgTable('laboratory', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  description: text('description'),
  code: text('code').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const statusEnum = pgEnum('status', ['verified', 'unverified', 'rejected']);

export const computer = pgTable('computer', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  mac: text('mac').notNull().unique(),
  name: text('name').notNull().unique(),
  laboratoryId: integer('laboratory_id').references(() => laboratory.id, { onDelete: 'set null' }),
  info: jsonb('info').$type<ComputerInfo>(),
  token: uuid('token').notNull().unique().defaultRandom(),
  status: statusEnum('status').default('verified'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const computerLog = pgTable('computer_log', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  computerId: integer('computer_id').references(() => computer.id, { onDelete: 'cascade' }),
  oldObject: jsonb('old_object').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const user = pgTable('user', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable('settings', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull().$type<Settings>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});


// RELATIONS

export const computerRelations = relations(computer, ({ many, one }) => ({
  logs: many(computerLog),
  laboratory: one(laboratory, {
    fields: [computer.laboratoryId],
    references: [laboratory.id],
  }),
}));

export const computerLogRelations = relations(computerLog, ({ one }) => ({
  computer: one(computer, {
    fields: [computerLog.computerId],
    references: [computer.id],
    relationName: 'computer',
  })
}));

export const laboratoryRelations = relations(laboratory, ({ many }) => ({
  computers: many(computer),
}));
