"use client"; // Bu bileşenin bir istemci bileşeni olduğunu belirtir, çünkü state ve event handler'lar kullanacağız.

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mesajların tipini tanımlıyoruz. Her mesajın bir ID'si, rolü (kimin gönderdiği) ve içeriği olacak.
interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
}

export default function ChatPage() {
  // Component'in state'lerini tanımlıyoruz.
  const [messages, setMessages] = useState<Message[]>([]); // Sohbet mesajlarını tutan dizi.
  const [input, setInput] = useState(''); // Kullanıcının yazdığı metni tutan state.
  const [isLoading, setIsLoading] = useState(false); // API'den cevap beklenirken yükleme durumunu yönetir.

  // Sohbet alanını otomatik olarak en alta kaydırmak için bir referans oluşturuyoruz.
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // `messages` dizisi her güncellendiğinde, sohbeti en alta kaydır.
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Form gönderildiğinde çalışacak fonksiyon.
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Sayfanın yeniden yüklenmesini engelle.
    if (!input.trim() || isLoading) return; // Boş mesaj veya yükleme sırasında göndermeyi engelle.

    // Kullanıcının mesajını `messages` dizisine ekliyoruz.
    const userMessage: Message = { id: `user-${Date.now()}`, role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput(''); // Input alanını temizle.
    setIsLoading(true); // Yükleme durumunu başlat.

    // Bot için bir "yazıyor..." mesajı ekliyoruz.
    const loadingMessage: Message = { id: `bot-${Date.now()}`, role: 'bot', content: '...' };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Kendi backend proxy'mize (/api/chat) istek atıyoruz.
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) {
        throw new Error('API isteği başarısız oldu');
      }

      const data = await response.json();
      const botResponse: Message = { id: `bot-response-${Date.now()}`, role: 'bot', content: data.answer };

      // "yazıyor..." mesajını, API'den gelen gerçek cevapla değiştiriyoruz.
      setMessages((prev) => prev.map(msg => msg.id === loadingMessage.id ? botResponse : msg));

    } catch (error) {
      console.error("Mesaj gönderilirken hata oluştu:", error);
      const errorMessage: Message = { id: `error-${Date.now()}`, role: 'bot', content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.' };
      // "yazıyor..." mesajını hata mesajıyla değiştiriyoruz.
      setMessages((prev) => prev.map(msg => msg.id === loadingMessage.id ? errorMessage : msg));
    } finally {
      setIsLoading(false); // Yükleme durumunu bitir.
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl h-[90vh] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Avatar className="mr-3">
              <AvatarImage src="/placeholder-logo.svg" alt="Bot" />
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            Akıllı Satış Asistanı
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'bot' && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-logo.svg" alt="Bot" />
                      <AvatarFallback>AS</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[75%] rounded-lg p-3 text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-800'
                    }`}
                  >
                    {message.content === '...' ? (
                      <div className="flex items-center space-x-1">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" />
                        <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400 [animation-delay:0.2s]" />
                        <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400 [animation-delay:0.4s]" />
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                   {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-user.jpg" alt="User" />
                      <AvatarFallback>Siz</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              id="message"
              placeholder="Bir mesaj yazın..."
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              Gönder
            </Button>
          </form>
        </CardFooter>
      </Card>
    </main>
  );
}
