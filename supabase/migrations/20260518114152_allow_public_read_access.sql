/*
  # Allow public read access to published courses and instructor profiles

  ## Changes
  1. Add SELECT policy on `courses` for anon users to read published courses
  2. Add SELECT policy on `profiles` for anon users to read instructor profiles (needed for course cards)
  3. Add SELECT policy on `lessons` for anon users to read free preview lessons
  4. Add SELECT policy on `reviews` for anon users to read course reviews

  ## Security
  - Only published courses are visible to unauthenticated users
  - Draft courses remain visible only to their instructor
  - Only free preview lessons are visible to unauthenticated users
*/

-- Allow anonymous users to browse published courses
CREATE POLICY "Published courses viewable by anonymous users"
  ON courses FOR SELECT
  TO anon
  USING (is_published = true);

-- Allow anonymous users to view instructor profiles (needed for course cards)
CREATE POLICY "Profiles viewable by anonymous users"
  ON profiles FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to see free preview lessons
CREATE POLICY "Free preview lessons viewable by anonymous users"
  ON lessons FOR SELECT
  TO anon
  USING (is_free_preview = true);

-- Allow anonymous users to read reviews
CREATE POLICY "Reviews viewable by anonymous users"
  ON reviews FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to see enrollment counts
CREATE POLICY "Enrollments viewable by anonymous users"
  ON enrollments FOR SELECT
  TO anon
  USING (true);
