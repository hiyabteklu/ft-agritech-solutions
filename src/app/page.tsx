import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import IdentityCards from '@/components/IdentityCards';
import SolutionsGrid from '@/components/SolutionsGrid';
import CommunityServiceGrid from '@/components/CommunityServiceGrid';
import InnovationFramework from '@/components/InnovationFramework';
import PartnersMarquee from '@/components/PartnersMarquee';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <IdentityCards />
        <SolutionsGrid />
        <CommunityServiceGrid />
        <InnovationFramework />
        <PartnersMarquee />
      </main>
      <Footer />
    </>
  );
}
