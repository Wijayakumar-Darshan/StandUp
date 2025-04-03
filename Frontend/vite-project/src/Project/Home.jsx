import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  useEffect(() => {
    const handleScroll = (e) => {
      if (e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    document.addEventListener('click', handleScroll);
    return () => {
      document.removeEventListener('click', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen text-white bg-gradient-to-r from-[#4A63A3] to-[#42868F]">
      {/* Header */}
      <header className="fixed w-full bg-opacity-90 backdrop-blur-lg p-4 shadow-lg flex justify-between items-center px-4 sm:px-6 md:px-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Stand Up</h1>
        <nav>
          <ul className="flex space-x-2 sm:space-x-6 md:space-x-8">
            <li><a href="#home" className="nav-link hover:underline text-sm md:text-base">Home</a></li>
            <li><a href="#about" className="nav-link hover:underline text-sm md:text-base">About Us</a></li>
            <li><a href="#contact" className="nav-link hover:underline text-sm md:text-base">Contact Us</a></li>
            <li>
              <Link 
                to="/login" 
                className="nav-link bg-white text-[#4A63A3] px-3 py-1 md:px-4 md:py-2 rounded-lg hover:bg-gray-200 text-sm md:text-base"
              >
                Login
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Sections */}
      <section id="home" className="h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold max-w-3xl">Welcome to Stand Up</h2>
      </section>

      <section id="about" className="h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold max-w-3xl">About Us</h2>
        <p className="max-w-2xl text-base sm:text-lg md:text-xl mt-4">We provide a seamless evaluation system for students and teachers.</p>
      </section>

      <section id="contact" className="h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold max-w-3xl">Contact Us</h2>
        <p className="text-base sm:text-lg md:text-xl mt-4">Email: support@standupeval.com | Phone: +123 456 7890</p>
      </section>

      {/* Footer */}
      <footer className="p-6 bg-gray-800 text-center">
        <p className="text-sm md:text-base">Contact Us: support@standupeval.com | +123 456 7890</p>
      </footer>
    </div>
  );
}
