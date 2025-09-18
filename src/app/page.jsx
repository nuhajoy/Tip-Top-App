import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function LandingPage() {
  const howItWorksSteps = [
    {
      title: "Register Your Business",
      desc: "Sign up and add your employees to the platform. Each gets a unique tipping code.",
      button: "Register your service",
      link: "/auth/signup",
      image: "/image.png",
    },
    {
      title: "Share the Code",
      desc: "Employees share their unique codes with customers after providing service.",
      button: "Ask For a Code",
      link: "/auth/login",
      image: "/image copy.png",
    },
    {
      title: "Instant Tipping",
      desc: "Customers enter the code, choose amount, and pay securely through Chapa.",
      button: "Send A Tip",
      link: "/Tip",
      image: "/instant.png",
    },
  ];

  const whyChooseFeatures = [
    {
      title: "Fast Payments",
      points: [
        "Instant digital payouts",
        "Secure Chapa integration",
        "No delays or manual handling",
      ],
      icon: "/payment.png",
    },
    {
      title: "Easy to Use",
      points: [
        "Customer-Friendly Flow",
        "Simple code-based tipping",
        "Works across all devices",
      ],
      icon: "/easy.png",
    },
    {
      title: "Boost Motivation",
      points: [
        "Real-time rewards",
        "Improved morale",
        "Better customer satisfaction",
      ],
      icon: "/boost.png",
    },
  ];

  return (
    <main className="font-serif min-h-screen flex flex-col bg-white text-[#1A1A1A] pt-[80px] ">
      <Header />

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-20">
        <div className="md:w-1/2 text-left">
          <h1 className=" text-4xl font-bold mb-4">
            Revolutionized Tipping for Businesses
          </h1>
          <p className="text-lg text-[#666] mb-6">
            Empower employees with instant digital tips. Perfect for salons,
            cafés, delivery services, and ride-hailing businesses.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/signup">
              <Button className="bg-[#71FF71] text-black hover:bg-[#00b74f] rounded-full px-6 py-6">
                Register your service
              </Button>
            </Link>
            <Link href="/Tip">
              <Button className="bg-[#F5F5F5] text-[#00C853] hover:bg-[#e0e0e0] rounded-full px-6 py-6 border border-[#71FF71]">
                Send a tip
              </Button>
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <Image
            src="/landingpage.jpg"
            alt="Employees using TipTop"
            width={500}
            height={400}
            className="rounded-xl shadow-md"
          />
        </div>
      </section>

      {/* How TipTop Works Section */}
      <section className="py-20 bg-white">
        <div className="flex justify-center mb-6">
          <div className="w-32 h-[2px] bg-gradient-to-r from-[#71FF71] via-[#00b74f] to-[#00C853] rounded-full"></div>
        </div>

        <h2 className="text-3xl font-semibold text-center mb-16 text-[#1A1A1A]">
          How TipTop Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-20 text-center">
          {howItWorksSteps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center border border-gray-200 hover:shadow-lg transition-shadow duration-300 min-h-[360px]"
            >
              {/* Larger icon in circular container */}
              <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-[#E6F9E6]">
                <Image
                  src={step.image}
                  alt={step.title}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>

              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-[#666] mb-6 px-2">{step.desc}</p>
              <Link href={step.link}>
                <Button className="bg-white text-[black] border border-[#71FF71] rounded-full hover:bg-[#71FF71] hover:text-white transition-colors px-5 py-2 text-sm">
                  {step.button}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose TipTop Section */}

      <section className="w-full bg-[#F9FDF9] py-24 px-6 md:px-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-[#1A1A1A] mb-16">
          Why Choose TipTop?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {whyChooseFeatures.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-6"
            >
              {/* Icon or Image */}
              <div className="w-28 h-28 relative">
                <Image
                  src={feature.icon}
                  alt={`${feature.title} icon`}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-black">{feature.title}</h3>

              {/* Description Points */}
              <div className="space-y-3 text-[#333] text-base leading-relaxed">
                {feature.points.map((point, i) => (
                  <p key={i} className="hover:text-[#00b74f] transition-colors">
                    {point}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-white text-center">
        <h2 className="text-3xl font-bold text-[#1A1A1A] mb-6">
          Ready to Transform Your Business?
        </h2>
        <Link href="/auth/signup">
          <Button className="bg-[#71FF71] text-black px-6 py-3 rounded-full hover:bg-[#00b74f] transition-colors">
            Get Started Today
          </Button>
        </Link>
      </section>

      <Footer />
    </main>
  );
}
