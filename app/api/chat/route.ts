import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// API istemcisini, .env.local dosyasındaki anahtarımızla başlatıyoruz.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    // Bu sefer tüm mesaj listesi yerine sadece son mesajı alıyoruz.
    const { message } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Gelen tek mesajı doğrudan modele gönderiyoruz.
    const result = await model.generateContent(message);
    const response = result.response;
    const botResponse = response.text();

    // Modelden gelen cevabı direkt olarak JSON formatında yolluyoruz.
    return NextResponse.json({ reply: botResponse });

  } catch (error: any) {
    console.error("GEMINI API Hatası:", error);
    return NextResponse.json(
      { error: "Yapay zeka ile iletişim kurarken bir sorun oluştu." },
      { status: 500 }
    );
  }
}