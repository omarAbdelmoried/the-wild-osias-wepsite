"use server";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/features/authontaction/services/auth";

export default async function Navigation() {
  const session = await auth();
  const isSingedIn = !!session?.user?.name;

  return (
    <nav className="z-10 text-lg sm:text-xl">
      <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:gap-x-8 md:gap-x-12 items-center">
        <li>
          <Link href="/" className="hover:text-accent-400 transition-colors">
            Home
          </Link>
        </li>
        <li>
          <Link
            href="/cabins"
            className="hover:text-accent-400 transition-colors"
          >
            Cabins
          </Link>
        </li>
        <li>
          <Link
            href="/about"
            className="hover:text-accent-400 transition-colors"
          >
            About
          </Link>
        </li>
        <li>
          <Link
            href="/blog"
            className="hover:text-accent-400 transition-colors"
          >
            Blog
          </Link>
        </li>
        <li>
          {isSingedIn ? (
            <span className="flex items-center gap-2">
              <Image
                width={40}
                height={40}
                src={session.user.image}
                className="rounded-full"
                alt="Guest Avatar"
              />
              <Link
                href="/account"
                className="hover:text-accent-400 transition-colors"
              >
                Guest area
              </Link>
            </span>
          ) : (
            <Link
              href="/account"
              className="hover:text-accent-400 transition-colors"
            >
              signIn
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
