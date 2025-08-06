import { NextRequest } from 'next/server';
import { StreamingTextResponse } from 'ai';

// Bu, Vercel'in varsayılan zaman aşımı süresini uzatarak timeout hatalarını önler.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { query, session_id } = await req.json();

    const CLOUD_RUN_API_URL = process.env.CLOUD_RUN_API_URL;

    if (!CLOUD_RUN_API_URL) {
      throw new Error("CLOUD_RUN_API_URL ortam değişkeni tanımlanmamış.");
    }

    // Python API'sine isteği gönder
    const response = await fetch(CLOUD_RUN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, session_id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Cloud Run API hatası');
    }

    // Python API'sinden gelen stream'i (veri akışını) doğrudan frontend'e aktar
    const stream = response.body as ReadableStream;

    return new StreamingTextResponse(stream);

  } catch (error: any) {
    console.error("API Route Hatası:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
