import Link from "next/link";

type FooterLinks = {
  href: string;
  label: string;
};
const exploreLinks: FooterLinks[] = [
  { href: "/cabins", label: "Our cabins" },
  { href: "/about", label: "The story" },
  { href: "/contact", label: "Contact us" },
];

const guestLinks: FooterLinks[] = [
  { href: "/account", label: "Guest area" },
  { href: "/account/reservations", label: "Your reservations" },
] as const;

function Footer() {
  return (
    <footer className="border-t border-primary-800 bg-primary-950 px-8 pb-8 pt-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_1.25fr] md:gap-8">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-block text-2xl font-semibold tracking-wide text-primary-50"
            >
              The Wild Oasis
            </Link>
            <p className="mt-5 text-base leading-7 text-primary-300">
              A quiet place to slow down, breathe deeper, and make room for the
              good kind of wild.
            </p>
          </div>

          <FooterColumn heading="Explore" links={exploreLinks} />
          <FooterColumn heading="For guests" links={guestLinks} />

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-400">
              Find your way here
            </h2>
            <address className="mt-5 space-y-2 text-base not-italic leading-7 text-primary-300">
              <p>Forest Road 17</p>
              <p>Northwood, 48210</p>
              <a
                className="block transition-colors hover:text-accent-300"
                href="mailto:omarapdelmorid@gmail.com"
              >
                omarapdelmorid@gmail.com
              </a>
            </address>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-primary-800 pt-6 text-sm text-primary-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} The Wild Oasis</p>
          <p>Made for slow mornings and starry nights.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-400">
        {heading}
      </h2>
      <ul className="mt-5 space-y-3 text-base text-primary-300">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              className="transition-colors hover:text-primary-50"
              href={link.href}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Footer;
