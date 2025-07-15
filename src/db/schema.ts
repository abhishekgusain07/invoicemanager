import { pgTable, text, integer, timestamp, boolean, decimal, pgEnum, unique } from "drizzle-orm/pg-core";
			
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').notNull(),
	subscription: text("subscription"),
	gmailConnected: boolean('gmail_connected').default(false),
	updatedAt: timestamp('updated_at').notNull()
});

export const gmailConnection = pgTable("gmail_connection", {
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
}, (table) => {
	return {
		userEmailIdx: unique().on(table.userId, table.email)
	};
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
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

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at')
});

// Define invoice status enum
export const invoiceStatusEnum = pgEnum('invoice_status', [
	'pending',
	'paid',
	'overdue',
	'cancelled',
	'draft',
	'partially_paid'
]);

// Define reminder tone enum
export const reminderToneEnum = pgEnum('reminder_tone', [
	'polite',
	'friendly',
	'neutral',
	'firm',
	'direct',
	'assertive',
	'urgent',
	'final',
	'serious'
]);

// Define feature request priority enum
export const featurePriorityEnum = pgEnum('feature_priority', [
	'low',
	'medium',
	'high'
]);

// Define feature request status enum
export const featureStatusEnum = pgEnum('feature_status', [
	'new',
	'under_review',
	'planned',
	'in_progress',
	'completed',
	'declined'
]);

// Define email delivery status enum
export const emailDeliveryStatusEnum = pgEnum('email_delivery_status', [
	'sent',
	'delivered',
	'failed',
	'opened',
	'clicked',
	'replied',
	'bounced'
]);

// User Settings schema
export const userSettings = pgTable("user_settings", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	
	// Reminder Settings
	isAutomatedReminders: boolean("is_automated_reminders").default(true),
	firstReminderDays: integer("first_reminder_days").default(3),
	followUpFrequency: integer("follow_up_frequency").default(7),
	maxReminders: integer("max_reminders").default(3),
	firstReminderTone: reminderToneEnum("first_reminder_tone").default("polite"),
	secondReminderTone: reminderToneEnum("second_reminder_tone").default("firm"),
	thirdReminderTone: reminderToneEnum("third_reminder_tone").default("urgent"),
	
	// Account Settings
	businessName: text("business_name"),
	phoneNumber: text("phone_number"),
	
	// Email Settings
	fromName: text("from_name"),
	emailSignature: text("email_signature").default("Best regards,"),
	defaultCC: text("default_cc"),
	defaultBCC: text("default_bcc"),
	previewEmails: boolean("preview_emails").default(true),
	
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Template type enum
export const templateTypeEnum = pgEnum('template_type', [
	'system',      // Built-in templates
	'custom'       // User-created templates
]);

// Template category enum
export const templateCategoryEnum = pgEnum('template_category', [
	'reminder',    // Payment reminders
	'thank_you',   // Thank you notes
	'follow_up',   // Follow-up emails
	'notice',      // Final notices
	'welcome',     // Welcome emails
	'custom'       // Custom category
]);

// Email Template schema
export const emailTemplates = pgTable("email_templates", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	name: text("name").notNull(),
	subject: text("subject").notNull(),
	
	// Enhanced content support
	content: text("content").notNull(),           // Legacy text content
	htmlContent: text("html_content"),           // Rich HTML content
	textContent: text("text_content"),           // Plain text content
	
	// Template organization
	tone: reminderToneEnum("tone").notNull(),
	templateType: templateTypeEnum("template_type").default("custom"),
	category: templateCategoryEnum("category").default("reminder"),
	
	// Template metadata
	isDefault: boolean("is_default").default(false),
	isActive: boolean("is_active").default(true),
	usageCount: integer("usage_count").default(0),
	description: text("description"),
	tags: text("tags"),  // JSON array of tags
	
	// Timestamps
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Invoice Manager schema
export const clientInvoices = pgTable("client_invoices", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
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
	updatedAt: timestamp("updated_at").defaultNow().notNull()
});

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
	stars: integer().notNull()
});

export const featureRequests = pgTable("feature_requests", {
	id: text("id").primaryKey(),
	createdTime: timestamp("created_time").defaultNow(),
	updatedTime: timestamp("updated_time").defaultNow(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	title: text("title").notNull(),
	description: text("description").notNull(),
	priority: featurePriorityEnum("priority").notNull().default("medium"),
	status: featureStatusEnum("status").notNull().default("new"),
	adminNotes: text("admin_notes"),
	upvotes: integer("upvotes").default(0)
});

// Invoice Reminders tracking schema
export const invoiceReminders = pgTable("invoice_reminders", {
	id: text("id").primaryKey(),
	invoiceId: text("invoice_id").notNull().references(() => clientInvoices.id, { onDelete: 'cascade' }),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
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
	updatedAt: timestamp("updated_at").defaultNow().notNull()
});