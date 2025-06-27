
-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'analyst', 'field_officer');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE id_type AS ENUM ('national_id', 'passport', 'none');
CREATE TYPE issue_status AS ENUM ('open', 'under_review', 'resolved', 'rejected');
CREATE TYPE issue_type AS ENUM ('uncooperative_farmer', 'inaccessible_area', 'equipment_failure', 'weather_conditions', 'other');
CREATE TYPE transfer_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE visit_status AS ENUM ('completed', 'incomplete', 'in_progress');

-- User profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  role user_role NOT NULL DEFAULT 'field_officer',
  uai_code TEXT UNIQUE,
  assigned_supervisor_id UUID REFERENCES public.profiles(id),
  region TEXT,
  sub_county TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farmers table
CREATE TABLE public.farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  gender gender_type NOT NULL,
  id_type id_type NOT NULL DEFAULT 'none',
  id_number TEXT,
  region TEXT NOT NULL,
  sub_county TEXT,
  registered_by UUID REFERENCES public.profiles(id) NOT NULL,
  farmer_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farm visits table
CREATE TABLE public.farm_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmers(id) NOT NULL,
  field_officer_id UUID REFERENCES public.profiles(id) NOT NULL,
  visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  gps_latitude DECIMAL(10, 8),
  gps_longitude DECIMAL(11, 8),
  polygon_boundaries JSONB,
  cocoa_tree_age INTEGER,
  bean_quality TEXT,
  soil_type TEXT,
  humidity_level DECIMAL(5, 2),
  pest_disease_signs TEXT,
  visit_notes TEXT,
  visit_number INTEGER DEFAULT 1,
  status visit_status DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visit media table for photos/videos
CREATE TABLE public.visit_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.farm_visits(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL, -- 'photo' or 'video'
  exif_data JSONB,
  gps_latitude DECIMAL(10, 8),
  gps_longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Issues table
CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_officer_id UUID REFERENCES public.profiles(id) NOT NULL,
  issue_type issue_type NOT NULL,
  description TEXT NOT NULL,
  status issue_status DEFAULT 'open',
  evidence_url TEXT,
  supervisor_comments TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transfer requests table
CREATE TABLE public.transfer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_officer_id UUID REFERENCES public.profiles(id) NOT NULL,
  reason TEXT NOT NULL,
  preferred_region TEXT NOT NULL,
  status transfer_status DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field officer targets table
CREATE TABLE public.officer_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_officer_id UUID REFERENCES public.profiles(id) NOT NULL,
  total_farm_target INTEGER NOT NULL DEFAULT 25,
  visit_1_target INTEGER DEFAULT 25,
  visit_2_target INTEGER DEFAULT 25,
  visit_3_target INTEGER DEFAULT 25,
  visit_4_target INTEGER DEFAULT 25,
  visit_5_target INTEGER DEFAULT 25,
  visit_6_target INTEGER DEFAULT 25,
  visit_7_target INTEGER DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(field_officer_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_targets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- RLS Policies for farmers
CREATE POLICY "All authenticated users can view farmers" ON public.farmers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Field officers can create farmers" ON public.farmers FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('field_officer', 'supervisor', 'admin'))
);
CREATE POLICY "Users can update farmers they registered" ON public.farmers FOR UPDATE TO authenticated USING (
  registered_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('supervisor', 'admin'))
);

-- RLS Policies for farm visits
CREATE POLICY "All authenticated users can view visits" ON public.farm_visits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Field officers can create visits" ON public.farm_visits FOR INSERT TO authenticated WITH CHECK (
  field_officer_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('supervisor', 'admin'))
);

-- RLS Policies for visit media
CREATE POLICY "All authenticated users can view visit media" ON public.visit_media FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create visit media" ON public.visit_media FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.farm_visits fv WHERE fv.id = visit_id AND fv.field_officer_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('supervisor', 'admin'))
);

-- RLS Policies for issues
CREATE POLICY "All authenticated users can view issues" ON public.issues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Field officers can create issues" ON public.issues FOR INSERT TO authenticated WITH CHECK (
  field_officer_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('supervisor', 'admin'))
);
CREATE POLICY "Supervisors and admins can update issues" ON public.issues FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('supervisor', 'admin'))
);

-- RLS Policies for transfer requests
CREATE POLICY "All authenticated users can view transfer requests" ON public.transfer_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Field officers can create transfer requests" ON public.transfer_requests FOR INSERT TO authenticated WITH CHECK (
  field_officer_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('supervisor', 'admin'))
);
CREATE POLICY "Supervisors and admins can update transfer requests" ON public.transfer_requests FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('supervisor', 'admin'))
);

-- RLS Policies for officer targets
CREATE POLICY "All authenticated users can view officer targets" ON public.officer_targets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Supervisors and admins can manage officer targets" ON public.officer_targets FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('supervisor', 'admin'))
);
CREATE POLICY "Supervisors and admins can update officer targets" ON public.officer_targets FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('supervisor', 'admin'))
);
CREATE POLICY "Supervisors and admins can delete officer targets" ON public.officer_targets FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('supervisor', 'admin'))
);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'field_officer'
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farmers_updated_at BEFORE UPDATE ON public.farmers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
