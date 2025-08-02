// File: components/product-card.tsx
// Bu YENİ dosya, ürün bilgilerini göstermek için kullanılır.
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from './ui/button';

// Ürün ve teklif tiplerini tanımla
interface Offer {
  seller_name?: string;
  price?: number;
  stock_status?: string;
  offer_url?: string;
}

interface Product {
  product_name?: string;
  product_url?: string;
  features?: string;
  subcategory?: string;
  offers_json?: string;
}

export function ProductCard({ product }: { product: Product }) {
  // offers_json string'ini parse et
  let offers: Offer[] = [];
  try {
    if (product.offers_json) {
      offers = JSON.parse(product.offers_json);
    }
  } catch (error) {
    console.error("Teklifler parse edilirken hata oluştu:", error);
  }

  return (
    <Card className="mt-4 bg-secondary">
      <CardHeader>
        <CardTitle>{product.product_name || 'Ürün Adı Bulunamadı'}</CardTitle>
        {product.subcategory && <Badge variant="outline">{product.subcategory}</Badge>}
      </CardHeader>
      <CardContent>
        {product.features && product.features !== 'N/A' && (
            <div className="mb-4">
                <h4 className="font-semibold mb-2">Özellikler:</h4>
                <p className="text-sm text-muted-foreground">{product.features}</p>
            </div>
        )}

        <div>
            <h4 className="font-semibold mb-2">Satıcılar:</h4>
            {offers.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Satıcı</TableHead>
                        <TableHead>Fiyat</TableHead>
                        <TableHead>Stok Durumu</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {offers.map((offer, index) => (
                        <TableRow key={index}>
                            <TableCell>{offer.seller_name || 'N/A'}</TableCell>
                            <TableCell>{offer.price ? `${offer.price} TL` : 'N/A'}</TableCell>
                            <TableCell>
                                <Badge variant={offer.stock_status === 'Stokta' ? 'default' : 'destructive'}>
                                    {offer.stock_status || 'N/A'}
                                </Badge>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-sm text-muted-foreground">Bu ürün için satıcı bilgisi bulunamadı.</p>
            )}
        </div>
        {product.product_url && (
            <Button asChild className="mt-4">
                <a href={product.product_url} target="_blank" rel="noopener noreferrer">
                    Ürünü İncele
                </a>
            </Button>
        )}
      </CardContent>
    </Card>
  );
}
