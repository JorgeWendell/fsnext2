"use server";
import { db } from "@/db";
import { representantesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const createRepresentante = async (name: string, phone: string) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect("/authentication");
    }
    const representante = await db.insert(representantesTable).values({
        name,
        phone,
    }).returning();
    

}


// export const createEscola = async (name: string, address: string, phone: string, representanteId: string) => {
//     const session = await auth.api.getSession({
//         headers: await headers(),
//     });
//     if (!session?.user) {
//         redirect("/authentication");
//     }
//     const escola = await db.insert(escolasTable).values({
//         name,
//         address,
//         phone,
//         representanteId,
//     }).returning();
//     return escola;
// }

// export const createAluno = async (name: string, class: string, escola: string, address: string, phone: string, sex: string) => {
//     const session = await auth.api.getSession({
//         headers: await headers(),
//     });
//     if (!session?.user) {
//         redirect("/authentication");
//     }
//     const aluno = await db.insert(alunosTable).values({
//         name,
//         class,
//         escola,
//         address,
//         phone,
//         sex,
//     }).returning();
//     return aluno;
// }
