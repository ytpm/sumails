import CTA from '@/components/home/CTA';
import FAQ from '@/components/home/FAQ';
import Features from '@/components/home/Features';
import Hero from '@/components/home/Hero';
import HowItWorks from '@/components/home/HowItWorks';
import Pricing from '@/components/home/Pricing';
import Testimonials from '@/components/home/Testimonials';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
    </div>
  );
}
