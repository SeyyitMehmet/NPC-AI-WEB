"use client"

// Gerekli tüm importları koruyoruz, sadece 'useChat' gitti, 'useState' geldi.
import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, User, Sparkles, MessageCircle, Moon, Sun, Zap, Brain, Stars, Mic, ImageIcon } from "lucide-react"

// Mesaj objesinin tipini tanımlıyoruz, bu önemlidir.
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatBot() {
  // --- 1. DEĞİŞİKLİK: 'useChat' hook'u silindi, yerine kendi state'lerimiz geldi ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Arayüzle ilgili diğer hook'lar (tema, scroll vs.) olduğu gibi kalıyor
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // --- 2. DEĞİŞİKLİK: Kendi handleSubmit fonksiyonumuzu ekledik ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    const currentInput = input;
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }) // Sadece tek mesajı gönderiyoruz
      });

      if (!response.ok) {
        throw new Error('API isteği başarısız oldu');
      }

      const data = await response.json();
      const botMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Hata:", error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: "Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  const quickPrompts = [
    "Merhaba, nasılsın?",
    "Bugün hava nasıl?",
    "Bana bir şaka anlat",
    "Kod yazmama yardım et",
    "Yaratıcı bir hikaye yaz",
  ];

  // Arayüzün (JSX) geri kalanı neredeyse tamamen aynı, sadece birkaç küçük bağlantı düzeltildi.
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950 dark:to-violet-950 transition-all duration-500">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-pink-300/20 dark:bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <header className="relative border-b bg-white/80 backdrop-blur-xl dark:bg-gray-900/80 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Brain className="w-7 h-7 text-white animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-gray-900 animate-bounce" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  NPC-AI Chatbot
                </h1>
                <p className="text-sm text-muted-foreground">
                  Yapay Zeka Destekli E-Ticaret Asistanı
                </p>
        
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-all duration-300">
              {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-purple-600" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-4 py-8 max-w-5xl">
      {/* Hatalı olan tüm blok yerine bu düzeltilmiş bloğu yapıştırın */}
        {messages.length === 0 && !isLoading && (
          <Card className="mb-8 p-8 text-center bg-gradient-to-br from-white/90 to-purple-50/90 dark:from-gray-900/90 dark:to-purple-950/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
                  <Stars className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Merhaba! 🚀
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg leading-relaxed">
              Gemini AI ile güçlendirilmiş akıllı  e- ticaret asistanınızım! Size nasıl yardımcı olabilirim?
            </p>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(prompt)}
                  className="rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-purple-100 dark:hover:bg-purple-900 transition-all duration-300 hover:scale-105 border-purple-200 dark:border-purple-800"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {prompt}
                </Button>
              ))}
            </div>

            {/* v0'daki eksik kalan ve geri eklenen Badge'ler */}
            <div className="flex justify-center gap-4">
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900"
              >
                <Brain className="w-4 h-4 mr-2" />
                Yapay Zeka
              </Badge>
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900"
              >
                <Zap className="w-4 h-4 mr-2" />
                Hızlı Yanıt
              </Badge>
            </div>
          </Card>
        )}

        <Card className="mb-8 shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
          <ScrollArea className="h-[600px] p-6" ref={scrollAreaRef}>
            <div className="space-y-8">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar className={`w-12 h-12 shadow-lg ${message.role === "user" ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"}`}>
                    <AvatarFallback className="text-white">
                      {message.role === "user" ? <User className="w-6 h-6" /> : <Brain className="w-6 h-6" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 max-w-[75%]`}>
                    <div className={`inline-block p-5 rounded-3xl shadow-lg ${message.role === "user" ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-br-lg" : "bg-white dark:bg-gray-800 border-purple-100 dark:border-purple-900 rounded-bl-lg"}`}>
                      <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <Avatar className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 shadow-lg">
                    <AvatarFallback className="text-white"><Brain className="w-6 h-6" /></AvatarFallback>
                  </Avatar>
                  <div className="inline-block p-5 rounded-3xl rounded-bl-lg bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-900 shadow-lg">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        <Card className="p-6 shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Mesajınızı yazın..."
                className="rounded-2xl flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()} className="rounded-2xl">
                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}