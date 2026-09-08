import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const studyState = sqliteTable('study_state', {
  id: integer('id').primaryKey(),
  data: text('data').notNull(),
  revision: integer('revision').notNull().default(0),
});
