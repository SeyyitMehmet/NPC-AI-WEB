// File: app/api/chat/route.ts
// Bu dosya, web arayüzünden gelen istekleri alır ve Python Flask API'sine yönlendirir.
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// DÜZELTME: API adresini bir ortam değişkeninden al.
// Eğer ortam değişkeni tanımlı değilse, yerel geliştirme için localhost'a yönlen.
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5000/chat';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Mesaj listesindeki son kullanıcı mesajını al
    const userMessage = messages[messages.length - 1];
    if (!userMessage || userMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Geçerli bir kullanıcı mesajı bulunamadı.' },
        { status: 400 }
      );
    }

    // Python Flask API'sine POST isteği gönder
    const response = await fetch(PYTHON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Flask API'si 'query' anahtarını bekliyor
      body: JSON.stringify({ query: userMessage.content }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Hata mesajını istemciye daha anlaşılır bir formatta gönder
      return NextResponse.json(
        { error: `API Hatası: ${errorData.error || response.statusText}` },
        { status: response.status }
      );
    }

    // Flask API'sinden gelen JSON yanıtını doğrudan istemciye gönder
    const data = await response.json();

    // Vercel AI SDK'nın beklediği formatta bir "data" nesnesi ekleyerek yanıtı zenginleştiriyoruz.
    // Bu, metin olmayan verileri (ürün bilgisi gibi) sohbet akışına eklememizi sağlar.
    const responsePayload = {
        role: 'assistant',
        content: data.answer,
        data: {
            product_context: data.product_context
        }
    };

    return NextResponse.json(responsePayload);

  } catch (error) {
    console.error('Next.js API Route Hatası:', error);
    return NextResponse.json(
      { error: 'İç sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
