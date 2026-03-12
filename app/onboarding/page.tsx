"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Supabase bağlantısını hazırlıyoruz
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLanguageSelect = async (language: string) => {
        setLoading(true);

        try {
            // 1. Önce giriş yapmış kullanıcının kim olduğunu buluyoruz
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // 2. Kullanıcının dil tercihini veritabanına kaydediyoruz
                const { error } = await supabase
                    .from("profiles")
                    .upsert({ id: user.id, preferred_language: language });

                if (!error) {
                    // 3. Kayıt başarılıysa, analizlerin yapılacağı ana sayfaya yönlendiriyoruz
                    router.push("/");
                    router.refresh();
                } else {
                    alert("Dil seçilirken bir hata oluştu, lütfen tekrar dene.");
                    console.error("Veritabanı hatası:", error);
                }
            }
        } catch (err) {
            console.error("Beklenmeyen hata:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center border border-gray-200">
                <h1 className="text-2xl font-bold mb-6">Dil Seçimi / Language Selection</h1>
                <p className="mb-8 text-gray-600">Lütfen devam etmek için bir dil seçin.<br />Please select a language to continue.</p>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => handleLanguageSelect("TR")}
                        disabled={loading}
                        className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        Türkçe ile Devam Et
                    </button>

                    <button
                        onClick={() => handleLanguageSelect("EN")}
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-900 disabled:opacity-50 transition-colors"
                    >
                        Continue in English
                    </button>
                </div>
            </div>
        </div>
    );
}