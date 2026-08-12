import { logger } from '../utils/logger.js';

export interface AIAnalysisRequest {
  product_name: str;
  category?: string;
  user_price: number;
  rating?: number;
  total_reviews?: number;
  total_sold?: number;
  discount_percent?: number;
  is_official_store?: boolean;
  location?: string;
  competitor_prices: number[];
}

export interface AIAnalysisResult {
  product_name: string;
  category: string;
  harga_toko_kamu: number;
  harga_rata_rata_pasar: number;
  rentang_harga_wajar: {
    min: number;
    max: number;
  };
  confidence_percent: number;
  status: 'Murah' | 'Wajar' | 'Mahal';
  rekomendasi: string;
  faktor_yang_mempengaruhi: Record<string, number>;
}

export class AIClientService {
  private baseUrl: string;

  constructor(baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8005') {
    this.baseUrl = baseUrl;
  }

  async predictRecommendation(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    try {
      logger.info({ baseUrl: this.baseUrl, productName: request.product_name }, 'Calling AI Microservice predict endpoint');

      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: request.product_name,
          category: request.category || 'General',
          user_price: request.user_price,
          rating: request.rating || 4.8,
          total_reviews: request.total_reviews || 10,
          total_sold: request.total_sold || 50,
          discount_percent: request.discount_percent || 0,
          is_official_store: request.is_official_store || false,
          location: request.location || 'Jakarta',
          competitor_prices: request.competitor_prices.length > 0 ? request.competitor_prices : [request.user_price],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`AI service returned HTTP ${response.status}: ${errText}`);
      }

      const json = await response.json() as { success: boolean; data: AIAnalysisResult };
      if (!json.success || !json.data) {
        throw new Error('AI service response invalid structure');
      }

      return json.data;
    } catch (error) {
      logger.error({ error, request }, 'Failed to call AI microservice, using fallback rule-based analysis');
      return this.generateFallbackRecommendation(request);
    }
  }

  private generateFallbackRecommendation(req: AIAnalysisRequest): AIAnalysisResult {
    const prices = req.competitor_prices.length > 0 ? req.competitor_prices : [req.user_price];
    const meanPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const lower = Math.round(meanPrice * 0.9);
    const upper = Math.round(meanPrice * 1.1);

    let status: 'Murah' | 'Wajar' | 'Mahal' = 'Wajar';
    let rekomendasi = `Harga kamu (Rp ${req.user_price.toLocaleString('id-ID')}) berada dalam kisaran rata-rata pasar (Rp ${Math.round(meanPrice).toLocaleString('id-ID')}).`;

    if (req.user_price < lower) {
      status = 'Murah';
      rekomendasi = `Harga kamu (Rp ${req.user_price.toLocaleString('id-ID')}) berada di bawah rata-rata pasar. Kamu dapat sedikit menaikkan harga untuk meningkatkan profit margin.`;
    } else if (req.user_price > upper) {
      status = 'Mahal';
      rekomendasi = `Harga kamu (Rp ${req.user_price.toLocaleString('id-ID')}) di atas rata-rata pasar. Pertimbangkan diskon atau penyesuaian harga ke kisaran Rp ${lower.toLocaleString('id-ID')} - Rp ${upper.toLocaleString('id-ID')}.`;
    }

    return {
      product_name: req.product_name,
      category: req.category || 'General',
      harga_toko_kamu: req.user_price,
      harga_rata_rata_pasar: Math.round(meanPrice),
      rentang_harga_wajar: { min: lower, max: upper },
      confidence_percent: 75.0,
      status,
      rekomendasi,
      faktor_yang_mempengaruhi: {
        'Harga kompetitor': 50.0,
        'Rating & ulasan': 25.0,
        'Tren penjualan': 15.0,
        'Lainnya': 10.0,
      },
    };
  }
}

export const aiClient = new AIClientService();
