-- Supabase SQL: pink-x (PINK CITY X clone)
-- Run this in the Supabase SQL Editor

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tweets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 280),
  retweet_of UUID REFERENCES tweets(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE likes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tweet_id UUID REFERENCES tweets(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, tweet_id)
);

CREATE TABLE follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (follower_id, following_id)
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "own profile insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "public read tweets" ON tweets FOR SELECT USING (true);
CREATE POLICY "own tweet insert" ON tweets FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "own tweet delete" ON tweets FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "public read likes" ON likes FOR SELECT USING (true);
CREATE POLICY "own likes insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own likes delete" ON likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "public read follows" ON follows FOR SELECT USING (true);
CREATE POLICY "own follows insert" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "own follows delete" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE tweets;
ALTER PUBLICATION supabase_realtime ADD TABLE likes;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ─── Supabase Storage: avatars バケット ───
-- Supabase ダッシュボードの SQL Editor で実行してください

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 全員が読める（公開バケット）
CREATE POLICY "public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 本人だけアップロード・更新できる
CREATE POLICY "own avatar upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "own avatar update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );
