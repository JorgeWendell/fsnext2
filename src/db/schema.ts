
import { relations } from "drizzle-orm";
import {  boolean, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";


export const usersTable = pgTable("users", {
    id: text("id").primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull(), 
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull()
    
});

export const sessionsTable = pgTable("sessions", {
                    id: text('id').primaryKey(),
                    expiresAt: timestamp('expires_at').notNull(),
 token: text('token').notNull().unique(),
 createdAt: timestamp('created_at').notNull(),
 updatedAt: timestamp('updated_at').notNull(),
 ipAddress: text('ip_address'),
 userAgent: text('user_agent'),
 userId: text('user_id').notNull().references(()=> usersTable.id, { onDelete: 'cascade' })
                });

export const accountsTable = pgTable("accounts", {
                    id: text('id').primaryKey(),
                    accountId: text('account_id').notNull(),
 providerId: text('provider_id').notNull(),
 userId: text('user_id').notNull().references(()=> usersTable.id, { onDelete: 'cascade' }),
 accessToken: text('access_token'),
 refreshToken: text('refresh_token'),
 idToken: text('id_token'),
 accessTokenExpiresAt: timestamp('access_token_expires_at'),
 refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
 scope: text('scope'),
 password: text('password'),
 createdAt: timestamp('created_at').notNull(),
 updatedAt: timestamp('updated_at').notNull()
                });

export const verificationsTable = pgTable("verifications", {
                    id: text('id').primaryKey(),
                    identifier: text('identifier').notNull(),
 value: text('value').notNull(),
 expiresAt: timestamp('expires_at').notNull(),
 createdAt: timestamp('created_at'),
 updatedAt: timestamp('updated_at')
                });

export const representantesTable = pgTable("representantes", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updateAt: timestamp("update_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const escolasTable = pgTable("escolas", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    phone: text("phone").notNull(),
    representanteId: uuid("representanteId").notNull().references(() => representantesTable.id, {onDelete: "set null"}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updateAt: timestamp("update_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const representanteRelations = relations(representantesTable, ({ many }) => ({
    escolas: many(escolasTable),
}));

export const escolaRelations = relations(escolasTable, ({ many }) => ({
    alunos: many(alunosTable),
}))

export const escolaTableRelations = relations(escolasTable, ({ one }) => ({
    representante: one(representantesTable, {
        fields: [escolasTable.representanteId],
        references: [representantesTable.id],
    }),
}))

export const alunosSexEnum = pgEnum("alunos_sex", ["male", "female"]);

export const alunosTable = pgTable("alunos", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    class: text("class").notNull(),
    escola: uuid("escola").notNull().references(() => escolasTable.id , {onDelete: "set null"}),
    address: text("address").notNull(),
    phone: text("phone").notNull(),    
    sex: alunosSexEnum("sex").notNull(),    
    album: boolean("album").notNull().default(false),
    valor_album: text("valor_album"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updateAt: timestamp("update_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const alunosTableRelations = relations(alunosTable, ({ one }) => ({
    escola: one(escolasTable, {
        fields: [alunosTable.escola],
        references: [escolasTable.id],
    }),
}))

export const financeMethod =pgEnum("finances_method", ["pix", "debit", "creditvista", "creditparc", "bank_slip"]);

export const financeBankSlip = pgEnum("finances_bank_slip", ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);

export const financesTable = pgTable("finances", {
    id: uuid("id").primaryKey().defaultRandom(),
    method: financeMethod("method").notNull(),
    bank_slip: financeBankSlip("bank_slip"),
    valueTotal: text("value").notNull(),
    parcelasPagas: text("parcelas_pagas"), // JSON string para armazenar status das parcelas
    alunoId: uuid("alunoId").notNull().references(() => alunosTable.id , {onDelete: "set null"}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updateAt: timestamp("update_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const financesTableRelations = relations(financesTable, ({ one }) => ({
    aluno: one(alunosTable, {
        fields: [financesTable.alunoId],
        references: [alunosTable.id],
    }),
}))

export const alunoFinance = relations(alunosTable, ({ one }) => ({
    finances: one(financesTable, {
        fields: [alunosTable.id],
        references: [financesTable.alunoId],
    }),
}))