// Course Types
export interface Course {
  id: number;
  name: string;
  slug: string;
  description: string;
  image?: string;
  image_url?: string;
  images?: Image[];
  price: number;
  duration?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  category?: string;
  is_active: boolean;
  is_featured: boolean;
  max_students?: number;
  requirements?: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  /** Dates still ahead, soonest first. Empty when nothing is scheduled. */
  upcoming_dates?: UpcomingDate[];
}

// Trip Types
export interface Trip {
  id: number;
  name: string;
  slug: string;
  description: string;
  image?: string;
  image_url?: string;
  images?: Image[];
  price: number;
  duration?: string;
  location?: string;
  difficulty?: string;
  max_participants?: number;
  is_active: boolean;
  is_featured: boolean;
  included_items?: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  /** Dates still ahead, soonest first. Empty when nothing is scheduled. */
  upcoming_dates?: UpcomingDate[];
}

// Product Types
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  image?: string;
  image_url?: string;
  price: number;
  in_stock: boolean;
  is_active: boolean;
  is_featured: boolean;
  stock_quantity: number;
  sku?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Blog Post Types
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  image_url?: string;
  author_id?: number;
  author?: {
    id: number;
    name: string;
    email: string;
  };
  is_published: boolean;
  is_featured: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Social Initiative Types
export interface SocialInitiative {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  image_url?: string;
  is_published: boolean;
  is_featured: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Event Types
export interface Event {
  id: number;
  /** Readable address; numeric ids still resolve for older links. */
  slug?: string | null;
  title: string;
  description: string;
  type: 'workshop' | 'course' | 'trip' | 'other';
  start_date: string;
  end_date?: string;
  location?: string;
  image_url?: string;
  is_active: boolean;
  max_participants?: number;
  price?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  /** Dates still ahead, soonest first. Empty when nothing is scheduled. */
  upcoming_dates?: UpcomingDate[];
}

// Team Member Types
export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio?: string;
  image?: string;
  image_url?: string;
  email?: string;
  phone?: string;
  experience?: string;
  certifications?: string[];
  social_links?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Setting Types
export interface Setting {
  id: number;
  key: string;
  value?: string;
  type: string;
  group: string;
  created_at: string;
  updated_at: string;
}

// Banner Types
export interface Banner {
  id: number;
  title: string;
  description?: string;
  image: string;
  image_url?: string;
  button_text?: string;
  button_link?: string;
  position: 'hero' | 'secondary' | 'promo';
  display_order: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export type BannerFormData = Omit<Banner, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;

// Footer Link Types
export interface FooterLink {
  id: number;
  title: string;
  slug: string;
  url: string;
  content?: string;
  display_order: number;
  is_active: boolean;
  open_in_new_tab: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export type FooterLinkFormData = Omit<FooterLink, 'id' | 'slug' | 'url' | 'created_at' | 'updated_at' | 'deleted_at'>;

// Image Types
export interface Image {
  id: number;
  filename: string;
  path: string;
  url: string;
  full_url?: string;
  mime_type?: string;
  size?: number;
  imageable_id: number;
  imageable_type: string;
  collection: string;
  order: number;
  created_at: string;
  updated_at: string;
}

// Form Data Types for Creating/Updating
export type CourseFormData = Omit<Course, 'id' | 'slug' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type TripFormData = Omit<Trip, 'id' | 'slug' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type ProductFormData = Omit<Product, 'id' | 'slug' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type BlogPostFormData = Omit<BlogPost, 'id' | 'slug' | 'created_at' | 'updated_at' | 'deleted_at' | 'author'>;
export type SocialInitiativeFormData = Omit<SocialInitiative, 'id' | 'slug' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type EventFormData = Omit<Event, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type TeamMemberFormData = Omit<TeamMember, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type SettingFormData = Omit<Setting, 'id' | 'created_at' | 'updated_at'>;

// Booking Types
export interface Booking {
  id: number;
  name: string;
  email: string;
  phone: string;
  bookable_type: 'course' | 'trip';
  bookable_id: number;
  bookable_name: string;
  price: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// A previously-uploaded image returned by the media library endpoint.
export interface MediaItem {
  path: string;        // disk-relative path, e.g. "blog/123_title.jpg"
  url: string;         // public URL for display
  name: string;        // file basename
  folder: string;      // source folder (blog, courses, trips, ...)
  last_modified: number;
}

// Scheduling — shared by events, courses and trips.
// All datetimes here are venue-local (Asia/Riyadh) naive strings in
// "YYYY-MM-DDTHH:mm" form, the shape <input type="datetime-local"> uses.
// The server converts to/from the UTC it stores.
export type ScheduleFrequency = 'none' | 'daily' | 'weekly' | 'monthly';

export type SchedulableType = 'events' | 'courses' | 'trips';

export interface ScheduleSeries {
  id: number;
  frequency: ScheduleFrequency;
  interval: number;
  weekdays: number[];        // ISO: 1 = Monday … 7 = Sunday
  until_date: string | null; // "YYYY-MM-DD"
  generated_through: string | null;
}

export interface ScheduleOccurrence {
  id: number;
  series_id: number | null;  // null when added by hand rather than generated
  start_at: string;
  end_at: string | null;
  capacity: number | null;   // optional; displayed only, never enforced
  status: 'scheduled' | 'cancelled';
  is_past: boolean;
}

/**
 * A date as the public API emits it: a venue-local wall clock with no offset,
 * so it renders as Al Khobar time for every visitor rather than being shifted
 * into their own timezone.
 */
export interface UpcomingDate {
  id: number;
  start_at: string;
  end_at: string | null;
  capacity: number | null;
}

export interface Schedule {
  series: ScheduleSeries | null;
  occurrences: ScheduleOccurrence[];
}
