import { NextRequest, NextResponse } from 'next/server';

// Bu, Vercel'in varsayılan zaman aşımı süresini uzatarak timeout hatalarını önler.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // useChat hook'u tarafından gönderilen mesajları ve session_id'yi alıyoruz.
    const { messages, session_id } = await req.json();

    // Kullanıcının en son gönderdiği mesajı (query) alıyoruz.
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage?.content;

    if (!query) {
      return NextResponse.json({ error: 'Mesaj içeriği boş olamaz.' }, { status: 400 });
    }

    const CLOUD_RUN_API_URL = process.env.CLOUD_RUN_API_URL;

    if (!CLOUD_RUN_API_URL) {
      console.error("CLOUD_RUN_API_URL ortam değişkeni ayarlanmamış.");
      throw new Error("Sunucu tarafında bir yapılandırma hatası oluştu.");
    }

    // Python API'sine isteği gönder
    const pythonApiResponse = await fetch(CLOUD_RUN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, session_id }),
      // ÖNEMLİ: duplex: 'half' seçeneği, Node.js fetch'te stream'i doğru yönetmek için gereklidir.
      // @ts-ignore
      duplex: 'half',
    });

    if (!pythonApiResponse.ok) {
      const errorData = await pythonApiResponse.text();
      console.error('Cloud Run API Hatası:', errorData);
      throw new Error(`Cloud Run API'sinden hata alındı: ${pythonApiResponse.statusText}`);
    }

    if (!pythonApiResponse.body) {
        throw new Error("Cloud Run API'sinden boş yanıt gövdesi alındı.");
    }

    // Gelen stream'i parça parça okuyup istemciye göndermek için yeni bir ReadableStream oluşturuyoruz.
    const stream = new ReadableStream({
      async start(controller) {
        const reader = pythonApiResponse.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          // Gelen parçayı doğrudan istemciye gönder.
          controller.enqueue(value);
        }

        controller.close();
        reader.releaseLock();
      },
    });

    // Oluşturduğumuz bu yeni, kontrol edilebilir stream'i standart Response nesnesi ile döndürüyoruz.
    // Bu yöntem, 'ai' paketinden herhangi bir özel import gerektirmez.
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error: any) {
    console.error("API Route Hatası:", error);
    return NextResponse.json({ error: "İstek işlenirken bir hata oluştu." }, {
      status: 500
    });
  }
}
