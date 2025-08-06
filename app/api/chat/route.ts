import { NextRequest, NextResponse } from 'next/server';
import { StreamingTextResponse } from 'ai';

// Bu, Vercel'in varsayılan zaman aşımı süresini uzatarak timeout hatalarını önler.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // useChat hook'u tarafından gönderilen mesajları ve session_id'yi alıyoruz.
    const { messages, session_id } = await req.json();

    // Kullanıcının en son gönderdiği mesajı (query) alıyoruz.
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage?.content;

    // Eğer bir şekilde query boş gelirse hata döndür.
    if (!query) {
      return NextResponse.json({ error: 'Mesaj içeriği boş olamaz.' }, { status: 400 });
    }

    const CLOUD_RUN_API_URL = process.env.CLOUD_RUN_API_URL;

    if (!CLOUD_RUN_API_URL) {
      // Bu hata, sunucu loglarında daha net bilgi verir.
      console.error("CLOUD_RUN_API_URL ortam değişkeni ayarlanmamış.");
      throw new Error("Sunucu tarafında bir yapılandırma hatası oluştu.");
    }

    // Python API'sine isteği gönder
    const response = await fetch(CLOUD_RUN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Python API'sine sadece son soruyu ve session_id'yi gönderiyoruz.
      body: JSON.stringify({ query, session_id }),
    });

    if (!response.ok) {
      const errorData = await response.text(); // Hata mesajı JSON olmayabilir
      console.error('Cloud Run API Hatası:', errorData);
      throw new Error(`Cloud Run API'sinden hata alındı: ${response.statusText}`);
    }

    // Python API'sinden gelen stream'i (veri akışını) doğrudan frontend'e aktar
    // Not: `response.body` null olabilir, bu durumu kontrol etmek daha güvenlidir.
    if (!response.body) {
        throw new Error("Cloud Run API'sinden boş yanıt gövdesi alındı.");
    }
    const stream = response.body;

    return new StreamingTextResponse(stream);

  } catch (error: any) {
    console.error("API Route Hatası:", error);
    // İstemciye daha genel bir hata mesajı gönderiyoruz.
    return NextResponse.json({ error: "İstek işlenirken bir hata oluştu." }, {
      status: 500
    });
  }
}
