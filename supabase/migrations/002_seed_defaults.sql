-- Function to seed default categories for a new user
CREATE OR REPLACE FUNCTION public.seed_default_categories(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, color, icon, sort_order) VALUES
    (p_user_id, 'Work', '#3b82f6', 'briefcase', 0),
    (p_user_id, 'Personal', '#8b5cf6', 'user', 1),
    (p_user_id, 'Health', '#10b981', 'heart', 2),
    (p_user_id, 'Study', '#f59e0b', 'book-open', 3),
    (p_user_id, 'Finance', '#ef4444', 'wallet', 4);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update handle_new_user to also seed categories
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  
  PERFORM public.seed_default_categories(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
