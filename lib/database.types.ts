export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          bio: string;
          avatar_url: string;
          role: 'student' | 'instructor' | 'admin';
          linkedin_url: string;
          github_url: string;
          website_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          bio?: string;
          avatar_url?: string;
          role?: 'student' | 'instructor' | 'admin';
          linkedin_url?: string;
          github_url?: string;
          website_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          bio?: string;
          avatar_url?: string;
          role?: 'student' | 'instructor' | 'admin';
          linkedin_url?: string;
          github_url?: string;
          website_url?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          short_description: string;
          instructor_id: string;
          category: string;
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          thumbnail_url: string;
          is_published: boolean;
          price: number;
          total_duration_minutes: number;
          what_you_learn: string[];
          requirements: string[];
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          short_description?: string;
          instructor_id: string;
          category?: string;
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          thumbnail_url?: string;
          is_published?: boolean;
          price?: number;
          total_duration_minutes?: number;
          what_you_learn?: string[];
          requirements?: string[];
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          short_description?: string;
          category?: string;
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          thumbnail_url?: string;
          is_published?: boolean;
          price?: number;
          total_duration_minutes?: number;
          what_you_learn?: string[];
          requirements?: string[];
          tags?: string[];
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          content: string;
          video_url: string;
          duration_minutes: number;
          order_index: number;
          is_free_preview: boolean;
          lesson_type: 'video' | 'article' | 'quiz';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          content?: string;
          video_url?: string;
          duration_minutes?: number;
          order_index?: number;
          is_free_preview?: boolean;
          lesson_type?: 'video' | 'article' | 'quiz';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          video_url?: string;
          duration_minutes?: number;
          order_index?: number;
          is_free_preview?: boolean;
          lesson_type?: 'video' | 'article' | 'quiz';
          updated_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          enrolled_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          enrolled_at?: string;
          completed_at?: string | null;
        };
        Update: {
          completed_at?: string | null;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          completed_at?: string;
        };
        Update: {
          completed_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          rating: number;
          comment: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          rating: number;
          comment?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Course = Database['public']['Tables']['courses']['Row'];
export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type Enrollment = Database['public']['Tables']['enrollments']['Row'];
export type LessonProgress = Database['public']['Tables']['lesson_progress']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];

export type CourseWithInstructor = Course & {
  instructor: Profile;
  lessons?: Lesson[];
  enrollments?: { count: number }[];
  reviews?: { rating: number }[];
};
