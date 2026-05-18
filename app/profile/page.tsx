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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { Loader as Loader2, Save, User, Github, Linkedin, Globe, Mail, CircleCheck as CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    avatar_url: '',
    role: 'student',
    linkedin_url: '',
    github_url: '',
    website_url: '',
  });

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth'); return; }
    if (profile) {
      setForm({
        full_name: profile.full_name ?? '',
        bio: profile.bio ?? '',
        avatar_url: profile.avatar_url ?? '',
        role: profile.role ?? 'student',
        linkedin_url: profile.linkedin_url ?? '',
        github_url: profile.github_url ?? '',
        website_url: profile.website_url ?? '',
      });
      setLoading(false);
    }
  }, [profile, user, authLoading]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...form,
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      setError(updateError.message);
    } else {
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  const initials = form.full_name
    ? form.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Navbar />
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-sky-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-5">
            <Avatar className="w-16 h-16 ring-2 ring-sky-400/30">
              <AvatarImage src={form.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-sky-400 to-cyan-500 text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">
                {form.full_name || 'Your Profile'}
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-medium capitalize">
                {form.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
        )}
        {saved && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-sky-500" />
              <h2 className="font-display font-bold text-slate-900 text-lg">Personal Information</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-medium text-slate-700">Full Name</Label>
                <Input
                  name="full_name"
                  placeholder="Your full name"
                  value={form.full_name}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-medium text-slate-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={user?.email ?? ''}
                    disabled
                    className="h-11 pl-9 bg-slate-50 text-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-slate-700">Bio</Label>
              <Textarea
                name="bio"
                placeholder="Tell the community about yourself, your expertise, and what you love to teach or learn..."
                value={form.bio}
                onChange={handleChange}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-slate-700">Avatar URL</Label>
              <div className="flex gap-3 items-center">
                <Input
                  name="avatar_url"
                  placeholder="https://..."
                  value={form.avatar_url}
                  onChange={handleChange}
                  className="h-11 flex-1"
                />
                {form.avatar_url && (
                  <Avatar className="w-11 h-11 flex-shrink-0">
                    <AvatarImage src={form.avatar_url} />
                    <AvatarFallback className="bg-sky-100 text-sky-600">{initials}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-slate-700">Role</Label>
              <Select value={form.role} onValueChange={(v) => { setForm({ ...form, role: v }); setSaved(false); }}>
                <SelectTrigger className="h-11 max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student — I want to learn</SelectItem>
                  <SelectItem value="instructor">Instructor — I want to teach</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
            <h2 className="font-display font-bold text-slate-900 text-lg">Social Links</h2>

            <div className="space-y-1.5">
              <Label className="font-medium text-slate-700">LinkedIn</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  name="linkedin_url"
                  placeholder="https://linkedin.com/in/your-profile"
                  value={form.linkedin_url}
                  onChange={handleChange}
                  className="h-11 pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-slate-700">GitHub</Label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  name="github_url"
                  placeholder="https://github.com/your-username"
                  value={form.github_url}
                  onChange={handleChange}
                  className="h-11 pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-slate-700">Personal Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  name="website_url"
                  placeholder="https://yourwebsite.com"
                  value={form.website_url}
                  onChange={handleChange}
                  className="h-11 pl-9"
                />
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-display font-bold text-slate-900 text-lg mb-4">Account Details</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Email</p>
                <p className="text-slate-700 font-medium">{user?.email}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Member Since</p>
                <p className="text-slate-700 font-medium">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="bg-sky-500 hover:bg-sky-600 text-white px-8 h-11"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
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
