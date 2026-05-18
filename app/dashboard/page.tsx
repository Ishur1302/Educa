'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CourseCard } from '@/components/courses/course-card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import type { CourseWithInstructor } from '@/lib/database.types';
import { BookOpen, GraduationCap, ChartBar as BarChart3, Clock, Plus, TrendingUp, ArrowRight, Loader as Loader2, Award, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnrolledCourse {
  course: CourseWithInstructor;
  enrollment_id: string;
  enrolled_at: string;
  completed_at: string | null;
  progressPercent: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<CourseWithInstructor[]>([]);
  const [stats, setStats] = useState({
    enrolled: 0,
    completed: 0,
    created: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth'); return; }
    if (user) fetchDashboard();
  }, [user, authLoading]);

  async function fetchDashboard() {
    if (!user) return;

    // Enrolled courses
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*, course:courses(*, instructor:profiles(*), lessons(id))')
      .eq('user_id', user.id)
      .order('enrolled_at', { ascending: false });

    const enrolled: EnrolledCourse[] = [];
    if (enrollments) {
      for (const e of enrollments) {
        const course = e.course as CourseWithInstructor;
        const totalLessons = course.lessons?.length ?? 0;

        let completedCount = 0;
        if (totalLessons > 0) {
          const lessonIds = course.lessons?.map((l: { id: string }) => l.id) ?? [];
          const { count } = await supabase
            .from('lesson_progress')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .in('lesson_id', lessonIds);
          completedCount = count ?? 0;
        }

        enrolled.push({
          course,
          enrollment_id: e.id,
          enrolled_at: e.enrolled_at,
          completed_at: e.completed_at,
          progressPercent: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
        });
      }
    }
    setEnrolledCourses(enrolled);

    // Instructor courses
    const { data: myCoursesData } = await supabase
      .from('courses')
      .select('*, instructor:profiles(*), lessons(id)')
      .eq('instructor_id', user.id)
      .order('created_at', { ascending: false });

    const myCourses = (myCoursesData ?? []) as CourseWithInstructor[];
    setInstructorCourses(myCourses);

    // Stats
    let totalStudents = 0;
    for (const c of myCourses) {
      const { count } = await supabase
        .from('enrollments')
        .select('id', { count: 'exact', head: true })
        .eq('course_id', c.id);
      totalStudents += count ?? 0;
    }

    setStats({
      enrolled: enrolled.length,
      completed: enrolled.filter((e) => e.completed_at).length,
      created: myCourses.length,
      totalStudents,
    });

    setLoading(false);
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Navbar />
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  const isInstructor = profile?.role === 'instructor' || instructorCourses.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-sky-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-sky-300 text-sm font-medium mb-1">Welcome back</p>
              <h1 className="font-display text-3xl font-bold text-white">
                {profile?.full_name || user?.email?.split('@')[0]}
              </h1>
              <p className="text-slate-400 text-sm mt-1 capitalize">
                {profile?.role || 'Student'} account
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/courses">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explore Courses
                </Button>
              </Link>
              <Link href="/courses/create">
                <Button className="bg-sky-500 hover:bg-sky-400 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Enrolled', value: stats.enrolled, icon: BookOpen, color: 'text-sky-400' },
              { label: 'Completed', value: stats.completed, icon: Award, color: 'text-emerald-400' },
              { label: 'Courses Created', value: stats.created, icon: GraduationCap, color: 'text-amber-400' },
              { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-rose-400' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={cn('w-4 h-4', stat.color)} />
                  <span className="text-xs text-slate-400">{stat.label}</span>
                </div>
                <div className="text-2xl font-display font-bold text-white">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Learning section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">My Learning</h2>
              <p className="text-sm text-slate-500">{enrolledCourses.length} enrolled course{enrolledCourses.length !== 1 ? 's' : ''}</p>
            </div>
            <Link href="/courses">
              <Button variant="outline" size="sm" className="text-sky-600 border-sky-200 hover:bg-sky-50">
                Find More
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <h3 className="font-display font-semibold text-slate-700 mb-2">No courses yet</h3>
              <p className="text-slate-500 text-sm mb-6">Start your learning journey by enrolling in a course.</p>
              <Link href="/courses">
                <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                  Browse Courses
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {enrolledCourses.map(({ course, enrolled_at, completed_at, progressPercent }) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}/learn`}
                  className="group bg-white rounded-2xl border border-slate-100 p-5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-50 transition-all flex flex-col sm:flex-row gap-4"
                >
                  <div className="sm:w-36 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                    <img
                      src={course.thumbnail_url || `https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?w=300&h=200&fit=crop`}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1 mb-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                      {course.instructor?.full_name ?? 'Unknown'} •
                      Enrolled {new Date(enrolled_at).toLocaleDateString()}
                    </p>
                    {/* Progress bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Progress
                        </span>
                        <span className="text-xs font-semibold text-slate-700">{progressPercent}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            progressPercent === 100 ? 'bg-emerald-500' : 'bg-sky-500'
                          )}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    {completed_at && (
                      <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-medium">
                        <Award className="w-3.5 h-3.5" />
                        Completed!
                      </div>
                    )}
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 flex-shrink-0">
                    <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg group-hover:bg-sky-100 transition-colors whitespace-nowrap">
                      Continue →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Instructor section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">Courses I Created</h2>
              <p className="text-sm text-slate-500">{instructorCourses.length} course{instructorCourses.length !== 1 ? 's' : ''} created</p>
            </div>
            <Link href="/courses/create">
              <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
                <Plus className="w-4 h-4 mr-1" />
                New Course
              </Button>
            </Link>
          </div>

          {instructorCourses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <GraduationCap className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <h3 className="font-display font-semibold text-slate-700 mb-2">No courses created</h3>
              <p className="text-slate-500 text-sm mb-6">Share your knowledge by creating your first course.</p>
              <Link href="/courses/create">
                <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Course
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructorCourses.map((course) => (
                <div key={course.id} className="relative">
                  <CourseCard course={course} />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {!course.is_published && (
                      <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        Draft
                      </span>
                    )}
                  </div>
                  <Link href={`/courses/${course.id}/edit`} className="absolute top-3 right-3">
                    <Button size="sm" variant="secondary" className="text-xs h-7 px-2.5 shadow-md">
                      Edit
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}
