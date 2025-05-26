"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import TestimonialCard from "./TestimonialCard";

const Testimonials = () => {
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

  const testimonials = [
    {
      name: "Sarah L.",
      role: "Freelance Designer",
      content:
        "Sumails has transformed how I handle client emails. The daily summaries help me prioritize what's important, and I save at least an hour each day.",
      avatar:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
    },
    {
      name: "Michael B.",
      role: "Startup Founder",
      content:
        "Managing multiple email accounts used to be a nightmare. Sumails organizes everything beautifully and the AI suggestions for cleaning up my inbox are spot on.",
      avatar:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
    },
    {
      name: "Jessica P.",
      role: "Marketing Consultant",
      content:
        "I was drowning in emails until I found Sumails. The smart categorization and important highlights make sure I never miss critical messages.",
      avatar:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 4,
    },
  ];

  return (
    <section id="testimonials" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            What Our Users <span className="gradient-text">Say</span>
          </h2>
          <p className="text-lg text-gray-600">
            Join thousands of professionals who have transformed their email
            experience with Sumails.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </motion.div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center space-x-1 text-primary-600">
            <Star className="h-5 w-5 fill-current" />
            <Star className="h-5 w-5 fill-current" />
            <Star className="h-5 w-5 fill-current" />
            <Star className="h-5 w-5 fill-current" />
            <Star className="h-5 w-5 fill-current" />
          </div>
          <p className="mt-2 text-lg font-medium text-gray-900">
            4.9/5 average rating from over 800 reviews
          </p>
        </div>

        <p className="text-center text-lg">
          Share your experience with Sumails.
        </p>
      </div>
    </section>
  );
};

export default Testimonials;