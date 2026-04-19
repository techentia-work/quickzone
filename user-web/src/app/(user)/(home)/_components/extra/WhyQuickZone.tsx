"use client";
import { Clock, Shield, Truck } from "lucide-react";

const items = [
  {
    icon: Clock,
    title: "Lightning-fast delivery",
    desc: "Get essentials in minutes, not hours.",
  },
  {
    icon: Truck,
    title: "Wide coverage",
    desc: "Serving your neighborhood with reliable partners.",
  },
  {
    icon: Shield,
    title: "Trusted & safe",
    desc: "Secure payments and quality-checked products.",
  },
];

export function WhyQuickZone() {
  return (
    <section className="bg-white py-8 md:py-10">
      <div className=" mx-auto px-3 md:px-6 lg:px-8">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-5">
          Why shop on QuickZone?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl bg-white border border-gray-200 p-4 md:p-5 hover:border-green-200 hover:shadow-sm transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                {title}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mt-1.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyQuickZone;
