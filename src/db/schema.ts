import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  decimal,
  pgEnum,
  unique,
  uuid,
  index,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  subscription: text("subscription"),
  gmailConnected: boolean("gmail_connected").default(false),
  updatedAt: timestamp("updated_at").notNull(),
});

export const gmailConnection = pgTable(
  "gmail_connection",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    email: text("email").notNull(),
    name: text("name"),
    picture: text("picture"),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    scope: text("scope").notNull(),
    providerId: text("provider_id").notNull().default("google"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => {
    return {
      userEmailIdx: unique().on(table.userId, table.email),
    };
  }
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => ({
    userIdIdx: index("session_user_id_idx").on(table.userId),
    expiresAtIdx: index("session_expires_at_idx").on(table.expiresAt),
  })
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    userIdIdx: index("account_user_id_idx").on(table.userId),
    providerAccountIdx: index("account_provider_account_idx").on(
      table.providerId,
      table.accountId
    ),
  })
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// Define invoice status enum
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "pending",
  "paid",
  "overdue",
  "cancelled",
  "draft",
  "partially_paid",
]);

// Define reminder tone enum
export const reminderToneEnum = pgEnum("reminder_tone", [
  "polite",
  "friendly",
  "neutral",
  "firm",
  "direct",
  "assertive",
  "urgent",
  "final",
  "serious",
]);

// Define feature request priority enum
export const featurePriorityEnum = pgEnum("feature_priority", [
  "low",
  "medium",
  "high",
]);

// Define feature request status enum
export const featureStatusEnum = pgEnum("feature_status", [
  "new",
  "under_review",
  "planned",
  "in_progress",
  "completed",
  "declined",
]);

// Define email delivery status enum
export const emailDeliveryStatusEnum = pgEnum("email_delivery_status", [
  "sent",
  "delivered",
  "failed",
  "opened",
  "clicked",
  "replied",
  "bounced",
]);

// Define GitHub Action status enum
export const githubActionStatusEnum = pgEnum("github_action_status", [
  "running",
  "completed",
  "failed",
  "cancelled",
  "skipped",
]);

// User Settings schema
export const userSettings = pgTable(
  "user_settings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Reminder Settings
    isAutomatedReminders: boolean("is_automated_reminders").default(true),
    firstReminderDays: integer("first_reminder_days").default(3),
    followUpFrequency: integer("follow_up_frequency").default(7),
    maxReminders: integer("max_reminders").default(3),
    firstReminderTone: reminderToneEnum("first_reminder_tone").default(
      "polite"
    ),
    secondReminderTone: reminderToneEnum("second_reminder_tone").default(
      "firm"
    ),
    thirdReminderTone: reminderToneEnum("third_reminder_tone").default(
      "urgent"
    ),

    // Account Settings
    businessName: text("business_name"),
    phoneNumber: text("phone_number"),

    // Email Settings
    fromName: text("from_name"),
    emailSignature: text("email_signature").default("Best regards,"),
    defaultCC: text("default_cc"),
    defaultBCC: text("default_bcc"),
    previewEmails: boolean("preview_emails").default(true),
    ccAccountant: boolean("cc_accountant").default(false),
    useBrandedEmails: boolean("use_branded_emails").default(false),
    sendCopyToSelf: boolean("send_copy_to_self").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("user_settings_user_id_idx").on(table.userId),
  })
);

// Template type enum
export const templateTypeEnum = pgEnum("template_type", [
  "system", // Built-in templates
  "custom", // User-created templates
]);

// Template category enum
export const templateCategoryEnum = pgEnum("template_category", [
  "reminder", // Payment reminders
  "thank_you", // Thank you notes
  "follow_up", // Follow-up emails
  "notice", // Final notices
  "welcome", // Welcome emails
  "custom", // Custom category
]);

// Email Template schema
export const emailTemplates = pgTable(
  "email_templates",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    subject: text("subject").notNull(),

    // Enhanced content support
    content: text("content").notNull(), // Legacy text content
    htmlContent: text("html_content"), // Rich HTML content
    textContent: text("text_content"), // Plain text content

    // Template organization
    tone: reminderToneEnum("tone").notNull(),
    templateType: templateTypeEnum("template_type").default("custom"),
    category: templateCategoryEnum("category").default("reminder"),

    // Template metadata
    isDefault: boolean("is_default").default(false),
    isActive: boolean("is_active").default(true),
    usageCount: integer("usage_count").default(0),
    description: text("description"),
    tags: text("tags"), // JSON array of tags

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdNameIdx: index("email_templates_user_name_idx").on(
      table.userId,
      table.name
    ),
    userIdToneIdx: index("email_templates_user_tone_idx").on(
      table.userId,
      table.tone
    ),
    userIdUsageIdx: index("email_templates_user_usage_idx").on(
      table.userId,
      table.usageCount
    ),
    userIdActiveIdx: index("email_templates_user_active_idx").on(
      table.userId,
      table.isActive
    ),
  })
);

