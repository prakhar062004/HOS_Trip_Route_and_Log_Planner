import { Navbar } from './components/SaaS/Navbar';
import { Hero } from './components/SaaS/Hero';
import { Dashboard } from './components/SaaS/Dashboard';
import { Footer } from './components/SaaS/Footer';

function App() {
  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 flex flex-col">
      <Navbar />
      <Hero />
      <Dashboard />
      <Footer />
    </div>
  );
}

export default App;
