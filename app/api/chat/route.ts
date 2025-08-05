import { NextRequest, NextResponse } from 'next/server';

// Bu fonksiyon, Next.js'in Edge Runtime'ında çalışacak şekilde ayarlanmıştır.
// Bu, Vercel'de daha hızlı ve verimli çalışmasını sağlar.
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // Frontend'den gelen isteğin içindeki JSON verisini alıyoruz.
    // DÜZELTME: Artık hem 'query' hem de 'session_id' alanlarını alıyoruz.
    const { query, session_id } = await req.json();

    // session_id'nin de gelip gelmediğini kontrol ediyoruz.
    if (!query || !session_id) {
      return new NextResponse(
        JSON.stringify({ error: "'query' ve 'session_id' alanları zorunludur." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Google Cloud Run API'mizin URL'sini ortam değişkenlerinden (environment variables) güvenli bir şekilde alıyoruz.
    const CLOUD_RUN_API_URL = process.env.CLOUD_RUN_API_URL;

    if (!CLOUD_RUN_API_URL) {
      // Eğer URL tanımlanmamışsa, sunucuda hata mesajı oluşturup geri döndürüyoruz.
      throw new Error("CLOUD_RUN_API_URL ortam değişkeni tanımlanmamış.");
    }

    // Frontend'den aldığımız sorguyu ve session_id'yi, Google Cloud Run API'mize POST isteği ile gönderiyoruz.
    const response = await fetch(CLOUD_RUN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // DÜZELTME: body'ye session_id'yi de ekliyoruz.
      body: JSON.stringify({ query, session_id }),
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