// Invoice Manager schema
export const clientInvoices = pgTable(
  "client_invoices",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    clientName: text("client_name").notNull(),
    clientEmail: text("client_email").notNull(),
    invoiceNumber: text("invoice_number").notNull(),
    amount: decimal("amount").notNull(),
    currency: text("currency").notNull(),
    issueDate: timestamp("issue_date").notNull(),
    dueDate: timestamp("due_date").notNull(),
    description: text("description"),
    additionalNotes: text("additional_notes"),
    status: invoiceStatusEnum("status").notNull().default("pending"),
    paymentDate: timestamp("payment_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Primary composite index for user queries with ordering
    userIdCreatedAtIdx: index("client_invoices_user_created_idx").on(
      table.userId,
      table.createdAt.desc()
    ),
    userIdUpdatedAtIdx: index("client_invoices_user_updated_idx").on(
      table.userId,
      table.updatedAt.desc()
    ),

    // Status filtering indexes (most critical for dashboard)
    userIdStatusIdx: index("client_invoices_user_status_idx").on(
      table.userId,
      table.status
    ),
    userIdStatusDueDateIdx: index("client_invoices_user_status_due_idx").on(
      table.userId,
      table.status,
      table.dueDate
    ),

    // Monthly data aggregation index
    userIdIssueDateIdx: index("client_invoices_user_issue_date_idx").on(
      table.userId,
      table.issueDate
    ),

    // Invoice number uniqueness and lookup
    userIdInvoiceNumberIdx: index("client_invoices_user_invoice_number_idx").on(
      table.userId,
      table.invoiceNumber
    ),

    // Client-based filtering
    userIdClientEmailIdx: index("client_invoices_user_client_email_idx").on(
      table.userId,
      table.clientEmail
    ),

    // Overdue invoice queries (pending invoices past due date)
    overduePendingIdx: index("client_invoices_overdue_pending_idx").on(
      table.status,
      table.dueDate
    ),
  })
);

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  createdTime: timestamp("created_time").defaultNow(),
  subscriptionId: text("subscription_id"),
  stripeUserId: text("stripe_user_id"),
  status: text("status"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  planId: text("plan_id"),
  defaultPaymentMethodId: text("default_payment_method_id"),
  email: text("email"),
  userId: text("user_id"),
});

export const subscriptionPlans = pgTable("subscriptions_plans", {
  id: text("id").primaryKey(),
  createdTime: timestamp("created_time").defaultNow(),
  planId: text("plan_id"),
  name: text("name"),
  description: text("description"),
  amount: text("amount"),
  currency: text("currency"),
  interval: text("interval"),
});

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  createdTime: timestamp("created_time").defaultNow(),
  invoiceId: text("invoice_id"),
  subscriptionId: text("subscription_id"),
  amountPaid: text("amount_paid"),
  amountDue: text("amount_due"),
  currency: text("currency"),
  status: text("status"),
  email: text("email"),
  userId: text("user_id"),
});

export const feedback = pgTable("feedback", {
  id: text("id").primaryKey(),
  createdTime: timestamp("created_time").defaultNow(),
  userId: text("user_id"),
  feedbackContent: text("feedback_content"),
  stars: integer().notNull(),
});

export const featureRequests = pgTable(
  "feature_requests",
  {
    id: text("id").primaryKey(),
    createdTime: timestamp("created_time").defaultNow(),
    updatedTime: timestamp("updated_time").defaultNow(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    priority: featurePriorityEnum("priority").notNull().default("medium"),
    status: featureStatusEnum("status").notNull().default("new"),
    adminNotes: text("admin_notes"),
    upvotes: integer("upvotes").default(0),
  },
  (table) => ({
    userIdIdx: index("feature_requests_user_id_idx").on(table.userId),
    statusIdx: index("feature_requests_status_idx").on(table.status),
    priorityIdx: index("feature_requests_priority_idx").on(table.priority),
    upvotesIdx: index("feature_requests_upvotes_idx").on(table.upvotes.desc()),
  })
);

// Invoice Reminders tracking schema
// Generated Invoices schema for the invoice generation feature
export const generatedInvoices = pgTable(
  "generated_invoices",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Invoice metadata
    invoiceNumber: text("invoice_number").notNull(),
    invoiceTitle: text("invoice_title"),
    dateOfIssue: timestamp("date_of_issue").notNull(),
    paymentDue: timestamp("payment_due").notNull(),

    // Invoice configuration
    language: text("language").notNull().default("en"),
    currency: text("currency").notNull().default("EUR"),
    dateFormat: text("date_format").notNull().default("YYYY-MM-DD"),
    template: text("template").notNull().default("default"),

    // Complete invoice data as JSON
    invoiceData: text("invoice_data").notNull(), // JSON string of InvoiceGenerationData

    // Computed totals for quick querying
    totalAmount: decimal("total_amount").notNull(),

    // Sharing and access
    shareableToken: text("shareable_token"), // For public sharing
    isPubliclyShareable: boolean("is_publicly_shareable").default(false),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),

    // Soft delete
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    // Primary user queries with soft delete filtering
    userIdActiveIdx: index("generated_invoices_user_active_idx").on(
      table.userId,
      table.updatedAt.desc(),
      table.deletedAt
    ),
    userIdCreatedIdx: index("generated_invoices_user_created_idx").on(
      table.userId,
      table.createdAt.desc()
    ),

    // Public sharing lookup
    shareableTokenIdx: index("generated_invoices_shareable_token_idx").on(
      table.shareableToken
    ),
    publicShareIdx: index("generated_invoices_public_share_idx").on(
      table.isPubliclyShareable,
      table.deletedAt
    ),

    // Invoice number lookup for user
    userIdInvoiceNumberIdx: index(
      "generated_invoices_user_invoice_number_idx"
    ).on(table.userId, table.invoiceNumber),
  })
);

