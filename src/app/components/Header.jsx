import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-20 py-4 bg-white shadow-sm">
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src="/logo.png"
          alt="TipTop Logo"
          width={100}
          height={60}
          priority
        />
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-6 text-sm font-medium text-[#1A1A1A]">
        <Link href="/components/about" className="hover:text-[#71FF71] transition-colors">
          About Us
        </Link>
        <Link
          href="/auth/login"
          className="hover:text-[#71FF71] transition-colors"
        >
          Login
        </Link>
        <Link href="/Tip" className="hover:text-[#71FF71] transition-colors">
          Send a Tip
        </Link>
        <Link href="/auth/signup">
          <Button className="bg-[#71FF71] text-black hover:bg-[#00b74f] rounded-full px-4 py-2 text-sm">
            Register your service
          </Button>
        </Link>
      </nav>
    </header>
  );
}
