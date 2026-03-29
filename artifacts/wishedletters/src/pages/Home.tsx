import { ParticleBackground } from "@/components/ParticleBackground";
import { SocialLink } from "@/components/SocialLink";
import { MusicPlayer } from "@/components/MusicPlayer";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      <ParticleBackground />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[500px] flex flex-col items-center gap-5 py-10 px-4 md:px-8"
      >
        {/* Avatar */}
        <div className="p-1 rounded-full bg-gradient-to-br from-[#9333ea] via-[#a855f7] to-[#d8b4fe] animate-pulse-ring">
          <div className="w-[110px] h-[110px] md:w-[130px] md:h-[130px] rounded-full overflow-hidden bg-[#111] border-[3px] border-black">
            <img 
              src={`${import.meta.env.BASE_URL}images/profile.png`} 
              alt="wishedletters"
              className="w-full h-full object-cover block"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://api.dicebear.com/9.x/initials/svg?seed=WL&backgroundColor=9333ea&textColor=ffffff&fontSize=42';
              }}
            />
          </div>
        </div>

        {/* Header Text */}
        <div className="text-center space-y-1">
          <h1 className="text-[1.5rem] md:text-[1.75rem] font-bold text-white tracking-tight drop-shadow-[0_0_20px_rgba(147,51,234,0.6)]">
            wishedletters
          </h1>
          <p className="text-xs text-[#d8b4fe]/70 tracking-wider uppercase font-medium">
            girls &lt;3 my swag
          </p>
        </div>

        {/* Social Links */}
        <div className="flex flex-col gap-3 w-full mt-2">
          <SocialLink 
            href="https://www.instagram.com/wishedletters"
            name="Instagram"
            label="wishedletters"
            icon={
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.052.184-6.333 2.461-6.52 6.518C.014 7.686 0 8.013 0 12c0 3.986.014 4.314.072 5.592.184 4.061 2.461 6.333 6.518 6.52C7.686 23.986 8.013 24 12 24c3.986 0 4.314-.014 5.592-.072 4.051-.184 6.333-2.461 6.52-6.518.058-1.278.072-1.606.072-5.592 0-3.986-.014-4.314-.072-5.592-.184-4.052-2.461-6.333-6.518-6.52C16.314.014 15.986 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
            }
          />
          <SocialLink 
            href="https://www.tiktok.com/@wishedletters"
            name="TikTok"
            label="wishedletters"
            icon={
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-current"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.56V6.78a4.85 4.85 0 0 1-1.07-.09z"/></svg>
            }
          />
          <SocialLink 
            href="https://discord.com/users/1457355366563053748"
            name="Discord"
            label="lemmecommit"
            icon={
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-current"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.101 18.079.11 18.1.128 18.113a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
            }
          />
        </div>

        <MusicPlayer />
      </motion.div>
    </div>
  );
}
