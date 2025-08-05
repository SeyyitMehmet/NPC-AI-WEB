'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { ProductCard } from '@/components/product-card';

// Mesajların yapısını tanımlayan arayüz (TypeScript için)
interface Message {
  role: 'user' | 'assistant';
  content: string;
  product_context?: any;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // DÜZELTME: Session ID'yi saklamak için bir ref oluşturuyoruz.
  // Ref, sayfa yeniden render olsa bile değerini korur.
  const sessionIdRef = useRef<string | null>(null);

  // DÜZELTME: Bu useEffect, sayfa ilk yüklendiğinde sadece bir kez çalışır.
  useEffect(() => {
    // Tarayıcının hafızasından (localStorage) mevcut session_id'yi kontrol et.
    let sessionId = localStorage.getItem('chat_session_id');

    // Eğer bir session_id yoksa, yeni bir tane oluştur.
    if (!sessionId) {
      sessionId = crypto.randomUUID(); // Benzersiz bir kimlik oluşturur.
      localStorage.setItem('chat_session_id', sessionId); // Tarayıcı hafızasına kaydet.
    }

    // Oluşturulan veya bulunan kimliği ref'e ata.
    sessionIdRef.current = sessionId;
  }, []); // Boş dependency array, sadece ilk render'da çalışmasını sağlar.

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // DÜZELTME: İstek gövdesine session_id'yi de ekliyoruz.
        body: JSON.stringify({
          query: input,
          session_id: sessionIdRef.current
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API isteği başarısız oldu');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        product_context: data.product_context,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Hata:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Bir hata oluştu: ${error.message}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          Akıllı Satış Asistanı
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 dark:text-gray-200'}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.role === 'assistant' && msg.product_context && (
                   <ProductCard product={msg.product_context} />
                )}
              </div>
            </div>
          ))}
           {isLoading && (
            <div className="flex justify-start">
               <div className="p-3 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200">
                 Yükleniyor...
               </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 p-4 shadow-inner">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex items-center">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Bir ürün hakkında soru sorun..."
              className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300"
              disabled={isLoading}
            >
              Gönder
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
