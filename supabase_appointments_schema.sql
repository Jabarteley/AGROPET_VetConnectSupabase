-- Create the appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  vet_id UUID REFERENCES auth.users NOT NULL,
  appointment_datetime TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'completed', 'cancelled'
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policies for appointments table
-- Users can view appointments where they are the client or the veterinarian
CREATE POLICY "Users can view their own appointments" ON appointments
  FOR SELECT USING (
    auth.uid() = user_id OR auth.uid() = vet_id
  );

-- Users can insert appointments where they are the client
CREATE POLICY "Users can create appointments for themselves" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update appointments where they are the veterinarian (to approve/reject)
CREATE POLICY "Vets can update appointments" ON appointments
  FOR UPDATE USING (auth.uid() = vet_id);

-- Function to automatically update the 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to call the function before update
CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();