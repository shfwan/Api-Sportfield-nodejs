import { relations, sql, } from "drizzle-orm";
import { text, timestamp, pgTable, uuid, varchar, integer, json, serial, date, boolean, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["customer", "provider", "administrator"])
export const userTable = pgTable("user", {
    id: uuid("id").defaultRandom().primaryKey(),
    firstname: varchar("firstname", { length: 256 }).notNull(),
    lastname: varchar("lastname", { length: 256 }).notNull(),
    email: varchar("email", { length: 256 }).unique().notNull(),
    phone: varchar("phone", { length: 15 }).unique().notNull(),
    password: varchar("password", { length: 256 }).notNull(),
    role: roleEnum('role').default("customer").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
})

export const userRelations = relations(userTable, ({ one, many }) => ({
    profileInfo: one(profileInfoTable),
    lapangan: many(lapanganTable),
    orders: many(ordersTable)
}))

export const profileInfoTable = pgTable("profile_info", {
    id: uuid("id").defaultRandom().primaryKey(),
    picture: text('picture'),
    bio: varchar('bio', { length: 256 }).notNull(),
    userId: uuid("user_id").notNull().references(() => userTable.id),
})

export const profileInfoRelations = relations(profileInfoTable, ({ one }) => ({
    user: one(userTable, {
        fields: [profileInfoTable.userId],
        references: [userTable.id]
    }),
}))

export interface Address {
    alamat: string;
    mapUrl: string;
}

export const lapanganTable = pgTable("lapangan", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    picture: text("picture").default(""),
    description: text("description").default(""),
    address: json("address").notNull().$type<Address>(),
    liked: integer("liked").default(0).notNull(),
    open: text("open").notNull(),
    close: text("close").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
    userId: uuid("user_id").notNull().references(() => userTable.id),
})

export const lapanganRelations = relations(lapanganTable, ({ one, many }) => ({
    user: one(userTable, {
        fields: [lapanganTable.userId],
        references: [userTable.id]
    }),
    detailsLapangan: many(detailsLapanganTable),
}))

interface Jam {
    id: number;
    open: string;
    close: string;
}

export const statusLapanganEnum = pgEnum("statusLapangan", ["Indoor", "Outdoor"])
export const detailsLapanganTable = pgTable("details_lapangan", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    type: varchar("type", { length: 256 }).notNull(),
    statusLapangan: statusLapanganEnum('statusLapangan').default("Indoor").notNull(),
    description: text("description").default(""),
    price: serial("price").notNull(),
    jam: json("jam").array().$type<Jam[]>().default(sql`ARRAY[]::json[]`),
    lapanganId: uuid("lapangan_id").notNull().references(() => lapanganTable.id)
})

export const detailsLapanganRelations = relations(detailsLapanganTable, ({ one, many }) => ({
    lapangan: one(lapanganTable, {
        fields: [detailsLapanganTable.lapanganId],
        references: [lapanganTable.id]
    }),
    detailOrder: many(detailOrderTable),
    gallery: many(galleryTable)
}))

export const galleryTable = pgTable("gallery", {
    id: serial("id").primaryKey(),
    lapanganId: uuid("lapangan_id").notNull().references(() => lapanganTable.id),
    detailsLapanganId: integer("details_lapangan_id").notNull().references(() => detailsLapanganTable.id),
    filename: varchar("filename", { length: 256 }).notNull(),
    mimeType: varchar("mime_type", { length: 256 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const galleryTableRelations = relations(galleryTable, ({ one }) => ({
    detailsLapangan: one(detailsLapanganTable, {
        fields: [galleryTable.detailsLapanganId],
        references: [detailsLapanganTable.id]
    })
}))

export const ordersTable = pgTable("orders", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => userTable.id).references(() => userTable.id),
    playStatus: boolean("play_status").default(false).notNull(),
    orderStatus: boolean("order_status").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
})

export const orderRelations = relations(ordersTable, ({ one }) => ({
    user: one(userTable, {
        fields: [ordersTable.userId],
        references: [userTable.id]
    }),
    detailOrder: one(detailOrderTable)
}))

export const detailOrderTable = pgTable("detailOrder", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull().references(() => ordersTable.id),
    detailsLapanganId: integer("detail_lapangan_id").notNull().references(() => detailsLapanganTable.id),
    jam: json("jam").array().$type<Jam[]>().default(sql`ARRAY[]::json[]`).notNull(),
    date: date("date").notNull(),
})

export const detailOrderRelations = relations(detailOrderTable, ({ one }) => ({
    orders: one(ordersTable, {
        fields: [detailOrderTable.orderId],
        references: [ordersTable.id]
    }),
    detailsLapangan: one(detailsLapanganTable, {
        fields: [detailOrderTable.detailsLapanganId],
        references: [detailsLapanganTable.id]
    })
}))

