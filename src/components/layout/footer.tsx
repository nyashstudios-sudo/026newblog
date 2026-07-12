import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <p className="text-lg font-bold">
            026<span className="text-[var(--primary)]">Newsblog</span>
          </p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Your source for breaking news, stories, and insights from top authors worldwide.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Discover</h4>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li><Link href="/explore" className="hover:text-[var(--primary)]">Explore</Link></li>
            <li><Link href="/categories" className="hover:text-[var(--primary)]">Categories</Link></li>
            <li><Link href="/podcasts" className="hover:text-[var(--primary)]">Listen</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li><Link href="/about" className="hover:text-[var(--primary)]">About Us</Link></li>
            <li><Link href="/journalists" className="hover:text-[var(--primary)]">Journalists</Link></li>
            <li><Link href="/contact" className="hover:text-[var(--primary)]">Contact</Link></li>
            <li><Link href="/author/apply" className="hover:text-[var(--primary)]">Become an Author</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li><Link href="/legal?tab=privacy" className="hover:text-[var(--primary)]">Privacy Policy</Link></li>
            <li><Link href="/legal?tab=terms" className="hover:text-[var(--primary)]">Terms of Service</Link></li>
            <li><Link href="/legal?tab=cookies" className="hover:text-[var(--primary)]">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border-subtle)] px-4 py-4 text-center text-xs text-[var(--text-tertiary)]">
        © {new Date().getFullYear()} 026Newsblog. All rights reserved.
      </div>
    </footer>
  );
}
