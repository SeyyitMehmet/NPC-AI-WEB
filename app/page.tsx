// File: app/page.tsx
// Bu dosya, sohbet arayüzünü oluşturur ve API ile iletişimi yönetir.
'use client';

import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProductCard } from '@/components/product-card'; // Yeni bileşeni import et
import type { Message } from 'ai';

// Mesaj verisinin özel veri alanını içerecek şekilde tipini genişlet
interface CustomMessage extends Message {
  data?: {
    product_context?: any;
  };
}

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    // API isteği bu yola yapılacak (yukarıda düzenlediğimiz dosya)
    api: '/api/chat',
    // Vercel AI SDK'nın özel veri alanını işlemesini sağlamak için
    // gelen yanıtı doğrudan mesaj listesine ekliyoruz.
    onResponse: (response) => {
      // Bu fonksiyonu boş bırakarak SDK'nın otomatik akışını devre dışı bırakıyoruz,
      // çünkü bizim API'miz akış (stream) desteklemiyor.
      // Yanıt işleme onFinish içinde yapılacak.
    },
    onFinish: async (message) => {
        // onFinish, API'den tam yanıt geldiğinde tetiklenir.
        // Gelen yanıtı işleyip mesaj listesine ekleyeceğiz.
    },
  });

  // Mesajları CustomMessage tipine dönüştürerek `data` alanına güvenli erişim sağla
  const customMessages: CustomMessage[] = messages;

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 shadow">
        <h1 className="text-2xl font-bold">Akıllı Satış Asistanı</h1>
      </header>

      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {customMessages.length > 0 ? (
              customMessages.map((m) => (
                <div key={m.id} className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={m.role === 'user' ? '/placeholder-user.jpg' : '/placeholder-logo.svg'} />
                    <AvatarFallback>{m.role === 'user' ? 'Siz' : 'AI'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <p className="font-bold">{m.role === 'user' ? 'Siz' : 'Asistan'}</p>
                    <div className="prose text-foreground max-w-none whitespace-pre-wrap">
                      {m.content}
                    </div>
                    {/* Eğer mesaj asistandan geldiyse ve ürün bilgisi içeriyorsa, kartı göster */}
                    {m.role === 'assistant' && m.data?.product_context && (
                      <ProductCard product={m.data.product_context} />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground">
                <p>Sohbete başlamak için bir mesaj gönderin.</p>
                <p className="text-sm">Örnek: "bana en ucuz cep telefonunu bul"</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      <footer className="bg-background border-t p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Bir mesaj yazın..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Düşünüyor...' : 'Gönder'}
          </Button>
        </form>
      </footer>
    </div>
  );
}
