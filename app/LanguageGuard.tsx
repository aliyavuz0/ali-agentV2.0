"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LanguageGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        async function checkUser() {
            // 1. Kullanıcı giriş yapmış mı bak?
            const { data: { session } } = await supabase.auth.getSession();

            // Eğer kullanıcı giriş yapmamışsa veya zaten onboarding sayfasındaysa karışma
            if (!session || pathname === "/onboarding") {
                setChecking(false);
                return;
            }

            // 2. Kullanıcının dil tercihi var mı bak?
            const { data: profile } = await supabase
                .from("profiles")
                .select("preferred_language")
                .eq("id", session.user.id)
                .single();

            // 3. Dil yoksa onboarding'e yolla
            if (!profile || !profile.preferred_language) {
                router.push("/onboarding");
            } else {
                setChecking(false);
            }
        }

        checkUser();
    }, [pathname, router]);

    // Kontrol bitene kadar bembeyaz ekran (veya bir yükleniyor simgesi) gösterir
    if (checking && pathname !== "/onboarding") {
        return <div className="min-h-screen bg-white" />;
    }

    return <>{children}</>;
}