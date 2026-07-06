-- PLF Spaces Database Schema
-- Run this in your Supabase SQL editor

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('super_admin', 'business_owner', 'business_staff', 'customer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Businesses
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Restaurants', 'Beauty & Barber', 'Shops', 'Services', 'Hotels', 'Events')),
  location TEXT,
  address TEXT,
  image TEXT,
  logo TEXT,
  cover_image TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  matterport_space_id TEXT,
  matterport_tour_url TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  owner_id UUID REFERENCES public.profiles(id),
  verified BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  founding BOOLEAN DEFAULT false,
  opening_hours TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Business Members (staff)
CREATE TABLE public.business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, user_id)
);

ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.categories (name, description) VALUES
  ('Restaurants', 'Discover the best places to eat'),
  ('Beauty & Barber', 'Salons, barbershops and spas'),
  ('Shops', 'Boutiques, stores and markets'),
  ('Services', 'Professional services you can trust'),
  ('Hotels', 'Find your perfect stay'),
  ('Events', 'Venues and experiences');

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, user_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Followers
CREATE TABLE public.followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, user_id)
);

ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Media
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Favorites
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, business_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- Profiles: users can read any profile, update only their own
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Businesses: anyone can read, owner and admin can update
CREATE POLICY "Businesses are viewable by everyone"
  ON public.businesses FOR SELECT USING (true);

CREATE POLICY "Business owner can update their business"
  ON public.businesses FOR UPDATE USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admin can insert businesses"
  ON public.businesses FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Reviews: anyone can read, authenticated users can insert
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Followers: anyone can read, authenticated users can manage
CREATE POLICY "Followers are viewable by everyone"
  ON public.followers FOR SELECT USING (true);

CREATE POLICY "Authenticated users can follow"
  ON public.followers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow"
  ON public.followers FOR DELETE USING (auth.uid() = user_id);
