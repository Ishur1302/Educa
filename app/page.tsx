'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CourseCard } from '@/components/courses/course-card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { CourseWithInstructor } from '@/lib/database.types';
import { ArrowRight, BookOpen, Users, Award, Star, Zap, Shield, Code as Code2, Palette, Brain, ChartBar as BarChart3, Smartphone, Server, ChevronRight, Play, CircleCheck as CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  { id: 'web-development', label: 'Web Development', icon: Code2, color: 'bg-sky-50 text-sky-600 border-sky-100', img: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?w=400&h=240&fit=crop' },
  { id: 'data-science', label: 'Data Science', icon: BarChart3, color: 'bg-violet-50 text-violet-600 border-violet-100', img: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?w=400&h=240&fit=crop' },
  { id: 'design', label: 'UI/UX Design', icon: Palette, color: 'bg-pink-50 text-pink-600 border-pink-100', img: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=400&h=240&fit=crop' },
  { id: 'ai-ml', label: 'AI & ML', icon: Brain, color: 'bg-amber-50 text-amber-600 border-amber-100', img: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?w=400&h=240&fit=crop' },
  { id: 'mobile', label: 'Mobile Dev', icon: Smartphone, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', img: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?w=400&h=240&fit=crop' },
  { id: 'devops', label: 'DevOps & Cloud', icon: Server, color: 'bg-orange-50 text-orange-600 border-orange-100', img: 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?w=400&h=240&fit=crop' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create an Account', desc: 'Sign up as a student or instructor in seconds. Free to join, no credit card needed.' },
  { step: '02', title: 'Explore or Create', desc: 'Browse expert-led courses or create your own curriculum with our intuitive tools.' },
  { step: '03', title: 'Learn & Track Progress', desc: 'Complete lessons at your own pace and track your learning journey in real time.' },
];

export default function LandingPage() {
  const router = useRouter();
  const [featuredCourses, setFeaturedCourses] = useState<CourseWithInstructor[]>([]);
  const [courseMeta, setCourseMeta] = useState<Record<string, { enrollments: number; rating: number }>>({});
  const [stats, setStats] = useState({ courses: 0, students: 0 });

  useEffect(() => {
    async function load() {
      const { data: courses } = await supabase
        .from('courses')
        .select('*, instructor:profiles(*), lessons(id)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (courses) {
        const courseList = courses as CourseWithInstructor[];
        setFeaturedCourses(courseList);

        // Fetch enrollment counts and ratings for each course
        const meta: Record<string, { enrollments: number; rating: number }> = {};
        await Promise.all(courseList.map(async (c) => {
          const { count: enrollCount } = await supabase
            .from('enrollments')
            .select('id', { count: 'exact', head: true })
            .eq('course_id', c.id);
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('course_id', c.id);
          const avgRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
          meta[c.id] = { enrollments: enrollCount ?? 0, rating: avgRating };
        }));
        setCourseMeta(meta);
      }

      const { count: courseCount } = await supabase
        .from('courses')
        .select('id', { count: 'exact', head: true })
        .eq('is_published', true);

      const { count: studentCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      setStats({ courses: courseCount ?? 0, students: studentCount ?? 0 });
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900">
          <img
            src="https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?w=1600&h=900&fit=crop"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-sky-900/70" />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/6 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>The Future of Online Learning</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Learn Skills That
              <span className="block bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                Shape Your Future
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mb-10">
              Join thousands of learners mastering in-demand skills. Create courses, track progress, and earn recognition — all in one powerful platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <button
                onClick={() => router.push('/courses')}
                className="inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-base px-8 h-14 rounded-xl shadow-2xl shadow-sky-500/30 transition-all hover:shadow-sky-400/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                Explore Courses
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/auth?tab=signup')}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-base px-8 h-14 rounded-xl border-2 border-white/25 hover:border-white/50 backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-5 h-5 fill-white" />
                Start for Free
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Learn at your own pace</span>
              </div>
            </div>
          </div>

          {/* Stats panel */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
            {[
              { value: stats.courses > 0 ? `${stats.courses}+` : '50+', label: 'Courses', icon: BookOpen },
              { value: stats.students > 0 ? `${stats.students}+` : '1K+', label: 'Learners', icon: Users },
              { value: '4.9', label: 'Avg Rating', icon: Star },
              { value: '100%', label: 'Free to Start', icon: Award },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
                <stat.icon className="w-5 h-5 text-sky-400 mx-auto mb-1" />
                <div className="text-2xl font-display font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Explore our growing catalog of courses across the most in-demand disciplines.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/courses?category=${cat.id}`}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl border bg-white hover:border-sky-200 hover:shadow-lg hover:shadow-sky-50 transition-all duration-300 text-center"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 ${cat.color}`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-sky-600 transition-colors leading-tight">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How EduForge Works
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              From sign-up to skill mastery in three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[calc(100%-1rem)] w-full h-px border-t-2 border-dashed border-slate-200 z-0" />
                )}
                <div className="relative z-10 flex flex-col items-center text-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white font-display font-bold text-xl shadow-lg shadow-sky-200 mb-5">
                    {item.step}
                  </div>
                  <h3 className="font-display font-semibold text-slate-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  Featured Courses
                </h2>
                <p className="text-slate-500">Hand-picked courses to kickstart your learning journey.</p>
              </div>
              <Link href="/courses">
                <Button variant="outline" className="hidden sm:flex items-center gap-2">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrollmentCount={courseMeta[course.id]?.enrollments ?? 0}
                  avgRating={courseMeta[course.id]?.rating ?? 0}
                />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/courses">
                <Button variant="outline" className="w-full sm:w-auto">View All Courses</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Everything you need to{' '}
                <span className="text-sky-500">teach and learn</span>
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                EduForge is a full-featured platform built for modern educators and learners. Whether you are sharing expertise or gaining new skills, we have the tools.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Shield, title: 'Secure & Private', desc: 'Bank-grade security with row-level data protection.' },
                  { icon: Zap, title: 'Lightning Fast', desc: 'Optimized with SSR, static generation, and smart caching.' },
                  { icon: BarChart3, title: 'Progress Analytics', desc: 'Track lesson completion and course progress in real time.' },
                  { icon: Award, title: 'Flexible Roles', desc: 'Switch between student and instructor modes seamlessly.' },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-sky-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{feature.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?w=700&h=500&fit=crop"
                  alt="Learning platform dashboard"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 max-w-[200px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Course Complete!</p>
                    <p className="text-xs text-slate-500">React Masterclass</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-sky-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to start learning?
          </h2>
          <p className="text-slate-300 text-lg mb-10 leading-relaxed">
            Join EduForge today and unlock access to hundreds of expert-led courses. It is completely free to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?tab=signup">
              <button className="inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-base px-10 h-14 rounded-xl shadow-2xl shadow-sky-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto">
                Join for Free
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/courses">
              <button className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-base px-10 h-14 rounded-xl border-2 border-white/25 hover:border-white/50 backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto">
                Browse Courses
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
