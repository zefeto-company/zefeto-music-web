import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Artists from './pages/Artists';
import ArtistDetail from './pages/ArtistDetail';
import MemberDetail from './pages/MemberDetail';
import Discography from './pages/Discography';
import News from './pages/News';
import Contact from './pages/Contact';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

// Layout wrapper for public pages (with Navbar + Footer)
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-zft-dark text-zft-light font-sans">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes - NO Navbar/Footer */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Public Routes - wrapped in PublicLayout with Navbar + Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/artists/:id" element={<ArtistDetail />} />
          <Route path="/artists/:id/member/:memberId" element={<MemberDetail />} />
          <Route path="/discography" element={<Discography />} />
          <Route path="/news" element={<News />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={
            <div className="pt-32 min-h-[60vh] flex items-center justify-center text-2xl font-bold text-slate-400 uppercase tracking-widest">
              About Us - Coming Soon
            </div>
          } />
          <Route path="*" element={
            <div className="pt-32 min-h-[60vh] flex items-center justify-center text-2xl font-bold text-slate-400 uppercase tracking-widest">
              404 - Page Not Found
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
