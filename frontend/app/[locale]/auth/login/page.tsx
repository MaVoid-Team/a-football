import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
    title: "Login | Court Management System",
    description: "Admin login page",
};

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full flex justify-center flex-col items-center">
                <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                    {/* We can place a logo icon here if wanted */}
                    <span className="bg-primary text-primary-foreground p-1 rounded">CM</span>
                    CourtManager
                </div>
                <LoginForm />
            </div>
        </div>
    );
}
