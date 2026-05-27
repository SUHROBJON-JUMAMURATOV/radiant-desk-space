import { Navbar } from "@/components/portfolio/Navbar";
import { Hero } from "@/components/portfolio/Hero";
import { About } from "@/components/portfolio/About";
import { Skills } from "@/components/portfolio/Skills";
import { Projects } from "@/components/portfolio/Projects";
import { Socials } from "@/components/portfolio/Socials";
import { RegisterForm } from "@/components/portfolio/RegisterForm";
import { HireForm } from "@/components/portfolio/HireForm";
import { Contact } from "@/components/portfolio/Contact";
import { Footer } from "@/components/portfolio/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Socials />
        <RegisterForm />
        <HireForm />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
