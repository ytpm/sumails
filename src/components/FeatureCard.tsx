"use client";

import { cn } from "@/utils";
import { motion } from "framer-motion";

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "primary" | "secondary";
};

const FeatureCard = ({ icon, title, description, color }: FeatureCardProps) => {
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
      className="card p-6 transition-shadow duration-300 hover:shadow-md"
    >
      <div
        className={cn(
          "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg",
          color === "primary"
            ? "bg-primary-100 text-primary-600"
            : "bg-secondary-100 text-secondary-600",
        )}
      >
        {icon}
      </div>

      <h3 className="mb-2 text-xl font-semibold">{title}</h3>

      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;