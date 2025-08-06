"use client";

import { FormEvent } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizontal, Bot, User, Copy, FilePlus2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useChat, type Message } from '@ai-sdk/react';
import { v4 as uuidv4 } from 'uuid';

// ProductCard bileşenini import ettiğimizi varsayıyoruz
import { ProductCard } from '@/components/product-card';

const suggestionPrompts = [
    "stoklardaki en ucuz aspiratörü bul.",
    "stoklardaki en pahalı aspiratörü bul.",
    "3000 ile 4000 tl arası aspiratörleri bul.",
];

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, setMessages, append, isLoading } = useChat({
    api: '/api/chat',
    experimental_streamData: true,
    body: {
      session_id: typeof window !== 'undefined' ?
        (localStorage.getItem('chat_session_id') || (() => {
          const newId = uuidv4();
          localStorage.setItem('chat_session_id', newId);
          return newId;
        })())
        : '',
    },
    onError: (error) => {
        toast.error(`Bir hata oluştu: ${error.message}`);
    }
  });

  const handleNewChat = () => {
    setMessages([]);
    const newSessionId = uuidv4();
    localStorage.setItem('chat_session_id', newSessionId);
    toast.success("Yeni bir sohbet başlatıldı!");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Mesaj panoya kopyalandı!");
  };

  const handleSuggestionClick = (prompt: string) => {
    append({
      role: 'user',
      content: prompt,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100 dark:from-gray-900 dark:via-indigo-950 dark:to-slate-900">
      <Toaster richColors position="top-right" />

      <header className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Bot className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-semibold tracking-tight">NPC-AI SATIŞ ASİSTANI</h1>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleNewChat}>
                <FilePlus2 className="h-4 w-4 mr-2" />
                Yeni Sohbet
            </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl h-full flex flex-col shadow-2xl shadow-primary/10">
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <Avatar className="h-20 w-20 mb-4 ring-2 ring-primary/20 p-1"><AvatarFallback className="bg-primary/10 text-primary w-full h-full flex items-center justify-center"><Bot size={40} /></AvatarFallback></Avatar>
                  <h2 className="text-2xl font-bold mb-2">Size nasıl yardımcı olabilirim?</h2>
                  <p className="text-muted-foreground mb-6">Aşağıdaki örneklerden birini seçin veya kendi sorunuzu sorun.</p>
                  <div className="flex flex-wrap justify-center gap-3 w-full">
                    {suggestionPrompts.map((prompt, i) => (
                      <Button key={i} variant="outline" className="h-auto" onClick={() => handleSuggestionClick(prompt)}>
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 p-6">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex items-start gap-3 group ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {m.role === 'assistant' && (<Avatar className="h-8 w-8 shrink-0"><AvatarFallback className='bg-primary/10 text-primary'><Bot size={18}/></AvatarFallback></Avatar>)}
                      <div className={`prose dark:prose-invert max-w-full relative rounded-xl px-4 py-3 text-sm shadow-md ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                        {m.role === 'assistant' && m.data && (
                            <ProductCard product={m.data} />
                        )}
                        {m.role === 'assistant' && !isLoading && (
                           <Button onClick={() => handleCopy(m.content)} variant="ghost" size="icon" className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Copy className="h-4 w-4 text-muted-foreground" />
                           </Button>
                        )}
                      </div>
                      {m.role === 'user' && <Avatar className="h-8 w-8 shrink-0"><AvatarFallback className='bg-muted-foreground/10'><User size={18}/></AvatarFallback></Avatar>}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>

          <CardFooter className="border-t pt-4">
            {/* DÜZELTME: Standart form yapısına geri dönüldü. */}
            <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
              <Input
                placeholder="Mesajınızı yazın..."
                className="flex-1"
                value={input}
                onChange={handleInputChange}
              />
              <Button
                type="submit"
                size="icon"
                className="shrink-0"
                disabled={isLoading || !input?.trim()}
              >
                <SendHorizontal size={20} />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
