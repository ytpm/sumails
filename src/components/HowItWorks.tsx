"use client";

import { motion } from "framer-motion";
import { ArrowRight, BarChart, Mail, Zap } from "lucide-react";
import { useInView } from "react-intersection-observer";

const HowItWorks = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
      },
    }),
  };

  const steps = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Connect Your Gmail",
      description:
        "Securely link your Gmail account with just a few clicks. No need to change your email workflow.",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI Analyzes Your Inbox",
      description:
        "Our AI scans your inbox, learns your priorities, and organizes your emails intelligently.",
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Get Daily Summaries",
      description:
        "Receive a personalized daily digest highlighting important emails and action items.",
    },
  ];

  return (
    <section id="how-it-works" className="section-padding">
      <div className="container-custom">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-center text-4xl font-bold leading-tight tracking-tighter text-gray-900 md:text-5xl">
            How Sumails <span className="gradient-text">Works</span>
          </h2>
          <p className="text-lg text-gray-600">
            Get started in minutes with a simple setup process that puts you
            back in control of your inbox.
          </p>
        </div>

        <div ref={ref} className="relative">
          {/* Connector Line */}
          <div className="absolute bottom-24 left-1/2 top-24 hidden w-0.5 -translate-x-1/2 bg-gray-200 lg:block"></div>

          {/* Steps */}
          <div className="relative z-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={stepVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary-600">
                      {step.icon}
                    </div>
                  </div>
                  <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">
                      {index + 1}
                    </span>
                  </div>
                </div>

                <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                <p className="mx-auto max-w-xs text-gray-600">
                  {step.description}
                </p>

                {index < steps.length - 1 && (
                  <div className="mt-6 lg:hidden">
                    <ArrowRight className="mx-auto h-5 w-5 text-gray-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <a href="#" className="btn btn-primary inline-flex items-center">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;