'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GraduationCap, BookOpen, LayoutDashboard, User, LogOut, Menu, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isLanding = pathname === '/';

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled || !isLanding
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-md group-hover:shadow-sky-200 transition-shadow">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span
              className={cn(
                'font-display font-bold text-xl tracking-tight transition-colors',
                scrolled || !isLanding ? 'text-slate-900' : 'text-white'
              )}
            >
              EduForge
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/courses"
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                scrolled || !isLanding
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              )}
            >
              Explore Courses
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  scrolled || !isLanding
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                )}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button
                  onClick={() => router.push('/courses/create')}
                  size="sm"
                  className="bg-sky-500 hover:bg-sky-600 text-white shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create Course
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="focus:outline-none">
                      <Avatar className="w-9 h-9 cursor-pointer ring-2 ring-sky-100 hover:ring-sky-300 transition-all">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-sky-400 to-cyan-500 text-white text-sm font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/courses')}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      My Courses
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-700">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      scrolled || !isLanding
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    )}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth?tab=signup">
                  <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white shadow-sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className={cn(
              'md:hidden p-2 rounded-lg transition-colors',
              scrolled || !isLanding ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg">
          <div className="px-4 py-4 space-y-2">
            <Link
              href="/courses"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => setMobileOpen(false)}
            >
              <BookOpen className="w-4 h-4" />
              Explore Courses
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setMobileOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  href="/courses/create"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-sky-600 hover:bg-sky-50"
                  onClick={() => setMobileOpen(false)}
                >
                  <Plus className="w-4 h-4" />
                  Create Course
                </Link>
                <button
                  onClick={() => { handleSignOut(); setMobileOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link href="/auth" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth?tab=signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-sky-500 hover:bg-sky-600" size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
