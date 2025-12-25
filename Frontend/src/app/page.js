import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import Stats from '@/components/home/Stats';
import InstructorBanner from '@/components/home/InstructorBanner';
import { categoryAPI, courseAPI } from '@/lib/api';


export const metadata = {
  title: 'Skill-Up - Master New Skills Anytime, Anywhere',
  description: 'Join 50,000+ students learning programming, business, design, and more. Start your journey with expert-led masterclasses today.',
  openGraph: {
    title: 'Skill-Up - Master New Skills Anytime, Anywhere',
    description: 'Join 50,000+ students learning programming, business, design, and more.',
    images: ['/home-banner-og.png'],
  }
};

//ISR -1H
export const revalidate = 3600;
async function getFeaturedCourses() {
  try {
    const { data } = await courseAPI.getPublished({ limit: 8, sort: '-studentsCount' });
    return data.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch featured courses:", error);
    return [];
  }
}

async function getCategories() {
  try {
    const { data } = await categoryAPI.getAll();
    const allCats = data.data || [];
    // Filter Main categories 
    const MAIN_NAMES = ["Programming", "Design", "Business", "IT & Software", "Art", "Marketing", "Mathematics", "Languages"];
    return allCats.filter(cat => MAIN_NAMES.includes(cat.name));
  } catch (error) {
    return [];
  }
}

async function getStats() { //Dummy data till i seed more data in DB
  try {

    return [
      {
        iconKey: 'users',
        value: 50000,
        suffix: '+',
        label: 'Active Students',
        color: 'from-blue-500 to-cyan-500'
      },
      {
        iconKey: 'courses',
        value: 1000,
        suffix: '+',
        label: 'Online Courses',
        color: 'from-purple-500 to-pink-500'
      },
      {
        iconKey: 'star',
        value: 98,
        suffix: '%',
        label: 'Satisfaction Rate',
        color: 'from-yellow-500 to-orange-500'
      },
      {
        iconKey: 'globe',
        value: 150,
        suffix: '+',
        label: 'Countries Reached',
        color: 'from-green-500 to-emerald-500'
      },
    ];
  } catch (error) {
    return [];
  }
}

export default async function HomePage() {
  const [courses, categories, statsData] = await Promise.all([
    getFeaturedCourses(),
    getCategories(),
    getStats()
  ]);

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <Hero />
        <FeaturedCourses initialCourses={courses} />
        <Categories categories={categories} />
        <InstructorBanner />
        {/* <Testimonials comp/> later */}
        <Stats stats={statsData} />
      </main>

      <Footer />
    </div>
  );
}