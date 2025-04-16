"use server";

import { db } from "@/db/drizzle";
import { feedback } from "@/db/schema";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

const feedbackSchema = z.object({
  feedbackContent: z.string().min(5).max(500),
  stars: z.number().min(1).max(5),
  userId: z.string(),
});

type FeedbackInput = z.infer<typeof feedbackSchema>;

export async function submitFeedback(input: FeedbackInput) {
  try {

    const session = await auth.api.getSession({
      headers: await headers() 
  })

  
    // Validate input
    const validatedInput = feedbackSchema.parse(input);
    if(!session?.user || session?.user?.id !== validatedInput.userId){
      throw new Error("Unauthorized");
    }
    
    // Insert into database
    await db.insert(feedback).values({
      id: nanoid(),
      feedbackContent: validatedInput.feedbackContent,
      stars: validatedInput.stars,
      userId: validatedInput.userId,
      createdTime: new Date(),
    });
    
    // Revalidate any paths that might display feedback stats
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    throw new Error("Failed to submit feedback. Please try again.");
  }
} 