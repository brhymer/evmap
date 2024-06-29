import Link from 'next/link';

interface NavbarProps {
    setCurrentView: (view: string) => void;
  }

const Navbar: React.FC<NavbarProps> = ({ setCurrentView }) => {
  return (
    <>
      <section>
        <h3 className="text-3xl mb-16 text-justify">EV Equity Mapping Platform</h3>
      </section>
      <nav className="bg-primary w-full">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
              <div className="flex justify-around h-16 items-center text-white">
                <a onClick={() => setCurrentView('home')} className="cursor-pointer">Home</a>
                <span>|</span>
                <a onClick={() => setCurrentView('about')} className="cursor-pointer">About</a>
                <span>|</span>
                <a onClick={() => setCurrentView('contact')} className="cursor-pointer">Contact</a>
              </div>
          </div>
      </nav>
    </>
  );
};

export default Navbar;