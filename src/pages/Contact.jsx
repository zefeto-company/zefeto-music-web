import { useState } from 'react';
import { motion } from 'framer-motion';
import { Hexagon, MapPin, Mail, CheckCircle2 } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'General Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('contact_inquiries').insert([formData]);
      if (error) console.error('Error inserting inquiry into Supabase:', error);
    } catch (err) {
      console.error('Error submitting inquiry:', err);
    } finally {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'General Inquiry',
        message: ''
      });
      setTimeout(() => setIsSuccess(false), 5000);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-black relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-hex-pattern bg-[length:40px_69px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-20 border-b border-white/10 pb-12">
          <div className="flex justify-center mb-6">
            <Hexagon className="w-8 h-8 text-slate-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tight mb-4">
            Communications Hub
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm font-medium tracking-wide">
            For business inquiries, brand partnerships, or audition submissions, establish a direct link with ZEFETO MUSIC.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
          
          {/* Contact Info Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 space-y-8"
          >
            <div className="bg-black p-8 border border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8 pb-4 border-b border-white/10">Global Headquarters</h3>
              <ul className="space-y-8">
                <li className="flex items-start gap-4">
                  <div className="p-2 border border-white/20 text-white">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-2">Virtual Studio</h4>
                    <p className="text-slate-400 text-sm font-mono leading-relaxed">Cirebon, West Java<br/>Indonesia</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-2 border border-white/20 text-white">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-2">Direct Channel</h4>
                    <a href="mailto:contact@zefetomusic.com" className="text-slate-400 text-sm font-mono hover:text-white transition-colors">
                      contact@zefetomusic.com
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8"
          >
            <div className="bg-black border border-white/10 p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 border-t border-r border-white/10 -mt-2 -mr-2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 border-b border-l border-white/10 -mb-2 -ml-2" />
              
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full min-h-[450px] flex flex-col items-center justify-center text-center space-y-6"
                >
                  <Hexagon className="w-16 h-16 text-white" />
                  <div className="flex items-center gap-2 text-white bg-white/10 px-6 py-2 border border-white/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Transmission Successful</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white uppercase tracking-wider">Message Sent</h3>
                  <p className="text-slate-400 text-sm font-medium max-w-sm">
                    Your inquiry has been logged. Our management team will process your request and respond shortly.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label htmlFor="name" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identification</label>
                      <input 
                        required
                        type="text" 
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-transparent border border-white/20 focus:outline-none focus:border-white text-white text-sm transition-all rounded-none"
                        placeholder="NAME / ORGANIZATION"
                      />
                    </div>
                    <div className="space-y-3">
                      <label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Return Channel</label>
                      <input 
                        required
                        type="email" 
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-transparent border border-white/20 focus:outline-none focus:border-white text-white text-sm transition-all rounded-none"
                        placeholder="EMAIL ADDRESS"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label htmlFor="category" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classification</label>
                      <select 
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-transparent border border-white/20 focus:outline-none focus:border-white text-white text-sm transition-all appearance-none rounded-none"
                      >
                        <option className="bg-black">General Inquiry</option>
                        <option className="bg-black">Brand Partnership</option>
                        <option className="bg-black">Collaboration Proposal</option>
                        <option className="bg-black">Audition Submission</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label htmlFor="subject" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject Line</label>
                      <input 
                        required
                        type="text" 
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-transparent border border-white/20 focus:outline-none focus:border-white text-white text-sm transition-all rounded-none"
                        placeholder="PURPOSE OF INQUIRY"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="message" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transmission Payload</label>
                    <textarea 
                      required
                      id="message"
                      name="message"
                      rows="6"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-transparent border border-white/20 focus:outline-none focus:border-white text-white text-sm transition-all resize-none rounded-none"
                      placeholder="ENTER DETAILED MESSAGE..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-5 bg-white text-black font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-200 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed border border-white"
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Hexagon className="w-4 h-4" /> Transmit Data
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
