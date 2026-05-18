'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import type { CourseWithInstructor, Lesson, Review, Profile } from '@/lib/database.types';
import { Clock, Users, Star, BookOpen, Play, CircleCheck as CheckCircle2, Lock, ChevronDown, ChevronUp, CreditCard as Edit, Loader as Loader2, Award, ArrowLeft, Globe, ChartBar as BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_THUMBNAILS: Record<string, string> = {
  'web-development': 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?w=1200&h=600&fit=crop',
  'data-science': 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?w=1200&h=600&fit=crop',
  'design': 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=1200&h=600&fit=crop',
  'ai-ml': 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?w=1200&h=600&fit=crop',
  'mobile': 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?w=1200&h=600&fit=crop',
  'devops': 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?w=1200&h=600&fit=crop',
  'general': 'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?w=1200&h=600&fit=crop',
};

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, profile } = useAuth();

  const [course, setCourse] = useState<CourseWithInstructor | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [reviews, setReviews] = useState<(Review & { reviewer: Profile })[]>([]);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLessons, setShowLessons] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    if (id) fetchCourse();
  }, [id, user]);

  async function fetchCourse() {
    const { data: courseData } = await supabase
      .from('courses')
      .select('*, instructor:profiles(*)')
      .eq('id', id)
      .maybeSingle();

    if (!courseData) { router.push('/courses'); return; }
    setCourse(courseData as CourseWithInstructor);

    // Lessons
    const { data: lessonData } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', id)
      .order('order_index');
    setLessons(lessonData ?? []);

    // Reviews
    const { data: reviewData } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles(*)')
      .eq('course_id', id)
      .order('created_at', { ascending: false });
    setReviews((reviewData ?? []) as (Review & { reviewer: Profile })[]);

    // Enrollment count
    const { count } = await supabase
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', id);
    setEnrollmentCount(count ?? 0);

    // Is user enrolled?
    if (user) {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      setIsEnrolled(!!enrollment);

      // Completed lessons
      const { data: progress } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id);
      setCompletedLessons(progress?.map((p) => p.lesson_id) ?? []);
    }

    setLoading(false);
  }

  async function handleEnroll() {
    if (!user) { router.push('/auth'); return; }
    setEnrolling(true);
    const { error } = await supabase
      .from('enrollments')
      .insert({ user_id: user.id, course_id: id });
    if (!error) {
      setIsEnrolled(true);
      setEnrollmentCount((c) => c + 1);
    }
    setEnrolling(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Navbar />
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (!course) return null;

  const isInstructor = user?.id === course.instructor_id;
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const thumbnail = course.thumbnail_url || CATEGORY_THUMBNAILS[course.category] || CATEGORY_THUMBNAILS['general'];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Course hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link href="/courses" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to courses
          </Link>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-sky-500/20 text-sky-300 border-sky-400/20 capitalize">
                  {course.category.replace('-', ' ')}
                </Badge>
                <Badge className={cn(
                  'capitalize border',
                  course.difficulty === 'beginner' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/20' :
                  course.difficulty === 'intermediate' ? 'bg-amber-500/20 text-amber-300 border-amber-400/20' :
                  'bg-rose-500/20 text-rose-300 border-rose-400/20'
                )}>
                  {course.difficulty}
                </Badge>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                {course.title}
              </h1>

              {course.short_description && (
                <p className="text-slate-300 text-lg leading-relaxed mb-6">{course.short_description}</p>
              )}

              <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">
                {avgRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-white">{avgRating.toFixed(1)}</span>
                    <span>({reviews.length} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{enrollmentCount} students enrolled</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{lessons.length} lessons</span>
                </div>
                {course.total_duration_minutes > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{Math.round(course.total_duration_minutes / 60)}h total</span>
                  </div>
                )}
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-700">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={course.instructor?.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-sky-400 to-cyan-500 text-white text-sm font-semibold">
                    {course.instructor?.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '??'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-slate-400">Created by</p>
                  <p className="text-white font-medium text-sm">{course.instructor?.full_name ?? 'Unknown'}</p>
                </div>
              </div>
            </div>

            {/* Enrollment card - desktop */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden sticky top-24">
                <div className="relative h-48 bg-slate-200">
                  <img src={thumbnail} alt={course.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <div className="text-3xl font-display font-bold text-slate-900 mb-4">
                    {course.price === 0 ? (
                      <span className="text-emerald-600">Free</span>
                    ) : (
                      <span>${course.price}</span>
                    )}
                  </div>

                  {isInstructor ? (
                    <Button
                      onClick={() => router.push(`/courses/${id}/edit`)}
                      className="w-full h-12 bg-slate-800 hover:bg-slate-700 font-semibold"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Course
                    </Button>
                  ) : isEnrolled ? (
                    <Button
                      onClick={() => router.push(`/courses/${id}/learn`)}
                      className="w-full h-12 bg-sky-500 hover:bg-sky-600 font-semibold"
                    >
                      <Play className="w-4 h-4 mr-2 fill-white" />
                      Continue Learning
                    </Button>
                  ) : (
                    <Button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full h-12 bg-sky-500 hover:bg-sky-600 font-semibold"
                    >
                      {enrolling ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Award className="w-4 h-4 mr-2" />
                          Enroll Now
                        </>
                      )}
                    </Button>
                  )}

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Full lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-sky-500 flex-shrink-0" />
                      <span>Learn at your own pace</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>Progress tracking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            {course.what_you_learn && course.what_you_learn.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="font-display text-xl font-bold text-slate-900 mb-5">What you will learn</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.what_you_learn.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {course.description && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="font-display text-xl font-bold text-slate-900 mb-4">About this course</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{course.description}</p>
              </div>
            )}

            {/* Curriculum */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Course Curriculum
                  <span className="ml-2 text-sm font-normal text-slate-500">({lessons.length} lessons)</span>
                </h2>
                <button
                  onClick={() => setShowLessons(!showLessons)}
                  className="text-sm text-sky-500 hover:text-sky-600 font-medium flex items-center gap-1"
                >
                  {showLessons ? <><ChevronUp className="w-4 h-4" />Collapse</> : <><ChevronDown className="w-4 h-4" />Expand</>}
                </button>
              </div>

              {showLessons && (
                <div className="space-y-2">
                  {lessons.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">No lessons added yet.</p>
                  ) : (
                    lessons.map((lesson, idx) => {
                      const isCompleted = completedLessons.includes(lesson.id);
                      const canAccess = isEnrolled || isInstructor || lesson.is_free_preview;
                      return (
                        <div
                          key={lesson.id}
                          className={cn(
                            'flex items-center gap-3 p-3.5 rounded-xl border transition-colors',
                            canAccess
                              ? 'border-slate-100 hover:border-sky-200 hover:bg-sky-50/50 cursor-pointer'
                              : 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-70'
                          )}
                          onClick={() => canAccess && router.push(`/courses/${id}/learn?lesson=${lesson.id}`)}
                        >
                          <div className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold',
                            isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                          )}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{lesson.title}</p>
                            {lesson.duration_minutes > 0 && (
                              <p className="text-xs text-slate-500">{lesson.duration_minutes} min</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {lesson.is_free_preview && (
                              <Badge variant="secondary" className="text-xs">Preview</Badge>
                            )}
                            {canAccess ? (
                              <Play className="w-4 h-4 text-sky-400" />
                            ) : (
                              <Lock className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="font-display text-xl font-bold text-slate-900 mb-2">
                  Student Reviews
                </h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-display font-bold text-slate-900">{avgRating.toFixed(1)}</div>
                    <div className="flex justify-center mt-1">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={cn('w-4 h-4', s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200')} />
                      ))}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Course Rating</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="flex gap-3 pb-4 border-b border-slate-50 last:border-0">
                      <Avatar className="w-9 h-9 flex-shrink-0">
                        <AvatarImage src={review.reviewer?.avatar_url || ''} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-sky-400 to-cyan-500 text-white">
                          {review.reviewer?.full_name?.split(' ').map((n) => n[0]).join('').slice(0,2) ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-slate-800">{review.reviewer?.full_name}</span>
                          <div className="flex">
                            {[1,2,3,4,5].map((s) => (
                              <Star key={s} className={cn('w-3 h-3', s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200')} />
                            ))}
                          </div>
                        </div>
                        {review.comment && <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar enrollment card - mobile */}
          <div className="lg:hidden">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="text-2xl font-display font-bold text-slate-900 mb-4">
                {course.price === 0 ? (
                  <span className="text-emerald-600">Free</span>
                ) : (
                  <span>${course.price}</span>
                )}
              </div>
              {isInstructor ? (
                <Button onClick={() => router.push(`/courses/${id}/edit`)} className="w-full bg-slate-800 hover:bg-slate-700">
                  <Edit className="w-4 h-4 mr-2" />Edit Course
                </Button>
              ) : isEnrolled ? (
                <Button onClick={() => router.push(`/courses/${id}/learn`)} className="w-full bg-sky-500 hover:bg-sky-600">
                  <Play className="w-4 h-4 mr-2 fill-white" />Continue Learning
                </Button>
              ) : (
                <Button onClick={handleEnroll} disabled={enrolling} className="w-full bg-sky-500 hover:bg-sky-600">
                  {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enroll Now'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
