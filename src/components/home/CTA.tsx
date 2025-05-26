"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { useInView } from "react-intersection-observer";

const CTA = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="bg-gradient-to-br from-primary-600 to-secondary-700 py-20 text-white">
      <div className="container-custom">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.div
            variants={itemVariants}
            className="mb-6 inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-sm"
          >
            <Mail className="mr-2 h-4 w-4" />
            <span className="text-sm font-medium">
              Start your email revolution
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="mb-6 text-3xl font-bold sm:text-4xl md:text-5xl"
          >
            Take control of your inbox today
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mx-auto mb-10 max-w-2xl text-xl text-white/80"
          >
            Join thousands of professionals who have transformed their email
            experience with Sumails.
          </motion.p>

          <motion.div variants={itemVariants}>
            <a
              href="#"
              className="inline-flex items-center rounded-lg bg-white px-8 py-3.5 font-medium text-primary-700 transition-colors hover:bg-gray-100"
            >
              Try Free for 14 Days
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
            <p className="mt-4 text-sm text-white/70">
              No credit card required. Cancel anytime.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;