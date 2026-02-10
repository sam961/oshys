// Category Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type: 'product' | 'course' | 'trip' | 'blog';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Course Types
export interface Course {
  id: number;
  name: string;
  slug: string;
  description: string;
  details?: string;
  image?: string;
  price: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  category_id?: number;
  category?: Category;
  is_active: boolean;
  is_featured: boolean;
  max_students?: number;
  requirements?: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Trip Types
export interface Trip {
  id: number;
  name: string;
  slug: string;
  description: string;
  details?: string;
  image?: string;
  price: number;
  location: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  category_id?: number;
  category?: Category;
  is_active: boolean;
  is_featured: boolean;
  certification_required: boolean;
  max_participants?: number;
  number_of_dives?: number;
  included_items?: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  details?: string;
  image?: string;
  price: number;
  category_id?: number;
  category?: Category;
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
  category_id?: number;
  category?: Category;
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
  category_id?: number;
  category?: Category;
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
  title: string;
  description: string;
  type: 'workshop' | 'course' | 'trip' | 'other';
  start_date: string;
  end_date?: string;
  location?: string;
  is_active: boolean;
  max_participants?: number;
  price?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Team Member Types
export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio?: string;
  image?: string;
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
export type CourseFormData = Omit<Course, 'id' | 'slug' | 'created_at' | 'updated_at' | 'deleted_at' | 'category'>;
export type TripFormData = Omit<Trip, 'id' | 'slug' | 'created_at' | 'updated_at' | 'deleted_at' | 'category'>;
export type ProductFormData = Omit<Product, 'id' | 'slug' | 'created_at' | 'updated_at' | 'deleted_at' | 'category'>;
export type BlogPostFormData = Omit<BlogPost, 'id' | 'slug' | 'created_at' | 'updated_at' | 'deleted_at' | 'category' | 'author'>;
export type SocialInitiativeFormData = Omit<SocialInitiative, 'id' | 'slug' | 'created_at' | 'updated_at' | 'deleted_at' | 'category'>;
export type EventFormData = Omit<Event, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type TeamMemberFormData = Omit<TeamMember, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type CategoryFormData = Omit<Category, 'id' | 'slug' | 'created_at' | 'updated_at'>;
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
