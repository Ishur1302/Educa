'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import type { Course, Lesson } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { CircleCheck as CheckCircle2, Circle, ChevronLeft, ChevronRight, Menu, X, BookOpen, Award, ArrowLeft, Play, FileText, CircleHelp as HelpCircle, Loader as Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const LESSON_TYPE_ICON: Record<string, React.ElementType> = {
  video: Play,
  article: FileText,
  quiz: HelpCircle,
};

function LearnContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth'); return; }
    if (user && id) fetchData();
  }, [user, authLoading, id]);

  useEffect(() => {
    const lessonId = searchParams.get('lesson');
    if (lessonId && lessons.length > 0) {
      const found = lessons.find((l) => l.id === lessonId);
      if (found) setCurrentLesson(found);
    }
  }, [searchParams, lessons]);

  async function fetchData() {
    if (!user) return;

    // Check enrollment
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!enrollment) { router.push(`/courses/${id}`); return; }
    setEnrolled(true);

    // Course data
    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    setCourse(courseData);

    // Lessons
    const { data: lessonData } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', id)
      .order('order_index');

    const lessonList = lessonData ?? [];
    setLessons(lessonList);

    // Set first lesson or URL-specified lesson
    const lessonId = searchParams.get('lesson');
    const target = lessonId ? lessonList.find((l) => l.id === lessonId) : lessonList[0];
    setCurrentLesson(target ?? lessonList[0] ?? null);

    // Completed lessons
    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', user.id);
    setCompletedIds(new Set(progress?.map((p) => p.lesson_id) ?? []));

    setLoading(false);
  }

  async function markComplete() {
    if (!user || !currentLesson) return;
    setMarkingComplete(true);
    const { error } = await supabase.from('lesson_progress').upsert({
      user_id: user.id,
      lesson_id: currentLesson.id,
      completed_at: new Date().toISOString(),
    });
    if (!error) {
      const newSet = new Set(completedIds);
      newSet.add(currentLesson.id);
      setCompletedIds(newSet);

      // Check if all lessons complete
      if (newSet.size === lessons.length) {
        await supabase.from('enrollments').update({ completed_at: new Date().toISOString() })
          .eq('course_id', id).eq('user_id', user.id);
      }
    }
    setMarkingComplete(false);
  }

  async function markIncomplete() {
    if (!user || !currentLesson) return;
    await supabase.from('lesson_progress').delete()
      .eq('user_id', user.id).eq('lesson_id', currentLesson.id);
    const newSet = new Set(completedIds);
    newSet.delete(currentLesson.id);
    setCompletedIds(newSet);
  }

  function goToLesson(lesson: Lesson) {
    setCurrentLesson(lesson);
    setSidebarOpen(false);
    router.push(`/courses/${id}/learn?lesson=${lesson.id}`, { scroll: false });
  }

  function goNext() {
    const idx = lessons.findIndex((l) => l.id === currentLesson?.id);
    if (idx < lessons.length - 1) goToLesson(lessons[idx + 1]);
  }

  function goPrev() {
    const idx = lessons.findIndex((l) => l.id === currentLesson?.id);
    if (idx > 0) goToLesson(lessons[idx - 1]);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
      </div>
    );
  }

  const currentIdx = lessons.findIndex((l) => l.id === currentLesson?.id);
  const isCompleted = currentLesson ? completedIds.has(currentLesson.id) : false;
  const progressPercent = lessons.length > 0 ? Math.round((completedIds.size / lessons.length) * 100) : 0;
  const LessonIcon = currentLesson ? LESSON_TYPE_ICON[currentLesson.lesson_type] ?? Play : Play;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top bar */}
      <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link href={`/courses/${id}`} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-white text-sm font-semibold line-clamp-1">{course?.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500',
                  progressPercent === 100 ? 'bg-emerald-500' : 'bg-sky-500')}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 whitespace-nowrap">{completedIds.size}/{lessons.length} lessons</span>
          </div>

          {progressPercent === 100 && (
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Course Complete!</span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={cn(
          'w-72 bg-slate-800 border-r border-slate-700 flex-shrink-0 overflow-y-auto',
          'fixed lg:relative inset-y-0 left-0 z-20 transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}>
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-semibold text-white">Course Content</h3>
            </div>
            <div className="text-xs text-slate-400">{lessons.length} lessons • {completedIds.size} completed</div>
            {/* Mini progress */}
            <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full', progressPercent === 100 ? 'bg-emerald-500' : 'bg-sky-500')}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="py-2">
            {lessons.map((lesson, idx) => {
              const isActive = lesson.id === currentLesson?.id;
              const isDone = completedIds.has(lesson.id);
              const Icon = LESSON_TYPE_ICON[lesson.lesson_type] ?? Play;
              return (
                <button
                  key={lesson.id}
                  onClick={() => goToLesson(lesson)}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-700/50',
                    isActive ? 'bg-sky-500/20 border-r-2 border-sky-500' : ''
                  )}
                >
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold',
                    isDone ? 'bg-emerald-500/20 text-emerald-400' : isActive ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-700 text-slate-400'
                  )}>
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{idx + 1}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-xs font-medium leading-snug', isActive ? 'text-sky-300' : 'text-slate-300')}>
                      {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Icon className="w-3 h-3 text-slate-500" />
                      {lesson.duration_minutes > 0 && (
                        <span className="text-xs text-slate-500">{lesson.duration_minutes}m</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-slate-900">
          {currentLesson ? (
            <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
              {/* Lesson header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <LessonIcon className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-medium text-sky-400 uppercase tracking-wide">
                      {currentLesson.lesson_type}
                      {currentLesson.duration_minutes > 0 && ` • ${currentLesson.duration_minutes} min`}
                    </span>
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                    {currentLesson.title}
                  </h1>
                </div>

                <button
                  onClick={isCompleted ? markIncomplete : markComplete}
                  disabled={markingComplete}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0',
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                      : 'bg-sky-500/20 text-sky-400 hover:bg-sky-500/30'
                  )}
                >
                  {markingComplete ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCompleted ? (
                    <><CheckCircle2 className="w-4 h-4" /> Completed</>
                  ) : (
                    <><Circle className="w-4 h-4" /> Mark Complete</>
                  )}
                </button>
              </div>

              {/* Content area */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden mb-6">
                {currentLesson.video_url ? (
                  <div className="aspect-video bg-black">
                    <iframe
                      src={currentLesson.video_url}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <div className="text-center">
                      <LessonIcon className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">
                        {currentLesson.lesson_type === 'video' ? 'No video URL provided' :
                         currentLesson.lesson_type === 'quiz' ? 'Quiz lesson' : 'Article lesson'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Text content */}
              {currentLesson.content && (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-6">
                  <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wide">Lesson Notes</h3>
                  <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                    {currentLesson.content}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={goPrev}
                  disabled={currentIdx === 0}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <span className="text-xs text-slate-500">
                  {currentIdx + 1} / {lessons.length}
                </span>

                {currentIdx === lessons.length - 1 ? (
                  <Link href={`/courses/${id}`}>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                      <Award className="w-4 h-4 mr-2" />
                      Finish Course
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={goNext}
                    className="bg-sky-500 hover:bg-sky-600 text-white"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-96">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500">No lessons available yet</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense>
      <LearnContent />
    </Suspense>
  );
}
