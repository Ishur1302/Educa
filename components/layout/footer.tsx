import Link from 'next/link';
import { GraduationCap, Github, Linkedin, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">EduForge</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs text-slate-400">
              A modern learning management platform for creators and learners. Build skills, share knowledge, grow together.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://github.com/Ishur1302/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/ishan-sharma-302741293/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/courses" className="hover:text-white transition-colors">Explore Courses</Link></li>
              <li><Link href="/auth?tab=signup" className="hover:text-white transition-colors">Become an Instructor</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/courses/create" className="hover:text-white transition-colors">Create a Course</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/courses?category=web-development" className="hover:text-white transition-colors">Web Development</Link></li>
              <li><Link href="/courses?category=data-science" className="hover:text-white transition-colors">Data Science</Link></li>
              <li><Link href="/courses?category=design" className="hover:text-white transition-colors">UI/UX Design</Link></li>
              <li><Link href="/courses?category=ai-ml" className="hover:text-white transition-colors">AI & Machine Learning</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} EduForge. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Built by</span>
            <a
              href="https://www.linkedin.com/in/ishan-sharma-302741293/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sky-400 hover:text-sky-300 transition-colors"
            >
              Ishan Sharma
            </a>
            <span>·</span>
            <a
              href="https://github.com/Ishur1302/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Github className="w-3 h-3" />
              <span>GitHub</span>
            </a>
            <span>·</span>
            <a
              href="https://www.linkedin.com/in/ishan-sharma-302741293/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Linkedin className="w-3 h-3" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
