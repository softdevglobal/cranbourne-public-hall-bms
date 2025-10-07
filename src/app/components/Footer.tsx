
const socialLinks = [
  { href: "https://facebook.com", label: "Facebook", icon: (
    <svg width="24" height="24" fill="currentColor" className="hover:text-[#4267B2] transition-colors" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.405 24 24 23.408 24 22.674V1.326C24 .592 23.405 0 22.675 0"/></svg>
  ) },
  { href: "mailto:info@cranbournepublichall.com", label: "Email", icon: (
    <svg width="24" height="24" fill="currentColor" className="hover:text-[#ec8013] transition-colors" viewBox="0 0 24 24"><path d="M12 13.065L2.53 6.53A2 2 0 0 1 4 4h16a2 2 0 0 1 1.47 2.53L12 13.065zm10-7.065H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm0 2v.217l-10 6.5-10-6.5V8l10 6.5L22 8z"/></svg>
  ) },
];

const Footer: React.FC = () => (
  <footer className="w-full bg-[#181411] text-white py-8 mt-12 flex flex-col items-center shadow-lg">
    <div className="max-w-[1100px] w-full px-4 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
      <div className="flex flex-col items-center md:items-start gap-2">
        <span className="text-lg font-bold tracking-wide">Cranbourne Public Hall</span>
        <span className="text-sm text-gray-200">A welcoming space for community events and gatherings.</span>
      </div>
      <div className="flex gap-6 mt-4 md:mt-0">
        {socialLinks.map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label} className="hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#ec8013] rounded-full transition-transform">
            {link.icon}
          </a>
        ))}
      </div>
      <div className="flex flex-col items-center md:items-end gap-2">
        <span className="text-base font-medium">© {new Date().getFullYear()} Cranbourne Public Hall</span>
        <span className="text-xs text-gray-300">Designed & built by <a href="https://softdevglobal.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#ec8013]">Softdev Global</a></span>
      </div>
    </div>
  </footer>
);

export default Footer;
