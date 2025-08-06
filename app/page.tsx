"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizontal, Bot, User, Copy, FilePlus2, LayoutGrid, AlertTriangle, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { ProductCard } from '@/components/product-card';
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';

// Mesaj ve veri tiplerini tanımlıyoruz
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: any; // API'den gelen ürün verisi (product_context) için
  isComplete?: boolean; // Akışın tamamlanıp tamamlanmadığını takip eder
}

const suggestionPrompts = [
    "stoklardaki en ucuz aspiratörü bul.",
    "stoklardaki en pahalı aspiratörü bul.",
    "3000 ile 4000 tl arası aspiratörleri bul.",
];

// --- YENİ BİLEŞEN: Daktilo efektiyle metin gösterimi ---
const AnimatedResponseMessage = ({ message }: { message: Message }) => {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    // Mesaj tamamlanmadıysa ve yeni içerik geldiyse animasyonu başlat/devam et
    if (!message.isComplete && displayedContent.length < message.content.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent(message.content.substring(0, displayedContent.length + 1));
      }, 20); // Yazma hızı (ms)
      return () => clearTimeout(timeout);
    } else if (message.isComplete) {
      // Mesaj tamamlandıysa, tüm içeriğin gösterildiğinden emin ol
      setDisplayedContent(message.content);
    }
  }, [message.content, displayedContent, message.isComplete]);

  return <ReactMarkdown>{displayedContent}</ReactMarkdown>;
};

// --- YENİ BİLEŞEN: Cevap üretilirken gösterilecek animasyon ---
const GeneratingResponseIndicator = () => (
  <div className="flex items-center space-x-2 text-sm text-muted-foreground p-2">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>Sizin için en iyi cevabı üretiyoruz...</span>
  </div>
);


