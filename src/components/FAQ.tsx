"use client";

import { cn } from "@/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type FAQItemProps = {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
};

const FAQItem = ({ question, answer, isOpen, onClick }: FAQItemProps) => {
  return (
    <div className="border-b border-gray-200 py-5">
      <button
        className="flex w-full items-center justify-between text-left"
        onClick={onClick}
      >
        <h3 className="text-lg font-medium text-gray-900">{question}</h3>
        <div className="ml-2 flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-1 pt-3 text-gray-600">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "How does Sumails access my emails?",
      answer:
        "Sumails securely connects to your Gmail account using OAuth, which means we never see or store your password. We only access the data needed to provide our services, and you can revoke access at any time.",
    },
    {
      question: "Is my email data secure with Sumails?",
      answer:
        "Yes, your data security is our top priority. We use industry-standard encryption and security protocols to protect your information. We do not sell your data, and you have full control over what data Sumails can access.",
    },
    {
      question: "Can I connect multiple email accounts?",
      answer:
        "Yes! Our Free plan supports one Gmail account, while our Pro and Business plans allow for multiple accounts. This is perfect for managing personal, work, and other email accounts all in one place.",
    },
    {
      question: "Does Sumails replace my email client?",
      answer:
        "No, Sumails works alongside your existing email client. You'll still use Gmail as usual, but Sumails provides additional features like daily summaries, organization, and cleanup suggestions.",
    },
    {
      question: "How does the free trial work?",
      answer:
        "Our 14-day free trial gives you full access to all Pro plan features. No credit card is required to start, and you can cancel anytime. If you choose not to upgrade, your account will automatically switch to our Free plan.",
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer:
        "Yes, you can cancel your subscription at any time. If you cancel, you'll continue to have access to your paid features until the end of your current billing period.",
    },
  ];

  return (
    <section id="faq" className="section-padding">
      <div className="container-custom mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about Sumails and how it can help
            organize your emails.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-1 sm:p-6">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Still have questions?{" "}
            <a href="#" className="font-medium text-primary-600">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQ;