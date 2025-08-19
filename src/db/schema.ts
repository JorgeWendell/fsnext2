
import { relations } from "drizzle-orm";
import {  pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";



export const usersTable = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    password: text("password").notNull(),
    
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

export const representantesTable = pgTable("representantes", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
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
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updateAt: timestamp("update_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const alunosTableRelations = relations(alunosTable, ({ one }) => ({
    escola: one(escolasTable, {
        fields: [alunosTable.escola],
        references: [escolasTable.id],
    }),
}))

export const alunoFinance = relations(alunosTable, ({ one }) => ({
    finances: one(financesTable, {
        fields: [alunosTable.id],
        references: [financesTable.alunoId],
    }),
}))

export const financeMethod =pgEnum("finances_method", ["pix", "debit", "creditvista", "creditparc", "bank_slip"]);

export const financeBankSlip = pgEnum("finances_bank_slip", ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);

export const financesTable = pgTable("finances", {
    id: uuid("id").primaryKey().defaultRandom(),
    method: financeMethod("method").notNull(),
    bank_slip: financeBankSlip("bank_slip"),
    valueTotal: text("value").notNull(),
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