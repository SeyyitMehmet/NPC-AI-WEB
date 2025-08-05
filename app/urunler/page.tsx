"use client";

import { useState } from 'react';
import Link from 'next/link'; // Navigasyon için import
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Component, Search, Bot, LayoutGrid } from "lucide-react";

// Tarama yapılan tüm kategorilerin listesi
const categories = [
  "3D Yazıcı", "Aksiyon Kamera Aksesuarı", "Aksiyon Kamerası", "Anakart", "Ani Su Isıtıcı", "Ankastre Set", "Askı Aparatı", "Aspiratör", "Barkod Yazıcı", "Battery Grip", "Beyaz Eşya Seti", "Beyaz Eşya Yedek Parça", "Bilgisayar Kasası", "Boyler", "Bulaşık Makinesi", "Buzdolabı", "CD-DVD Kutusu", "CD-DVD Çantası", "CD/DVD Yazıcı", "DVI Dönüştürücü", "DVI Kablo", "Davlumbaz", "Derin Dondurucu", "Dijital Fotoğraf Çerçevesi", "Disket Sürücü", "DisplayPort Dönüştürücü", "DisplayPort Kablo", "Docking Station", "Dokunmatik Kalem", "Drone", "Drone Aksesuarı", "Drum", "Ekran Kartı", "Ekran Kartı Fanı", "Endüstriyel Dondurucu ve Soğutucu", "Endüstriyel Yıkama", "Eğitim Yazılımı", "Fan Kontrol", "Filament", "Film Tarayıcı", "Flaş", "Flaş Aksesuarı", "Flaş Tetikleyici", "Fotokapan", "Fotoğraf Kağıdı", "Fotoğraf Makinesi", "Fotoğraf Makinesi Askısı", "Fotoğraf Makinesi Bataryası", "Fotoğraf Makinesi Ekran Koruyucu", "Fotoğraf Makinesi Kumandası", "Fotoğraf Makinesi Kılıfı", "Fotoğraf Makinesi Çantası", "Fotoğraf Makinesi Şarj Cihazı", "Fotoğraf Yazıcısı", "Fırın", "Gimbal", "Gimbal Aksesuarı", "Güvenlik, Antivirüs Programları", "Güç Kablosu", "HDMI Dönüştürücü", "HDMI Kablo", "Hafıza Kartı", "Harddisk", "Harddisk Kılıfı", "Hava Perdesi", "Hava Soğutucu", "Havlupan", "Isı Pompası", "Isıtıcı", "Işık Ayağı", "Işık Sistemi", "Karanlık Oda Ekipmanı", "Kart Yazıcı", "Kartuş", "Kartuş Mürekkebi", "Kasa Aksesuarı", "Kasa Fanı", "Klavye Aksesuarı", "Klavye Temizleme Fırçası", "Klima", "Kurutma Makinesi", "Laptop Ekran Koruyucu", "Laptop Kilidi", "Laptop Kılıfı", "Laptop Sehpası", "Laptop Soğutucu", "Laptop Çantası", "Lazer Yazıcı", "Lens Adaptörü", "Lens Kılıfı", "Manuel Netleme Halkası", "Mikrodalga Fırın", "Molex Kablo", "Monitör Adaptörü", "Monitör Ekran Koruyucu", "Monitör Lambası", "Monitör Standı", "Monitör Yükseltici", "Monopod", "Monopod Aksesuarı", "Mouse Aksesuarı", "Mürekkep Püskürtmeli Yazıcı", "Nokta Vuruşlu Yazıcı", "Numerik Klavye", "Objektif", "Objektif Filtresi", "Objektif Kapağı", "Ocak", "Ofis Programı", "PCI Express Dönüştürücü", "Paraflaş", "Parasoley", "Power Supply", "Prompter", "RAM", "RAM Soğutucu", "Ribon", "Ring Light", "SATA Güç Kablosu", "SATA Kablo", "SSD", "SSD Soğutucu", "Ses Kartı", "Slider", "Softbox", "Su Sebili", "Tablet Araç Kiti", "Tablet Ekran Koruyucu", "Tablet Klavyesi", "Tablet Kılıfı", "Tablet Standı", "Temizlik Ürünleri", "Termal Macun", "Toner", "Toner Tozu", "Toner Çipi", "Transfer Baskı Makinesi", "Tripod", "Tripod Aksesuarı", "Type-C Dönüştürücü", "UPS Aküsü", "USB Dönüştürücü", "USB Uzatma Kablosu", "Uygulama Yazılımı", "VGA Dönüştürücü", "VGA Kablo", "Video Kamera", "Video Kamera Bataryası", "Video Kamera Kaseti", "Video Kamera Yağmurluğu", "Video Kamera Çantası", "Video Kamera Şarj Cihazı", "Video Sinema Ekipmanı", "Vizör Lastiği", "Yansıtıcı Reflektör", "Yazıcı Kablosu", "Yazıcı Yedek Parça", "Yazıcı Şeridi", "Yılan Kamera", "Çamaşır Makinesi", "Çekim Fonu", "Çizici", "Ürün Çekim Çadırı ve Masası", "İşlemci", "İşlemci Soğutucu", "İşletim Sistemi", "Şemsiye", "Şişe Soğutucu"
];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100 dark:from-gray-900 dark:via-indigo-950 dark:to-slate-900">
      
      {/* --- HEADER EKLENDİ --- */}
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Bot className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-semibold tracking-tight">NPC-AI SATIŞ ASİSTANI</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/">Sohbet</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/urunler">Ürünler</Link>
            </Button>
        </nav>

        <div className="flex items-center gap-2">
            {/* Küçük ekranlar için ürünler/sohbet linki */}
            <Button variant="outline" size="icon" className="md:hidden" asChild>
                <Link href="/">
                    {/* Bu ikon sohbet ikonuna değiştirilebilir veya aynı kalabilir */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </Link>
            </Button>
        </div>
      </header>

      {/* --- SAYFA İÇERİĞİ --- */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Taranan Ürün Kategorileri
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Asistanımız bu kategorilerdeki ürünler hakkında bilgi sahibidir.
            </p>
            </div>

            <div className="relative mb-8 max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Kategori ara..."
                className="w-full pl-10 py-6 rounded-full shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
            
            <p className="text-center text-sm text-muted-foreground mb-6">
                {filteredCategories.length} kategori bulundu.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredCategories.map((category) => (
                <div
                key={category}
                className="flex items-center gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:bg-muted/50 hover:-translate-y-1 cursor-default"
                >
                <Component className="h-5 w-5 text-primary shrink-0" />
                <p className="font-medium text-sm">{category}</p>
                </div>
            ))}
            </div>
        </div>
      </main>
    </div>
  );
}