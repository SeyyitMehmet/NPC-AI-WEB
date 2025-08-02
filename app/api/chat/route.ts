import { NextRequest, NextResponse } from 'next/server';

// Bu fonksiyon, Next.js'in Edge Runtime'ında çalışacak şekilde ayarlanmıştır.
// Bu, Vercel'de daha hızlı ve verimli çalışmasını sağlar.
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // Frontend'den gelen isteğin içindeki JSON verisini alıyoruz.
    const { query } = await req.json();

    // Google Cloud Run API'mizin URL'sini ortam değişkenlerinden (environment variables) güvenli bir şekilde alıyoruz.
    // Bu URL'yi doğrudan koda yazmak yerine .env.local dosyasından çekeceğiz.
    const CLOUD_RUN_API_URL = process.env.CLOUD_RUN_API_URL;

    if (!CLOUD_RUN_API_URL) {
      // Eğer URL tanımlanmamışsa, sunucuda hata mesajı oluşturup geri döndürüyoruz.
      throw new Error("CLOUD_RUN_API_URL ortam değişkeni tanımlanmamış.");
    }

    // Frontend'den aldığımız sorguyu, Google Cloud Run API'mize POST isteği ile gönderiyoruz.
    const response = await fetch(CLOUD_RUN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }), // Gelen sorguyu olduğu gibi iletiyoruz.
    });

    // Eğer Cloud Run API'si bir hata döndürürse, o hatayı yakalayıp frontend'e iletiyoruz.
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Cloud Run API hatası');
    }

    // Cloud Run API'sinden gelen cevabı alıyoruz.
    const data = await response.json();

    // Aldığımız cevabı, kendi sitemizin frontend'ine JSON formatında geri döndürüyoruz.
    return NextResponse.json(data);

  } catch (error: any) {
    // Herhangi bir hata durumunda, hatayı yakalayıp 500 koduyla birlikte frontend'e bildiriyoruz.
    console.error("API Route Hatası:", error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
