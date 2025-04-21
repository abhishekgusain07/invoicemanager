"use server";

import { db } from "@/db/drizzle";
import { feedback, featureRequests, featurePriorityEnum } from "@/db/schema";
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

const featureRequestSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  priority: z.enum(["low", "medium", "high"]),
  userId: z.string().optional(),
});

type FeedbackInput = z.infer<typeof feedbackSchema>;
type FeatureRequestInput = z.infer<typeof featureRequestSchema>;

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

export async function submitFeatureRequest(input: FeatureRequestInput) {
  try {
    // We don't need a session here as we're allowing all users to submit feature requests
    // const session = await auth.api.getSession({
    //   headers: await headers()
    // });

    // Validate input
    const validatedInput = featureRequestSchema.parse(input);
    
    // Insert into dedicated feature requests table
    await db.insert(featureRequests).values({
      id: nanoid(),
      title: validatedInput.title,
      description: validatedInput.description,
      priority: validatedInput.priority as any, // Using the enum from the schema
      userId: validatedInput.userId || "anonymous", // Handle missing userId
      createdTime: new Date(),
      updatedTime: new Date(),
      status: "new", // Default status for new feature requests
    });
    
    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/help");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to submit feature request:", error);
    throw new Error("Failed to submit feature request. Please try again.");
  }
} 