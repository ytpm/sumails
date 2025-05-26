"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";

type TestimonialProps = {
  testimonial: {
    name: string;
    role: string;
    content: string;
    avatar: string;
    rating: number;
  };
  index: number;
};

const TestimonialCard = ({ testimonial, index }: TestimonialProps) => {
  const variants = {
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
    <motion.div
      variants={variants}
      className="card flex h-full flex-col p-6"
    >
      {/* Stars */}
      <div className="mb-4 flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < testimonial.rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <p className="mb-6 flex-grow italic text-gray-700">
        "{testimonial.content}"
      </p>

      {/* Person */}
      <div className="flex items-center">
        <Image
          src={testimonial.avatar}
          alt={testimonial.name}
          width={48}
          height={48}
          className="mr-4 h-12 w-12 rounded-full object-cover"
        />
        <div>
          <h4 className="font-semibold">{testimonial.name}</h4>
          <p className="text-sm text-gray-500">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;