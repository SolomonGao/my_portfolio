import React, { useState, useEffect } from 'react';
import WindowFrame from '../ui/WindowFrame';
import { PROJECTS, TECH_STACK, QUOTES } from '../../constants';
import { HeatData } from '../../types';
import { fetchHeatData } from '../../services/geminiService';

// --- Resume App ---
export const ResumeApp: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <WindowFrame title="My Resume" onClose={onClose}>
    <div className="space-y-8 max-w-3xl mx-auto p-8 animate-fadeIn">
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Alex Developer</h1>
        <p className="text-lg text-blue-600 font-medium">Senior Frontend Engineer & Creative Technologist</p>
      </div>
      
      <section>
        <h3 className="font-bold uppercase text-sm text-gray-400 mb-4 tracking-widest">Professional Summary</h3>
        <p className="text-gray-700 leading-relaxed">
          Passionate about bridging the gap between design and engineering. 
          Specializing in building immersive web experiences using React, WebGL (Three.js), and modern frontend architecture.
        </p>
      </section>

      <section>
        <h3 className="font-bold uppercase text-sm text-gray-400 mb-4 tracking-widest">Experience</h3>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="font-bold text-gray-800">Senior Frontend Engineer</h4>
              <span className="text-xs text-gray-500">2021 - Present</span>
            </div>
            <p className="text-sm text-gray-600">TechCorp Inc.</p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2 ml-2">
              <li>Led the migration to Next.js, improving LCP by 40%.</li>
              <li>Architected a design system used by 5 different product teams.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </WindowFrame>
);

// --- Projects App ---
export const ProjectsApp: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <WindowFrame title="My Projects" onClose={onClose} className="bg-gray-50">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 animate-fadeIn">
      {PROJECTS.map((project) => (
        <div key={project.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1">
          <div className="h-32 bg-gray-200 overflow-hidden relative">
            <img src={project.image} alt={project.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
          <div className="p-4">
            <h3 className="font-bold text-base text-gray-800">{project.name}</h3>
            <p className="text-xs text-gray-500 mt-1 mb-3 line-clamp-2">{project.description}</p>
            <div className="flex flex-wrap gap-1">
              {project.tech.map(t => (
                <span key={t} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </WindowFrame>
);

// --- Settings / Skills App ---
export const SettingsApp: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <WindowFrame title="System Settings" onClose={onClose}>
    <div className="max-w-xl mx-auto p-8 animate-fadeIn">
       <h2 className="text-xl font-bold mb-6 text-gray-800">Technical Proficiency</h2>
       <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
         {TECH_STACK.map((skill) => (
           <div key={skill.name}>
             <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
               <span>{skill.name}</span>
               <span className="text-blue-600">{skill.level}%</span>
             </div>
             <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" 
                 style={{ width: `${skill.level}%`, transition: 'width 1s ease-out' }}
               ></div>
             </div>
           </div>
         ))}
       </div>
       <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
         <p><strong>System Specs:</strong> React 19, Three.js (R3F), TailwindCSS, Gemini 2.5 Flash.</p>
       </div>
    </div>
  </WindowFrame>
);

// --- Library App ---
export const LibraryApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [quote, setQuote] = useState(QUOTES[0]);

  const nextQuote = () => {
    const random = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(random);
  };

  return (
    <WindowFrame title="Digital Library" onClose={onClose}>
      <div className="flex flex-col items-center justify-center h-full text-center p-10 bg-[#f8f5f2] animate-fadeIn">
         <div className="max-w-2xl">
           <span className="text-6xl text-serif text-gray-200 font-serif absolute -translate-x-10 -translate-y-8">“</span>
           <p className="text-3xl font-serif italic text-gray-800 mb-8 relative z-10 leading-relaxed">
             {quote.split('–')[0]}
           </p>
           <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">
             — {quote.split('–')[1] || 'Unknown'}
           </p>
         </div>
         <button 
           onClick={nextQuote} 
           className="mt-12 px-6 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-800 hover:text-white transition-all"
         >
           Pull Another Book
         </button>
      </div>
    </WindowFrame>
  );
};

// --- Heat Hub App ---
export const HeatApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [heatData, setHeatData] = useState<HeatData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchHeatData();
      setHeatData(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <WindowFrame title="Miami Heat Hub" onClose={onClose}>
      <div className="p-8 animate-fadeIn max-w-4xl mx-auto">
         <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-200">
           <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-black rounded-full flex items-center justify-center text-white font-black text-2xl shadow-xl border-4 border-white">
             MH
           </div>
           <div>
             <h2 className="text-3xl font-bold text-gray-900">Miami Heat Status</h2>
             <p className="text-gray-500">Live Intelligence Powered by Gemini AI</p>
           </div>
         </div>
         
         {loading ? (
           <div className="space-y-4 animate-pulse">
             <div className="h-4 bg-gray-200 rounded w-3/4"></div>
             <div className="h-4 bg-gray-200 rounded w-1/2"></div>
             <div className="grid grid-cols-3 gap-4 mt-8">
               <div className="h-24 bg-gray-200 rounded-lg"></div>
               <div className="h-24 bg-gray-200 rounded-lg"></div>
               <div className="h-24 bg-gray-200 rounded-lg"></div>
             </div>
           </div>
         ) : heatData ? (
           <div className="space-y-8">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Team Summary</h3>
                <p className="text-lg font-medium text-gray-800 leading-relaxed">{heatData.summary}</p>
             </div>
             
             <div>
               <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Key Rotation</h3>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {heatData.keyPlayers.map((p, i) => (
                    <div key={i} className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-xl text-center text-white shadow-lg hover:scale-105 transition-transform">
                      <div className="text-xs text-gray-400 mb-1">PLAYER 0{i+1}</div>
                      <div className="font-bold text-lg">{p}</div>
                    </div>
                  ))}
               </div>
             </div>
           </div>
         ) : (
           <div className="text-red-500 p-4 bg-red-50 rounded">Unable to fetch data.</div>
         )}
      </div>
    </WindowFrame>
  );
};
