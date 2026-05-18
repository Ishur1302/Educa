'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { Plus, X, Loader as Loader2, BookOpen, ArrowLeft, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'web-development', label: 'Web Development' },
  { id: 'data-science', label: 'Data Science' },
  { id: 'design', label: 'UI/UX Design' },
  { id: 'ai-ml', label: 'AI & Machine Learning' },
  { id: 'mobile', label: 'Mobile Development' },
  { id: 'devops', label: 'DevOps & Cloud' },
  { id: 'general', label: 'General' },
];

interface LessonDraft {
  title: string;
  content: string;
  duration_minutes: number;
  is_free_preview: boolean;
  lesson_type: 'video' | 'article' | 'quiz';
  order_index: number;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lessons, setLessons] = useState<LessonDraft[]>([]);
  const [whatYouLearn, setWhatYouLearn] = useState<string[]>(['']);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [tags, setTags] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    short_description: '',
    category: 'web-development',
    difficulty: 'beginner',
    thumbnail_url: '',
    price: '0',
    is_published: false,
  });

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  }

  function addLesson() {
    setLessons([...lessons, {
      title: '',
      content: '',
      duration_minutes: 0,
      is_free_preview: false,
      lesson_type: 'video',
      order_index: lessons.length,
    }]);
  }

  function updateLesson(idx: number, field: keyof LessonDraft, value: string | number | boolean) {
    const updated = [...lessons];
    (updated[idx] as unknown as Record<string, string | number | boolean>)[field] = value;
    setLessons(updated);
  }

  function removeLesson(idx: number) {
    setLessons(lessons.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.title.trim()) { setError('Course title is required'); return; }
    if (!form.description.trim()) { setError('Course description is required'); return; }
    setSaving(true);
    setError('');

    const totalDuration = lessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        title: form.title.trim(),
        description: form.description.trim(),
        short_description: form.short_description.trim(),
        instructor_id: user.id,
        category: form.category,
        difficulty: form.difficulty as 'beginner' | 'intermediate' | 'advanced',
        thumbnail_url: form.thumbnail_url.trim(),
        price: parseFloat(form.price) || 0,
        is_published: form.is_published,
        total_duration_minutes: totalDuration,
        what_you_learn: whatYouLearn.filter(Boolean),
        requirements: requirements.filter(Boolean),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (courseError) {
      setError(courseError.message);
      setSaving(false);
      return;
    }

    // Insert lessons
    if (lessons.length > 0 && course) {
      const lessonInserts = lessons
        .filter((l) => l.title.trim())
        .map((l, i) => ({
          course_id: course.id,
          title: l.title.trim(),
          content: l.content,
          duration_minutes: l.duration_minutes || 0,
          is_free_preview: l.is_free_preview,
          lesson_type: l.lesson_type,
          order_index: i,
          updated_at: new Date().toISOString(),
        }));

      if (lessonInserts.length > 0) {
        await supabase.from('lessons').insert(lessonInserts);
      }
    }

    router.push(`/courses/${course.id}`);
  }

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">Create New Course</h1>
              <p className="text-sm text-slate-500">Share your knowledge with the world</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
            <h2 className="font-display font-bold text-slate-900 text-lg">Course Details</h2>

            <div className="space-y-1.5">
              <Label className="font-medium text-slate-700">Course Title *</Label>
              <Input
                name="title"
                placeholder="e.g., Complete React.js Masterclass 2025"
                value={form.title}
                onChange={handleChange}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-slate-700">Short Description</Label>
              <Input
                name="short_description"
                placeholder="A one-line summary shown in course cards"
                value={form.short_description}
                onChange={handleChange}
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-slate-700">Full Description *</Label>
              <Textarea
                name="description"
                placeholder="Describe what students will learn, course structure, and who it is for..."
                value={form.description}
                onChange={handleChange}
                required
                rows={5}
                className="resize-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-medium text-slate-700">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-medium text-slate-700">Difficulty</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-medium text-slate-700">Price (USD)</Label>
                <Input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0 for free"
                  value={form.price}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-medium text-slate-700">Thumbnail URL</Label>
                <Input
                  name="thumbnail_url"
                  placeholder="https://..."
                  value={form.thumbnail_url}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-slate-700">Tags (comma-separated)</Label>
              <Input
                placeholder="react, javascript, frontend"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          {/* What you'll learn */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <h2 className="font-display font-bold text-slate-900 text-lg">What Students Will Learn</h2>
            {whatYouLearn.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder={`Learning outcome ${i + 1}`}
                  value={item}
                  onChange={(e) => {
                    const updated = [...whatYouLearn];
                    updated[i] = e.target.value;
                    setWhatYouLearn(updated);
                  }}
                  className="h-10"
                />
                {whatYouLearn.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setWhatYouLearn(whatYouLearn.filter((_, idx) => idx !== i))}
                    className="flex-shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setWhatYouLearn([...whatYouLearn, ''])}
              className="text-sky-600 border-sky-200 hover:bg-sky-50"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Learning Outcome
            </Button>
          </div>

          {/* Lessons */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-slate-900 text-lg">
                Lessons
                {lessons.length > 0 && <span className="ml-2 text-sm font-normal text-slate-500">({lessons.length})</span>}
              </h2>
              <Button type="button" onClick={addLesson} size="sm" className="bg-sky-500 hover:bg-sky-600">
                <Plus className="w-4 h-4 mr-1" />
                Add Lesson
              </Button>
            </div>

            {lessons.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No lessons yet. Add your first lesson above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Lesson {i + 1}</span>
                      <button type="button" onClick={() => removeLesson(i)} className="text-red-400 hover:text-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <Input
                      placeholder="Lesson title"
                      value={lesson.title}
                      onChange={(e) => updateLesson(i, 'title', e.target.value)}
                      className="h-10"
                    />
                    <Textarea
                      placeholder="Lesson content or description"
                      value={lesson.content}
                      onChange={(e) => updateLesson(i, 'content', e.target.value)}
                      rows={3}
                      className="resize-none text-sm"
                    />
                    <div className="flex gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="number"
                          min="0"
                          placeholder="Duration (min)"
                          value={lesson.duration_minutes || ''}
                          onChange={(e) => updateLesson(i, 'duration_minutes', parseInt(e.target.value) || 0)}
                          className="h-9 w-32"
                        />
                        <Select
                          value={lesson.lesson_type}
                          onValueChange={(v) => updateLesson(i, 'lesson_type', v)}
                        >
                          <SelectTrigger className="h-9 w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="article">Article</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <Switch
                          checked={lesson.is_free_preview}
                          onCheckedChange={(v) => updateLesson(i, 'is_free_preview', v)}
                        />
                        Free preview
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Publish */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Publish Course</h3>
                <p className="text-sm text-slate-500 mt-0.5">Make this course visible to all learners</p>
              </div>
              <Switch
                checked={form.is_published}
                onCheckedChange={(v) => setForm({ ...form, is_published: v })}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-sky-500 hover:bg-sky-600 text-white px-8"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Course
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
