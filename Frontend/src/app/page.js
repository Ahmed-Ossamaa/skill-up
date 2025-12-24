import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import Stats from '@/components/home/Stats';
import InstructorBanner from '@/components/home/InstructorBanner';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <Hero />
        <FeaturedCourses />
        <Categories />
        <InstructorBanner/>
        {/* testimonials later */}
        <Stats />
      </main>

      <Footer />
    </div>
  );
}