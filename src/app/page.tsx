import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import SolutionsGrid from '@/components/SolutionsGrid';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SolutionsGrid />
      </main>
    </>
  );
}
