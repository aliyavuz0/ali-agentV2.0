import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    console.log("--- GOOGLE GİRİŞ TESTİ BAŞLADI ---");
    console.log("1. Callback dosyası çalıştı! Gelen kod:", code ? "Var" : "Yok");

    if (code) {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.log("2. HATA: Oturum açılamadı ->", error.message);
        }

        if (!error && data?.user) {
            console.log("3. BAŞARILI: Kullanıcı alındı ID:", data.user.id);

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("preferred_language")
                .eq("id", data.user.id)
                .single();

            if (profileError) {
                console.log("4. HATA: Veritabanı profili okunamadı ->", profileError.message);
            } else {
                console.log("4. BİLGİ: Veritabanından gelen profil:", profile);
            }

            if (!profile || !profile.preferred_language) {
                console.log("5. SONUÇ: Dil seçilmemiş, Onboarding sayfasına yönlendiriliyor...");
                return NextResponse.redirect(`${origin}/onboarding`);
            }

            console.log("6. SONUÇ: Dil zaten seçilmiş, Ana Sayfaya gidiyor...");
            return NextResponse.redirect(`${origin}/`);
        }
    }

    console.log("7. SONUÇ: İşlem tamamlanamadı, normal ana sayfaya dönülüyor.");
    return NextResponse.redirect(origin);
}