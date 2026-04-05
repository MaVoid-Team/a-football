import { PlayerLoginForm } from "@/components/player/player-login-form";
import { Link } from "@/i18n/navigation";
import { Trophy, Zap, Users } from "lucide-react";

export default function PlayerLoginPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left side - Brand section */}
            <div className="hidden lg:flex flex-col justify-between bg-[#EFFD5F] p-12 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full" />

                {/* Logo */}
                <div className="relative z-10">
                    <Link href="/" className="inline-block">
                        <img
                            src="/logo-dark.png"
                            alt="A Football"
                            className="h-12 w-auto object-contain"
                        />
                    </Link>
                </div>

                {/* Hero content */}
                <div className="relative z-10 space-y-8">
                    <h1 className="text-4xl xl:text-5xl font-bold text-[#1A1A1A] leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Your Game,<br />
                        Your Time,<br />
                        <span className="text-[#2D2D2D]">Your Court</span>
                    </h1>
                    <p className="text-lg text-[#2D2D2D]/80 max-w-md">
                        Book premium football courts in seconds. Join tournaments, track your matches, and connect with your football community.
                    </p>

                    {/* Feature highlights */}
                    <div className="grid grid-cols-3 gap-4 pt-4">
                        <div className="flex flex-col items-center text-center p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Zap className="h-6 w-6 text-[#1A1A1A] mb-2" />
                            <span className="text-sm font-medium text-[#1A1A1A]">Instant Booking</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Trophy className="h-6 w-6 text-[#1A1A1A] mb-2" />
                            <span className="text-sm font-medium text-[#1A1A1A]">Tournaments</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Users className="h-6 w-6 text-[#1A1A1A] mb-2" />
                            <span className="text-sm font-medium text-[#1A1A1A]">Community</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-sm text-[#2D2D2D]/60">
                    © {new Date().getFullYear()} A Football. All rights reserved.
                </div>
            </div>

            {/* Right side - Login form */}
            <div className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-white">
                {/* Mobile logo - only shows on smaller screens */}
                <div className="lg:hidden mb-8">
                    <Link href="/" className="inline-block">
                        <img
                            src="/logo-dark.png"
                            alt="A Football"
                            className="h-10 w-auto object-contain"
                        />
                    </Link>
                </div>

                <div className="w-full max-w-md">
                    <PlayerLoginForm />
                </div>
            </div>
        </div>
    );
}

