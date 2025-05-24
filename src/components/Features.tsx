"use client";

import { motion } from "framer-motion";
import { Bot, Clock, Inbox, Layers, Sparkles, Trash2 } from "lucide-react";
import { useInView } from "react-intersection-observer";
import FeatureCard from "./FeatureCard";

const Features = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <section id="features" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary-100 px-4 py-1.5 text-xs font-medium text-primary-800">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Powerful Features
          </div>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Your inbox, <span className="gradient-text">reimagined</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Sumails transforms how you experience email with smart features
            designed to save you time and keep you organized.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          <FeatureCard
            icon={<Inbox />}
            title="Daily Email Summaries"
            description="Get a concise overview of your most important emails each morning, organized by priority and category."
            color="primary"
          />

          <FeatureCard
            icon={<Bot />}
            title="AI-Powered Insights"
            description="Our AI analyzes email content to highlight what's important and suggest appropriate actions."
            color="secondary"
          />

          <FeatureCard
            icon={<Layers />}
            title="Multiple Account Support"
            description="Connect all your email accounts for unified management and organization in one place."
            color="primary"
          />

          <FeatureCard
            icon={<Clock />}
            title="Time-Saving Filters"
            description="Smart filters automatically categorize emails so you can focus on what matters most."
            color="secondary"
          />

          <FeatureCard
            icon={<Trash2 />}
            title="Clutter Clean-up"
            description="Get recommendations for clearing out promotional emails and subscriptions you no longer need."
            color="primary"
          />

          <FeatureCard
            icon={<Sparkles />}
            title="Custom Workflows"
            description="Create personalized workflows to handle recurring emails based on your preferences."
            color="secondary"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Features;