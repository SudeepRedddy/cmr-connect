import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { CoursesSection } from '@/components/CoursesSection';
import { PlacementsSection } from '@/components/PlacementsSection';
import { AboutSection } from '@/components/AboutSection';
import { Footer } from '@/components/Footer';
import Chatbot from '@/components/Chatbot';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <CoursesSection />
        <PlacementsSection />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Index;
