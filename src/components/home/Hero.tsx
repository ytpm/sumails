"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Mail } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-40">
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="gradient-text">Smart Email Summaries</span> for
              <span className="relative whitespace-nowrap">
                <span
                  className="absolute -inset-1 block skew-y-3 bg-primary-100"
                  aria-hidden="true"
                ></span>
                <span className="relative text-primary-700">
                  {" "}
                  Busy Professionals
                </span>
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-700">
              Connect Sumails to your Gmail and get AI-powered daily summaries,
              organization, and cleanup suggestions.
            </p>

            <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 lg:justify-start">
              <a href="#" className="btn btn-primary h-auto px-8 py-3 text-base">
                Try Free for 14 Days
              </a>
              <a
                href="#how-it-works"
                className="group inline-flex items-center font-medium text-primary-600"
              >
                See how it works
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-gray-600 lg:justify-start">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-primary-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-primary-600" />
                <span>Works with multiple accounts</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-primary-600" />
                <span>Secure & private</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
              <div className="flex items-center bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-4 text-white">
                <Mail className="mr-2 h-5 w-5" />
                <h3 className="font-medium">Your Daily Email Summary</h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">
                      Important Messages (3)
                    </h4>
                    <div className="space-y-3">
                      <div className="rounded-lg border border-primary-200 bg-primary-50 p-3">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            Client Project Update
                          </span>
                          <span className="text-xs text-gray-500">
                            10:32 AM
                          </span>
                        </div>
                        <p className="truncate text-sm text-gray-600">
                          The latest designs are ready for review. Please
                          provide feedback by...
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-3">
                        <div className="flex justify-between">
                          <span className="font-medium">Team Meeting</span>
                          <span className="text-xs text-gray-500">9:15 AM</span>
                        </div>
                        <p className="truncate text-sm text-gray-600">
                          Reminder: Weekly team meeting at 3PM today. Agenda
                          includes...
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">
                      Action Required (2)
                    </h4>
                    <div className="rounded-lg border border-secondary-200 bg-secondary-50 p-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Invoice #1234 Due</span>
                        <span className="text-xs text-gray-500">Yesterday</span>
                      </div>
                      <p className="truncate text-sm text-gray-600">
                        Your invoice #1234 for $2,500 is due in 3 days. Please
                        submit payment...
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        Suggested Clean-up
                      </h4>
                      <span className="cursor-pointer text-xs text-primary-600">
                        Run now
                      </span>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <p className="text-sm text-gray-600">
                        24 promotional emails can be archived or deleted
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-sm text-gray-500">May 12, 2025</span>
                  <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                    View full report →
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute -right-5 -top-5 -z-10 h-32 w-32 rounded-full bg-secondary-200 opacity-60 blur-3xl"></div>
            <div className="absolute -bottom-5 -left-5 -z-10 h-32 w-32 rounded-full bg-primary-200 opacity-60 blur-3xl"></div>
          </motion.div>
        </div>
      </div>

      <div className="absolute right-0 top-1/2 h-2/3 w-1/3 -translate-y-1/2 bg-gradient-to-l from-primary-50 to-transparent opacity-70"></div>
      <div className="absolute left-0 top-1/2 h-2/3 w-1/3 -translate-y-1/2 bg-gradient-to-r from-secondary-50 to-transparent opacity-70"></div>
    </section>
  );
};

export default Hero;