-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create policies for avatar uploads
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create table for student verification documents
CREATE TABLE public.student_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
  current_step INTEGER NOT NULL DEFAULT 1,
  
  -- Step 1: Personal Info
  full_name TEXT,
  date_of_birth DATE,
  phone_number TEXT,
  
  -- Step 2: Location
  country TEXT,
  state_province TEXT,
  city TEXT,
  
  -- Step 3: Institution Details
  institution_name TEXT,
  institution_type TEXT,
  student_id TEXT,
  enrollment_year INTEGER,
  expected_graduation INTEGER,
  
  -- Step 4: WAEC Verification
  waec_exam_number TEXT,
  waec_year INTEGER,
  waec_center TEXT,
  
  -- Step 5: NIN Verification
  nin_number TEXT,
  
  -- Step 6: Document Uploads
  student_id_url TEXT,
  waec_result_url TEXT,
  nin_slip_url TEXT,
  admission_letter_url TEXT,
  
  -- Step 7: Declaration
  declaration_agreed BOOLEAN DEFAULT FALSE,
  terms_agreed BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  rejection_reason TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own verification" 
ON public.student_verifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verification" 
ON public.student_verifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending verification" 
ON public.student_verifications 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending');

-- Add trigger for updated_at
CREATE TRIGGER update_student_verifications_updated_at
BEFORE UPDATE ON public.student_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-documents', 'verification-documents', false);

-- Storage policies for verification documents
CREATE POLICY "Users can view their own verification documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'verification-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own verification documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'verification-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own verification documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'verification-documents' AND auth.uid()::text = (storage.foldername(name))[1]);