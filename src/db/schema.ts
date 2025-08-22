// TypeScript interfaces for database entities

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  name?: string;
  summary?: string;
  socials?: string[];
  profile_image_path?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  name?: string;
  summary?: string;
  socials?: string[];
  profile_image_path?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: number;
  name: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Artwork {
  id: number;
  image_path: string;
  title?: string;
  description?: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  artwork_categories?: { category: Category }[];
}

export interface Project {
  id: number;
  batch_image_path: string[];
  title: string;
  description?: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  project_categories?: { category: Category }[];
}

export interface ArtworkCategory {
  artwork_id: number;
  category_id: number;
}

export interface ProjectCategory {
  project_id: number;
  category_id: number;
}