export const invoiceReminders = pgTable(
  "invoice_reminders",
  {
    id: text("id").primaryKey(),
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => clientInvoices.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    reminderNumber: integer("reminder_number").notNull(), // 1st, 2nd, 3rd reminder
    sentAt: timestamp("sent_at").defaultNow().notNull(),
    tone: reminderToneEnum("tone").notNull(), // polite, firm, urgent
    emailSubject: text("email_subject").notNull(),
    emailContent: text("email_content").notNull(),
    status: emailDeliveryStatusEnum("status").default("sent"),
    deliveredAt: timestamp("delivered_at"),
    openedAt: timestamp("opened_at"),
    clickedAt: timestamp("clicked_at"),
    responseReceived: boolean("response_received").default(false),
    responseReceivedAt: timestamp("response_received_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Primary lookups by invoice and user
    invoiceIdSentAtIdx: index("invoice_reminders_invoice_sent_idx").on(
      table.invoiceId,
      table.sentAt.desc()
    ),
    userIdIdx: index("invoice_reminders_user_id_idx").on(table.userId),

    // Status and delivery tracking
    statusIdx: index("invoice_reminders_status_idx").on(table.status),
    userIdStatusIdx: index("invoice_reminders_user_status_idx").on(
      table.userId,
      table.status
    ),

    // Response tracking
    responseReceivedIdx: index("invoice_reminders_response_received_idx").on(
      table.responseReceived
    ),
  })
);

// Waitlist schema for early access signups
export const waitlist = pgTable("waitlist", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// GitHub Action logs schema for tracking workflow runs
export const githubActionLogs = pgTable(
  "github_action_logs",
  {
    id: text("id").primaryKey(),
    actionName: text("action_name").notNull(), // e.g., "testing-action", "scheduled-reminders"
    runId: text("run_id").notNull(), // GitHub workflow run ID
    workflowName: text("workflow_name").notNull(), // Human readable workflow name
    gitRef: text("git_ref").notNull(), // Branch/tag that triggered the workflow
    environment: text("environment").notNull(), // "production", "staging", etc.

    // Timing information
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time"),
    durationMs: integer("duration_ms"), // Duration in milliseconds

    // Status and metadata
    status: githubActionStatusEnum("status").notNull().default("running"),
    triggerEvent: text("trigger_event").notNull(), // "schedule", "workflow_dispatch", "push", etc.
    actor: text("actor"), // Who triggered the workflow (for manual runs)

    // Additional data stored as JSON
    metadata: text("metadata"), // JSON string for additional workflow data
    errorDetails: text("error_details"), // Error information if status is "failed"

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Action monitoring and filtering
    actionNameStatusIdx: index("github_action_logs_action_status_idx").on(
      table.actionName,
      table.status
    ),
    statusIdx: index("github_action_logs_status_idx").on(table.status),

    // Time-based queries
    startTimeIdx: index("github_action_logs_start_time_idx").on(
      table.startTime.desc()
    ),
    environmentIdx: index("github_action_logs_environment_idx").on(
      table.environment
    ),

    // Unique run tracking
    runIdIdx: index("github_action_logs_run_id_idx").on(table.runId),

    // Trigger event analysis
    triggerEventIdx: index("github_action_logs_trigger_event_idx").on(
      table.triggerEvent
    ),
  })
);

export type ClientInvoices = InferSelectModel<typeof clientInvoices>;
export type InvoiceReminder = InferSelectModel<typeof invoiceReminders>;
export type User = InferSelectModel<typeof user>;
export type UserSettings = InferSelectModel<typeof userSettings>;
export type EmailTemplate = InferSelectModel<typeof emailTemplates>;
export type Subscription = InferSelectModel<typeof subscriptions>;
export type SubscriptionPlan = InferSelectModel<typeof subscriptionPlans>;
export type Invoice = InferSelectModel<typeof invoices>;
export type Feedback = InferSelectModel<typeof feedback>;
export type GeneratedInvoice = InferSelectModel<typeof generatedInvoices>;
export type GithubActionLog = InferSelectModel<typeof githubActionLogs>;

export type InvoiceGenerationData = InferInsertModel<typeof generatedInvoices>;
export type GithubActionLogInsert = InferInsertModel<typeof githubActionLogs>;
