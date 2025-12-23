import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import Stats from '@/components/home/Stats';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <Hero />
        <FeaturedCourses />
        <Categories />
        {/* testimonials later */}
        <Stats />
      </main>

      <Footer />
    </div>
  );
}