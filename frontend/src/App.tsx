import { Navbar } from './components/SaaS/Navbar';
import { Hero } from './components/SaaS/Hero';
import { Dashboard } from './components/SaaS/Dashboard';
import { Footer } from './components/SaaS/Footer';

function App() {
  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 flex flex-col relative overflow-x-hidden">
      {/* Creative background mesh and glowing ambient elements */}
      <div className="absolute inset-0 -z-50 overflow-hidden pointer-events-none no-print">
        {/* Dotted Grid mesh pattern overlay */}
        <div className="absolute inset-0 bg-grid-mesh opacity-100" />
        
        {/* Soft floating colored ambient glows (designed with tailwind backdrop properties) */}
        <div className="absolute top-[-10%] left-[5%] w-[45%] h-[40%] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] right-[10%] w-[35%] h-[35%] bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[20%] left-[-5%] w-[45%] h-[45%] bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-[-10%] right-[15%] w-[40%] h-[40%] bg-pink-500/5 dark:bg-pink-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '9s' }} />
      </div>

      <Navbar />
      <Hero />
      <Dashboard />
      <Footer />
    </div>
  );
}

export default App;
