'use client';

import Link from 'next/link';
import { Clock, Users, Star, BookOpen, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { CourseWithInstructor } from '@/lib/database.types';
import { cn } from '@/lib/utils';

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  intermediate: 'bg-amber-50 text-amber-700 border-amber-100',
  advanced: 'bg-rose-50 text-rose-700 border-rose-100',
};

const CATEGORY_THUMBNAILS: Record<string, string> = {
  'web-development': 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?w=600&h=340&fit=crop',
  'data-science': 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?w=600&h=340&fit=crop',
  'design': 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=600&h=340&fit=crop',
  'ai-ml': 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?w=600&h=340&fit=crop',
  'mobile': 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?w=600&h=340&fit=crop',
  'devops': 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?w=600&h=340&fit=crop',
  'general': 'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?w=600&h=340&fit=crop',
};

interface CourseCardProps {
  course: CourseWithInstructor;
  enrollmentCount?: number;
  avgRating?: number;
  className?: string;
}

export function CourseCard({ course, enrollmentCount = 0, avgRating = 0, className }: CourseCardProps) {
  const thumbnail = course.thumbnail_url || CATEGORY_THUMBNAILS[course.category] || CATEGORY_THUMBNAILS['general'];
  const lessonCount = course.lessons?.length ?? 0;
  const instructorInitials = course.instructor?.full_name
    ? course.instructor.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <Link href={`/courses/${course.id}`} className={cn('block group', className)}>
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden card-hover h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative overflow-hidden h-44 bg-slate-100">
          <img
            src={thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border', DIFFICULTY_COLOR[course.difficulty])}>
              {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
            </span>
          </div>
          {course.price === 0 && (
            <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              FREE
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-1.5 mb-2">
            <Badge variant="secondary" className="text-xs font-medium capitalize px-2 py-0.5">
              {course.category.replace('-', ' ')}
            </Badge>
          </div>

          <h3 className="font-display font-semibold text-slate-900 text-base leading-snug line-clamp-2 mb-1.5 group-hover:text-sky-600 transition-colors">
            {course.title}
          </h3>

          {course.short_description && (
            <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">
              {course.short_description}
            </p>
          )}

          {/* Instructor */}
          <div className="flex items-center gap-2 mt-auto mb-3">
            <Avatar className="w-6 h-6">
              <AvatarImage src={course.instructor?.avatar_url || ''} />
              <AvatarFallback className="text-xs bg-gradient-to-br from-sky-400 to-cyan-500 text-white">
                {instructorInitials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-slate-500">{course.instructor?.full_name || 'Unknown'}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-50 text-xs text-slate-500">
            {avgRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium text-slate-700">{avgRating.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{enrollmentCount.toLocaleString()} enrolled</span>
            </div>
            {lessonCount > 0 && (
              <div className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{lessonCount} lessons</span>
              </div>
            )}
            {course.total_duration_minutes > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <Clock className="w-3.5 h-3.5" />
                <span>{Math.round(course.total_duration_minutes / 60)}h</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
