"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaMoneyBillWave,
  FaMobileAlt,
  FaLock,
  FaBrush,
  FaUserShield,
  FaRocket,
} from "react-icons/fa";

export default function AboutPage() {
  const features = [
    {
      title: "Instant Payouts",
      desc: "Tips go directly to workers—no delays, no middlemen.",
      icon: <FaMoneyBillWave className="text-[#00b74f] text-4xl mb-4" />,
    },
    {
      title: "QR Code Simplicity",
      desc: "Customers scan, tip, and go. No app download required.",
      icon: <FaMobileAlt className="text-[#00b74f] text-4xl mb-4" />,
    },
    {
      title: "Secure & Transparent",
      desc: "Encrypted transactions and clear reporting for businesses.",
      icon: <FaLock className="text-[#00b74f] text-4xl mb-4" />,
    },
    {
      title: "Custom Branding",
      desc: "Personalize your tipping page with logos and messages.",
      icon: <FaBrush className="text-[#00b74f] text-4xl mb-4" />,
    },
    {
      title: "Multi-role Dashboard",
      desc: "Admins, employees, and providers each get tailored views.",
      icon: <FaUserShield className="text-[#00b74f] text-4xl mb-4" />,
    },
    {
      title: "Built for Scale",
      desc: "Next.js + Laravel backend ensures speed and reliability.",
      icon: <FaRocket className="text-[#00b74f] text-4xl mb-4" />,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#1A1A1A]">
      {/* Header */}
      <header className="w-full py-4 px-6 bg-white shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1A1A1A]">TipTop</h1>
        <Link
          href="/"
          className="text-sm font-semibold text-[#00b74f] border border-[#00b74f] px-4 py-1 rounded-full hover:bg-[#00b74f] hover:text-white transition-all duration-200"
        >
          Home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 md:px-20 py-16">
        
        <section className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#1A1A1A]">
              About TipTop
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              TipTop is a mission-driven digital tipping platform built to
              recognize and reward service workers with dignity. Whether you're
              in a salon, café, delivery service, or ride-hailing business—
              TipTop makes appreciation instant, secure, and meaningful.
            </p>
            <div className="flex gap-4">
              <Link href="/auth/signup">
                <button className="bg-[#71FF71] hover:bg-[#00b74f] text-black font-medium px-6 py-3 rounded-full">
                  Register your service
                </button>
              </Link>
              <Link href="/Tip">
                <button className="border border-[#71FF71] text-[#1A1A1A] px-6 py-3 rounded-full hover:bg-[#71FF71] hover:text-black transition">
                  Send a Tip
                </button>
              </Link>
            </div>
          </div>

          <div className="relative w-full md:w-1/2 h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/waiter2.png"
              alt="Service workers illustration"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0  bg-opacity-40 flex flex-col justify-center items-center text-center px-6 text-white">
              <h2 className="text-xl md:text-2xl font-semibold mb-2">
                Dignity in Every Tip
              </h2>
              <p className="text-sm md:text-base max-w-md">
                Behind every smile is a story. TipTop helps you honor it—with
                secure, instant appreciation.
              </p>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-10 text-[#1A1A1A] text-center">
            How TipTop Makes a Difference
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03] border border-[#e5e5e5] min-h-[240px] flex flex-col items-center text-center"
              >
                {feature.icon}
                <h3 className="text-xl font-semibold mb-2 text-[#1A1A1A]">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission Section */}
        <section className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-[#1A1A1A]">
            Our Mission
          </h2>
          <p className="text-lg text-gray-700">
            We believe every service worker deserves recognition, respect, and
            reward. TipTop is more than a payment tool—it's a movement to uplift
            those who keep our communities running.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-6 bg-[#2E2E2E] text-center text-sm text-[#f1f1f1] border-t">
        © {new Date().getFullYear()} TipTop. All rights reserved.
      </footer>
    </div>
  );
}