export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_CLOUD_RUN_API_URL;

  useEffect(() => {
    // Sayfa yüklendiğinde scroll'u en alta kaydır
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  const handleNewChat = () => {
    setMessages([]);
    localStorage.setItem('chat_session_id', uuidv4());
    toast.success("Yeni bir sohbet başlatıldı!");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Mesaj panoya kopyalandı!");
  };

  const handleSubmit = async (e: FormEvent, prompt?: string) => {
    e.preventDefault();
    if (!apiUrl) {
      toast.error("API adresi yapılandırılmamış.");
      return;
    }

    const currentInput = prompt || input;
    if (!currentInput.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = { id: `user-${Date.now()}`, role: 'user', content: currentInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Bot için geçici bir 'yazıyor' mesajı ekle
    const assistantId = `assistant-${Date.now()}`;
    const assistantMessage: Message = { id: assistantId, role: 'assistant', content: '', isComplete: false };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const sessionId = localStorage.getItem('chat_session_id') || (() => {
          const newId = uuidv4();
          localStorage.setItem('chat_session_id', newId);
          return newId;
      })();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentInput, session_id: sessionId }),
      });

      if (!response.ok) {
        throw new Error(`API Hatası: ${response.status} ${response.statusText}`);
      }

      // --- MANUEL AKIŞ (STREAM) İŞLEME ---
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Yanıt akışı okunamadı.");

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break; // Akış bittiğinde döngüden çık

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Son, tamamlanmamış satırı tamponda tut

        for (const line of lines) {
          if (!line.trim()) continue;

          const prefix = line.substring(0, 2);
          const payload = line.substring(2);

          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id !== assistantId) return msg;

              let newContent = msg.content;
              let newData = msg.data;

              if (prefix === '0:') { // Ürün verisi
                try { newData = JSON.parse(payload); }
                catch (e) { console.error("Veri (0:) parse edilemedi:", payload); }
              } else if (prefix === '1:') { // Metin akışı
                try { newContent += JSON.parse(payload); }
                catch (e) { console.error("Metin (1:) parse edilemedi:", payload); }
              } else if (prefix === '2:') { // Hata
                 try {
                  const errorJson = JSON.parse(payload);
                  newContent = `Bir hata oluştu: ${errorJson.error}`;
                } catch (e) { newContent = `Hata mesajı parse edilemedi: ${payload}`; }
              }

              return { ...msg, content: newContent, data: newData };
            })
          );
        }
      }

      // Akış bittiğinde mesajı tamamlandı olarak işaretle
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, isComplete: true } : msg
        )
      );

    } catch (error: any) {
      console.error("Mesaj gönderilirken hata oluştu:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: `Üzgünüm, bir hata oluştu: ${error.message}`, isComplete: true }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!apiUrl) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-red-50 dark:bg-red-900/10 p-4">
        <Card className="w-full max-w-lg bg-background shadow-lg"><CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4"><AlertTriangle className="h-12 w-12 text-red-500" /></div>
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Yapılandırma Hatası!</h2>
            <p className="text-muted-foreground mt-2">Uygulama, API sunucusunun adresini bulamadı.</p>
            <div className="mt-4 text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-left">
              <p className="font-semibold">Lütfen `.env.local` dosyanıza aşağıdaki satırı ekleyin:</p>
              <code className="block bg-slate-200 dark:bg-slate-700 p-2 mt-2 rounded">NEXT_PUBLIC_CLOUD_RUN_API_URL=https://api-adresiniz.com</code>
              <p className="mt-2">Değişiklikten sonra sunucuyu yeniden başlatmayı unutmayın.</p>
            </div>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100 dark:from-gray-900 dark:via-indigo-950 dark:to-slate-900">
      <Toaster richColors position="top-right" />
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3"><Bot className="h-7 w-7 text-primary" /><h1 className="text-xl font-semibold tracking-tight">NPC-AI SATIŞ ASİSTANI</h1></div>
        <nav className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild><Link href="/">Sohbet</Link></Button>
            <Button variant="ghost" asChild><Link href="/urunler">Ürünler</Link></Button>
        </nav>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleNewChat}><FilePlus2 className="h-4 w-4 mr-2" />Yeni Sohbet</Button>
            <Button variant="outline" size="icon" className="md:hidden" asChild><Link href="/urunler"><LayoutGrid className="h-5 w-5"/></Link></Button>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl h-full flex flex-col shadow-2xl shadow-primary/10">
          <CardContent className="flex-1 overflow-hidden p-0"><ScrollArea className="h-full" ref={scrollAreaRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <Avatar className="h-20 w-20 mb-4 ring-2 ring-primary/20 p-1"><AvatarFallback className="bg-primary/10 text-primary w-full h-full flex items-center justify-center"><Bot size={40} /></AvatarFallback></Avatar>
                  <h2 className="text-2xl font-bold mb-2">Size nasıl yardımcı olabilirim?</h2>
                  <p className="text-muted-foreground mb-6">Aşağıdaki örneklerden birini seçin veya kendi sorunuzu sorun.</p>
                  <div className="flex flex-wrap justify-center gap-3 w-full">
                    {suggestionPrompts.map((prompt, i) => (
                      <Button key={i} variant="outline" className="h-auto" onClick={(e) => handleSubmit(e, prompt)} disabled={isLoading}>{prompt}</Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 p-6">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex items-start gap-3 group ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {m.role === 'assistant' && (<Avatar className="h-8 w-8 shrink-0"><AvatarFallback className='bg-primary/10 text-primary'><Bot size={18}/></AvatarFallback></Avatar>)}
                      <div className={`prose dark:prose-invert max-w-full relative rounded-xl px-4 py-3 text-sm shadow-md ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>

                        {/* --- DÜZELTME: Gelişmiş Yükleme ve Gösterim Mantığı --- */}
                        {m.role === 'assistant' && !m.content && !m.isComplete ? (
                          <GeneratingResponseIndicator />
                        ) : (
                          <AnimatedResponseMessage message={m} />
                        )}

                        {/* Kartı sadece mesaj tamamlandığında göster */}
                        {m.data && m.isComplete && <ProductCard product={m.data} />}

                        {/* Kopyala butonu sadece mesaj tamamlandığında gösterilir */}
                        {m.role === 'assistant' && m.isComplete && (
                           <Button onClick={() => handleCopy(m.content)} variant="ghost" size="icon" className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"><Copy className="h-4 w-4 text-muted-foreground" /></Button>
                        )}
                      </div>
                      {m.role === 'user' && <Avatar className="h-8 w-8 shrink-0"><AvatarFallback className='bg-muted-foreground/10'><User size={18}/></AvatarFallback></Avatar>}
                    </div>
                  ))}
                </div>
              )}
          </ScrollArea></CardContent>
          <CardFooter className="border-t pt-4">
            <form onSubmit={(e) => handleSubmit(e)} className="flex w-full items-center gap-2">
              <Input placeholder="Mesajınızı yazın..." className="flex-1" value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading} />
              <Button type="submit" size="icon" className="shrink-0" disabled={isLoading || !input.trim()}><SendHorizontal size={20} /></Button>
            </form>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
