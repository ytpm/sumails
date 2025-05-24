import CTA from '@/components/CTA';
import FAQ from '@/components/FAQ';
import Features from '@/components/Features';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Pricing from '@/components/Pricing';
import Testimonials from '@/components/Testimonials';

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
