import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/db";
import { usersTable } from "@/db/schema";

export async function POST() {
  try {
    // Verificar se já existe um usuário admin
    const existingUsers = await db.select().from(usersTable).limit(1);

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: "Admin user already exists" },
        { status: 400 }
      );
    }

    // Criar usuário admin padrão
    const adminEmail = "admin@fs.adelbr.tech";
    const adminPassword = "admin123456"; // Senha padrão - deve ser alterada após primeiro login
    const hashedPassword = await hash(adminPassword, 12);

    const newUser = await db
      .insert(usersTable)
      .values({
        id: crypto.randomUUID(),
        name: "Administrador",
        email: adminEmail,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Criar conta de email/senha
    const { accountsTable } = await import("@/db/schema");
    await db.insert(accountsTable).values({
      id: crypto.randomUUID(),
      accountId: newUser[0].id,
      providerId: "credential",
      userId: newUser[0].id,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      message: "Admin user created successfully",
      credentials: {
        email: adminEmail,
        password: adminPassword,
        note: "Please change this password after first login",
      },
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      {
        message: "Error creating admin user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
