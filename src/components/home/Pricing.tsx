"use client";

import { cn } from "@/utils";
import { motion } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { plans } from "@/data/subscription-plans";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Get current environment (you might want to adjust this based on your env setup)
  const currentEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development';

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

  const hoverVariants = {
    scale: 1.05,
    rotate: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  };

  const getPrice = (plan: typeof plans[0]) => {
    const envConfig = plan.environments[currentEnv];
    if (isAnnual && envConfig.pricing.yearly) {
      return parseFloat(envConfig.pricing.yearly.pricePerMonth?.replace('$', '').replace('/mo', '') || '0');
    }
    return parseFloat(envConfig.pricing.monthly?.price.replace('$', '').replace('/mo', '') || '0');
  };

  const getPriceDisplay = (plan: typeof plans[0]) => {
    const envConfig = plan.environments[currentEnv];
    if (isAnnual && envConfig.pricing.yearly) {
      return envConfig.pricing.yearly.pricePerMonth || envConfig.pricing.yearly.price;
    }
    return envConfig.pricing.monthly?.price || '$0/mo';
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
          {plans.map((plan, index) => {
            const envConfig = plan.environments[currentEnv];
            const price = getPrice(plan);
            const priceDisplay = getPriceDisplay(plan);
            
            return (
              <motion.div
                custom={index}
                variants={cardVariants}
                whileHover={hoverVariants}
                key={plan.conceptualId}
                className={cn(
                  "card relative flex flex-col overflow-hidden cursor-pointer",
                  envConfig.isPopular ? "border-primary-400 shadow-lg" : "",
                )}
              >
                {envConfig.isPopular && (
                  <div className="absolute right-0 top-0">
                    <div className="flex items-center bg-primary-600 px-3 py-1 text-xs font-medium text-white">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Popular
                    </div>
                  </div>
                )}

                <div className="border-b p-6">
                  <h3 className="mb-1 text-xl font-bold">{envConfig.nickname || plan.name}</h3>
                  <p className="mb-4 text-sm text-gray-600">
                    {envConfig.description || `Perfect for ${plan.conceptualId === 'free' ? 'trying out Sumails' : plan.conceptualId === 'pro' ? 'professionals managing busy inboxes' : 'power users with multiple accounts'}`}
                  </p>
                  <div className="flex items-end">
                    <span className="text-4xl font-bold">
                      ${price}
                    </span>
                    <span className="mb-1 ml-2 text-gray-600">
                      /mo{isAnnual && envConfig.pricing.yearly && ", billed annually"}
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

                    {plan.excludedFeatures?.map((feature, i) => (
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
                      envConfig.isPopular ? "btn-primary" : "btn-outline",
                    )}
                  >
                    {plan.ctaText(isAnnual, false)}
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;