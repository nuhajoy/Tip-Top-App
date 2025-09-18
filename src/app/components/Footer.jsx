import Link from "next/link";
import "../globals.css"; 

export default function Footer() {
  return (
    <footer className="bg-[#2E2E2E] text-[#f1f1f1] px-6 md:px-20 py-12 mt-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        {/* Brand Info */}
        <div>
          <h2 className="text-xl font-bold text-[#71FF71]">TipTop</h2>
          <p className="mt-2 max-w-sm text-[#666]">
            Revolutionizing the tipping experience for service industries across
            Ethiopia.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex gap-16">
          <div>
            <h3 className="font-semibold mb-3">Product</h3>
            <ul className="space-y-2 text-[#666]">
              <li>
                <Link
                  href="/how-it-works"
                  className="hover:text-[#71FF71] transition-colors"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="/send-tip"
                  className="hover:text-[#71FF71] transition-colors"
                >
                  Send a tip
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signup"
                  className="hover:text-[#71FF71] transition-colors"
                >
                  Register your service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-[#666]">
              <li>
                <Link
                  href="/help"
                  className="hover:text-[#71FF71] transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[#71FF71] transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-[#71FF71] transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300 mt-10 pt-6 text-center">
        <p className="text-sm text-[#999]">
          © {new Date().getFullYear()} TipTop. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
