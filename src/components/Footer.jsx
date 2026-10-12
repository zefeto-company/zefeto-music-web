import { Link } from 'react-router-dom';
import { Hexagon } from 'lucide-react';

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
    <rect x="2" y="2" width="20" height="20"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const YoutubeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zft-darker border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="relative flex items-center justify-center w-8 h-8">
                <Hexagon className="absolute w-8 h-8 text-slate-500 group-hover:text-white transition-colors duration-300 stroke-[1.5]" />
                <div className="w-3 h-3 bg-white clip-hexagon group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-[0.2em] text-white uppercase leading-none">
                  ZEFETO
                </span>
                <span className="text-[9px] font-medium tracking-[0.4em] text-slate-500 uppercase mt-1">
                  Music
                </span>
              </div>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs font-medium">
              The vanguard of virtual artistry. ZEFETO MUSIC shapes the future of digital entertainment and global idol culture.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold tracking-widest text-xs uppercase mb-6">Explore</h3>
            <ul className="space-y-4">
              {['Artists', 'Discography', 'News', 'About Us'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase().replace(' ', '')}`} 
                    className="text-slate-500 hover:text-white transition-colors text-sm uppercase tracking-wider font-semibold"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support / Admin */}
          <div>
            <h3 className="text-white font-bold tracking-widest text-xs uppercase mb-6">Business</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/contact" className="text-slate-500 hover:text-white transition-colors text-sm uppercase tracking-wider font-semibold">
                  Partnerships
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-500 hover:text-white transition-colors text-sm uppercase tracking-wider font-semibold">
                  Inquiries
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-slate-500 hover:text-white transition-colors text-sm uppercase tracking-wider font-semibold flex items-center gap-2">
                  Admin Portal
                  <span className="px-1.5 py-0.5 border border-slate-700 text-[9px] text-slate-400">STAFF</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Socials */}
          <div>
            <h3 className="text-white font-bold tracking-widest text-xs uppercase mb-6">Connect</h3>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white hover:text-black transition-all duration-300">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-10 h-10 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white hover:text-black transition-all duration-300">
                <YoutubeIcon className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white hover:text-black transition-all duration-300">
                <TwitterIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs font-semibold tracking-wider uppercase text-center md:text-left">
            &copy; {currentYear} ZEFETO MUSIC. All rights reserved. 
            <span className="hidden md:inline mx-2">|</span> 
            <br className="md:hidden" />
            Zepeto Virtual Artist Agency Ecosystem.
          </p>
          <div className="flex gap-6 text-xs font-semibold tracking-wider uppercase text-slate-600">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
