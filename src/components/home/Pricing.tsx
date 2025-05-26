"use client";

import { cn } from "@/utils";
import { motion } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useInView } from "react-intersection-observer";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const plans = [
    {
      name: "Free",
      description: "Perfect for trying out Sumails",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "Connect 1 Gmail account",
        "Daily email summaries",
        "Basic email organization",
        "14-day history",
      ],
      limitedFeatures: [
        "AI-powered insights",
        "Multiple account support",
        "Custom workflows",
        "Priority support",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Pro",
      description: "For professionals managing busy inboxes",
      monthlyPrice: 9.99,
      annualPrice: 7.99,
      features: [
        "Connect 3 Gmail accounts",
        "Daily email summaries",
        "Advanced email organization",
        "30-day history",
        "AI-powered insights",
        "Custom workflows",
      ],
      limitedFeatures: [
        "Multiple account support (unlimited)",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Business",
      description: "For power users with multiple accounts",
      monthlyPrice: 19.99,
      annualPrice: 16.99,
      features: [
        "Connect unlimited Gmail accounts",
        "Daily email summaries",
        "Advanced email organization",
        "90-day history",
        "AI-powered insights",
        "Custom workflows",
        "Multiple account support",
        "Priority support",
      ],
      limitedFeatures: [],
      cta: "Start Free Trial",
      highlighted: false,
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  return (
    <section id="pricing" className="section-padding">
      <div className="container-custom">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Simple, Transparent <span className="gradient-text">Pricing</span>
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            Choose the plan that works best for you and start organizing your
            inbox today.
          </p>

          <div className="mb-8 flex items-center justify-center">
            <div className="inline-flex rounded-full bg-gray-100 p-1">
              <button
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all",
                  isAnnual
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600",
                )}
                onClick={() => setIsAnnual(true)}
              >
                Annual
                <span className="ml-1 text-xs font-semibold text-primary-600">
                  (Save 20%)
                </span>
              </button>
              <button
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all",
                  !isAnnual
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600",
                )}
                onClick={() => setIsAnnual(false)}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {plans.map((plan, index) => (
            <motion.div
              custom={index}
              variants={cardVariants}
              key={index}
              className={cn(
                "card relative flex flex-col overflow-hidden",
                plan.highlighted ? "border-primary-400 shadow-lg" : "",
              )}
            >
              {plan.highlighted && (
                <div className="absolute right-0 top-0">
                  <div className="flex items-center bg-primary-600 px-3 py-1 text-xs font-medium text-white">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Popular
                  </div>
                </div>
              )}

              <div className="border-b p-6">
                <h3 className="mb-1 text-xl font-bold">{plan.name}</h3>
                <p className="mb-4 text-sm text-gray-600">
                  {plan.description}
                </p>
                <div className="flex items-end">
                  <span className="text-4xl font-bold">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="mb-1 ml-2 text-gray-600">
                    /mo{isAnnual && ", billed annually"}
                  </span>
                </div>
              </div>

              <div className="flex-grow p-6">
                <h4 className="mb-4 font-medium">What's included:</h4>
                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-primary-600" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}

                  {plan.limitedFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start opacity-60">
                      <X className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto p-6 pt-0">
                <a
                  href="#"
                  className={cn(
                    "btn w-full",
                    plan.highlighted ? "btn-primary" : "btn-outline",
                  )}
                >
                  {plan.cta}
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;