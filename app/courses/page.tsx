'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CourseCard } from '@/components/courses/course-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { CourseWithInstructor } from '@/lib/database.types';
import { Search, SlidersHorizontal, BookOpen, Loader as Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: '', label: 'All' },
  { id: 'web-development', label: 'Web Dev' },
  { id: 'data-science', label: 'Data Science' },
  { id: 'design', label: 'Design' },
  { id: 'ai-ml', label: 'AI & ML' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'devops', label: 'DevOps' },
  { id: 'general', label: 'General' },
];

const DIFFICULTIES = [
  { id: '', label: 'All Levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

function CourseCatalogContent() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<CourseWithInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [difficulty, setDifficulty] = useState('');
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCourses();
  }, [category, difficulty]);

  async function fetchCourses() {
    setLoading(true);
    let query = supabase
      .from('courses')
      .select('*, instructor:profiles(*), lessons(id)')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);
    if (difficulty) query = query.eq('difficulty', difficulty);

    const { data } = await query;

    if (data) {
      const courseList = data as CourseWithInstructor[];
      setCourses(courseList);

      // Fetch enrollment counts
      const ids = courseList.map((c) => c.id);
      if (ids.length > 0) {
        const counts: Record<string, number> = {};
        await Promise.all(
          ids.map(async (id) => {
            const { count } = await supabase
              .from('enrollments')
              .select('id', { count: 'exact', head: true })
              .eq('course_id', id);
            counts[id] = count ?? 0;
          })
        );
        setEnrollmentCounts(counts);
      }
    }
    setLoading(false);
  }

  const filtered = courses.filter((c) =>
    search.trim()
      ? c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.short_description?.toLowerCase().includes(search.toLowerCase()) ||
        c.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      : true
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-sky-900 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Explore Courses
            </h1>
            <p className="text-slate-300 text-lg mb-8">
              Discover expert-led courses to level up your skills.
            </p>
            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search courses, topics, skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-13 bg-white/95 border-white/20 text-slate-900 placeholder:text-slate-400 rounded-2xl shadow-xl text-base h-12"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Category tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 mr-1" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  category === cat.id
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-1.5 flex-wrap sm:ml-auto">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff.id}
                onClick={() => setDifficulty(diff.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  difficulty === diff.id
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                )}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-slate-700 mb-2">No courses found</h3>
            <p className="text-slate-500 mb-6">
              {search ? `No results for "${search}"` : 'No courses match your filters yet.'}
            </p>
            <Button onClick={() => { setSearch(''); setCategory(''); setDifficulty(''); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-800">{filtered.length}</span> course{filtered.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrollmentCount={enrollmentCounts[course.id] ?? 0}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense>
      <CourseCatalogContent />
    </Suspense>
  );
}
