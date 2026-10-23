const footerPages = [
  { href: "/about", label: "About Us" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-x-0 border-b-0 border-t border-solid border-[#e4e7ee] bg-white">
      <div className="mx-auto flex w-[min(1120px,calc(100%-48px))] flex-wrap items-center justify-between gap-x-8 gap-y-3 pb-6 pt-4 max-[720px]:w-[min(1120px,calc(100%-32px))] max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-3 max-[720px]:pb-5 max-[720px]:pt-4">
        <p className="min-w-0 text-sm text-[#5c6570]">© 2026 Sensitivity Code. All rights reserved.</p>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Footer">
          {footerPages.map((page) => (
            <a key={page.href} className="text-sm font-semibold text-[#3c4450] hover:text-[#14171c]" href={page.href}>
              {page.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
