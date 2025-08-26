"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { alunosTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const updateAlbum = actionClient
  .schema(
    z.object({
      id: z.string(),
      album: z.boolean().optional(),
      valor_album: z.string().optional(),
    })
  )
  .action(async ({ parsedInput }) => {
    const { id, album, valor_album } = parsedInput;

    await db
      .update(alunosTable)
      .set({
        album: album ?? false,
        valor_album,
      })
      .where(eq(alunosTable.id, id));

    revalidatePath("/albuns");
    return { success: true };
  });
