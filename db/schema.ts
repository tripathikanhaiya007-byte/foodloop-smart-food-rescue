import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const organizations = sqliteTable("organizations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), type: text("type").notNull(),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  address: text("address").notNull(), area: text("area").notNull(),
  phone: text("phone").notNull().default(""), capacity: integer("capacity").notNull().default(0),
  email: text("email").notNull().default(""), contactPerson: text("contact_person").notNull().default(""),
  registrationNumber: text("registration_number").notNull().default(""), description: text("description").notNull().default(""),
  approvalStatus: text("approval_status").notNull().default("pending"),
  rating: real("rating").notNull().default(0), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("organizations_type_idx").on(table.type), index("organizations_approval_idx").on(table.approvalStatus)]);

export const users = sqliteTable("users", {
  email: text("email").primaryKey(), displayName: text("display_name").notNull(),
  role: text("role").notNull().default("donor"),
  organizationId: integer("organization_id").references(() => organizations.id),
  status: text("status").notNull().default("pending"),
  onboardingComplete: integer("onboarding_complete", { mode: "boolean" }).notNull().default(false),
  phone: text("phone").notNull().default(""), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastSeenAt: text("last_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`), approvedAt: text("approved_at"),
  approvedBy: text("approved_by"),
}, (table) => [index("users_status_idx").on(table.status), index("users_organization_idx").on(table.organizationId)]);

export const donations = sqliteTable("donations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  createdBy: text("created_by").notNull(), title: text("title").notNull(), category: text("category").notNull(),
  description: text("description").notNull().default(""), servings: integer("servings").notNull(),
  quantityKg: real("quantity_kg").notNull(), preparedAt: text("prepared_at").notNull(), pickupBy: text("pickup_by").notNull(),
  storage: text("storage").notNull(), diet: text("diet").notNull(), allergens: text("allergens").notNull().default("None declared"),
  address: text("address").notNull(), area: text("area").notNull(), distanceKm: real("distance_km").notNull().default(0),
  priority: text("priority").notNull().default("normal"), status: text("status").notNull().default("available"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("donations_status_idx").on(table.status), index("donations_area_idx").on(table.area)]);

export const safetyChecks = sqliteTable("safety_checks", {
  id: integer("id").primaryKey({ autoIncrement: true }), donationId: integer("donation_id").notNull().references(() => donations.id),
  sealed: integer("sealed", { mode: "boolean" }).notNull().default(false),
  temperatureControlled: integer("temperature_controlled", { mode: "boolean" }).notNull().default(false),
  allergenLabelled: integer("allergen_labelled", { mode: "boolean" }).notNull().default(false),
  donorDeclaration: integer("donor_declaration", { mode: "boolean" }).notNull().default(false),
  notes: text("notes").notNull().default(""), checkedAt: text("checked_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("safety_donation_unique").on(table.donationId)]);

export const pickups = sqliteTable("pickups", {
  id: integer("id").primaryKey({ autoIncrement: true }), donationId: integer("donation_id").notNull().references(() => donations.id),
  receiverOrganizationId: integer("receiver_organization_id").notNull().references(() => organizations.id),
  volunteerName: text("volunteer_name").notNull(), volunteerPhone: text("volunteer_phone").notNull().default(""),
  status: text("status").notNull().default("accepted"), etaMinutes: integer("eta_minutes").notNull().default(30),
  verificationCode: text("verification_code").notNull(), acceptedAt: text("accepted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  collectedAt: text("collected_at"), deliveredAt: text("delivered_at"),
}, (table) => [uniqueIndex("pickup_donation_unique").on(table.donationId), index("pickups_status_idx").on(table.status)]);

export const statusEvents = sqliteTable("status_events", {
  id: integer("id").primaryKey({ autoIncrement: true }), pickupId: integer("pickup_id").notNull().references(() => pickups.id),
  status: text("status").notNull(), note: text("note").notNull().default(""), actorEmail: text("actor_email").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }), userEmail: text("user_email").notNull(),
  title: text("title").notNull(), message: text("message").notNull(), kind: text("kind").notNull().default("info"),
  read: integer("read", { mode: "boolean" }).notNull().default(false), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("notifications_user_idx").on(table.userEmail)]);

export const impactEvents = sqliteTable("impact_events", {
  id: integer("id").primaryKey({ autoIncrement: true }), donationId: integer("donation_id").notNull().references(() => donations.id),
  mealsServed: integer("meals_served").notNull(), foodKg: real("food_kg").notNull(), peopleReached: integer("people_reached").notNull(),
  carbonKgAvoided: real("carbon_kg_avoided").notNull(), completedAt: text("completed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("impact_donation_unique").on(table.donationId)]);

export const feedback = sqliteTable("feedback", {
  id: integer("id").primaryKey({ autoIncrement: true }), pickupId: integer("pickup_id").notNull().references(() => pickups.id),
  rating: integer("rating").notNull(), comment: text("comment").notNull().default(""), submittedBy: text("submitted_by").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const systemSettings = sqliteTable("system_settings", {
  key: text("key").primaryKey(), value: text("value").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
