import Link from 'next/link';

interface NavbarProps {
    setCurrentView: (view: string) => void;
  }

const Navbar: React.FC<NavbarProps> = ({ setCurrentView }) => {
  return (
    <>
      <nav className="bg-primary">
        <div className="sm:mx-8 md:mx-12 lg:mx-16">
          <div className="flex justify-between h-16 items-center text-white">
            <h3 className="text-3xl text-justify flex-grow">EV Equity Mapping Platform</h3>
            <div className="flex space-x-4">
              <a onClick={() => setCurrentView('home')} className="cursor-pointer">Home</a>
              <span>|</span>
              <a onClick={() => setCurrentView('instructions')} className="cursor-pointer">How to Use</a>
              <span>|</span>
              <a onClick={() => setCurrentView('data')} className="cursor-pointer">Data</a>
              <span>|</span>
              <a onClick={() => setCurrentView('about')} className="cursor-pointer">About</a>
              <span>|</span>
              <a onClick={() => setCurrentView('contact')} className="cursor-pointer">Contact</a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;