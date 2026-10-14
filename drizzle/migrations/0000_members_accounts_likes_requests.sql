CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role public.app_role NOT NULL, UNIQUE(user_id, role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.profiles (id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, full_name text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), COALESCE(NEW.raw_user_meta_data->>'phone',''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.members (
  code text PRIMARY KEY, owner_id uuid, gender text NOT NULL CHECK (gender IN ('bride','groom')),
  birth_date date NOT NULL, birth_time text NOT NULL DEFAULT '', area text NOT NULL DEFAULT '', caste text NOT NULL DEFAULT '',
  education text NOT NULL DEFAULT '', occupation text NOT NULL DEFAULT '', height_cm int NOT NULL DEFAULT 0, star text NOT NULL DEFAULT '',
  sevvai text NOT NULL DEFAULT '', paavam text NOT NULL DEFAULT '', marital_status text NOT NULL DEFAULT '', expectations text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '', chart jsonb NOT NULL DEFAULT '{}'::jsonb, is_published boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO authenticated;
GRANT ALL ON public.members TO service_role;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published members public" ON public.members FOR SELECT TO anon, authenticated USING (is_published OR owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage members" ON public.members FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.likes (user_id uuid NOT NULL, member_code text NOT NULL REFERENCES public.members(code) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (user_id, member_code));
GRANT SELECT, INSERT, DELETE ON public.likes TO authenticated;
GRANT ALL ON public.likes TO service_role;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own likes" ON public.likes FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.requests (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, member_code text NOT NULL REFERENCES public.members(code) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('photo','contact')), status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (user_id, member_code, kind));
GRANT SELECT, INSERT, UPDATE ON public.requests TO authenticated;
GRANT ALL ON public.requests TO service_role;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own requests" ON public.requests FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "create own requests" ON public.requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "admins update requests" ON public.requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

INSERT INTO public.members (code,gender,birth_date,birth_time,area,caste,education,occupation,height_cm,star,sevvai,paavam,marital_status,expectations,address,chart,created_at)
SELECT 'JTM' || (1000 + i),
  CASE WHEN i % 2 = 1 THEN 'bride' ELSE 'groom' END,
  make_date(1988 + (i * 7) % 14, 1 + (i * 5) % 12, 1 + (i * 11) % 28),
  lpad((1 + (i * 3) % 12)::text, 2, '0') || ':' || lpad(((i * 17) % 60)::text, 2, '0') || CASE WHEN i % 3 = 0 THEN ' PM' ELSE ' AM' END,
  (ARRAY['Nallur','Kokuvil','Chunnakam','Point Pedro','Chavakachcheri','Tellippalai','Karainagar','Manipay','Kopay','Vavuniya'])[1 + i % 10],
  (ARRAY['Vellalar','Karaiyar','Koviar','Thattar','Not specified'])[1 + (i * 3) % 5],
  (ARRAY['BSc Engineering','MBBS','BCom','BA (Hons)','Diploma in Nursing','LLB','BSc IT','Chartered Accountant'])[1 + (i * 5) % 8],
  (ARRAY['Software Engineer','Doctor','Teacher','Accountant','Nurse','Lawyer','Bank Officer','Business'])[1 + (i * 3) % 8],
  CASE WHEN i % 2 = 1 THEN 150 + (i * 7) % 18 ELSE 163 + (i * 7) % 20 END,
  (ARRAY['அசுவினி','பரணி','கார்த்திகை','ரோகிணி','மிருகசீரிடம்','திருவாதிரை','புனர்பூசம்','பூசம்','ஆயில்யம்','மகம்','உத்திரம்','அஸ்தம்','சித்திரை','சுவாதி','விசாகம்','அனுஷம்'])[1 + (i * 7) % 16],
  CASE WHEN i % 3 = 0 THEN 'உண்டு' ELSE 'இல்லை' END,
  ((i * 13) % 60)::text,
  'Never married',
  CASE WHEN i % 2 = 1 THEN 'Educated, well-mannered groom from a respectful family, preferably working in Sri Lanka or abroad.' ELSE 'Educated, family-oriented bride. Horoscope matching preferred.' END,
  (ARRAY['Nallur','Kokuvil','Chunnakam','Point Pedro','Chavakachcheri','Tellippalai','Karainagar','Manipay','Kopay','Vavuniya'])[1 + (i * 3) % 10] || ', Jaffna',
  jsonb_build_object(
    (1 + i % 12)::text, 'லக்னம்',
    (1 + (i + 2) % 12)::text, 'சூரியன் புதன்',
    (1 + (i + 5) % 12)::text, 'சந்திரன்',
    (1 + (i + 7) % 12)::text, 'செவ்வாய் குரு',
    (1 + (i + 9) % 12)::text, 'சுக்கிரன் ராகு',
    (1 + (i + 3) % 12)::text, 'சனி கேது'),
  now() - (i || ' days')::interval
FROM generate_series(1, 24) AS i;