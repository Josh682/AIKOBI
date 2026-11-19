import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeProductTitle,
  extractProductAttributes,
  checkAttributeCompatibility,
  embedProductTitle,
  cosineSimilarity,
  computeSemanticSimilarity,
  classifyProductCategory,
  ML_OHE_CATEGORIES,
  filterPriceOutliersMAD,
  matchAndFilterCompetitors,
  EMBEDDING_DIM,
} from '../src/index.js';

describe('@aikobi/product-matcher', () => {
  describe('Title Normalizer', () => {
    it('strips Indonesian marketplace promo noise and decorative symbols', () => {
      const res = normalizeProductTitle(
        '【PROMO TERMURAH COD】 ★ Kaos Kaki Olahraga Bayar di Tempat Gratis Ongkir 100% Original 🔥',
      );
      assert.equal(res.cleanCoreTitle, 'kaos kaki olahraga');
    });

    it('normalizes Indonesian number words and dozen/pair idioms', () => {
      assert.match(normalizeProductTitle('Kaos Kaki Tiga Pasang').normalizedText, /3 pasang/);
      assert.match(normalizeProductTitle('Paket Lima Kaos Polos').normalizedText, /paket 5 kaos/);
      assert.match(normalizeProductTitle('Kaos Kaki Selusin Murah').normalizedText, /12 pcs/);
      assert.match(normalizeProductTitle('Kaos Kaki Setengah Lusin').normalizedText, /6 pcs/);
      assert.match(normalizeProductTitle('Kaos Kaki Sepasang Tebal').normalizedText, /1 pasang/);
      assert.match(normalizeProductTitle('Kauskaki Sport Dua Belas Pcs').normalizedText, /kaos kaki sport 12 pcs/);
    });

    it('unifies common Indonesian/English spelling variants', () => {
      const res = normalizeProductTitle('Kauskaki Running Sneaker Arabica T-Shirt Handphone');
      assert.ok(res.normalizedText.includes('kaos kaki'));
      assert.ok(res.normalizedText.includes('sneakers'));
      assert.ok(res.normalizedText.includes('arabika'));
      assert.ok(res.normalizedText.includes('kaos'));
      assert.ok(res.normalizedText.includes('hp'));
    });
  });

  describe('Structured Attribute Extraction', () => {
    it('extracts pack quantities across Indonesian phrasing variants', () => {
      assert.equal(extractProductAttributes('Kaos Kaki Olahraga 3 Pasang').packQuantity, 3);
      assert.equal(extractProductAttributes('Kaos Kaki Sport Isi 3 Psg').packQuantity, 3);
      assert.equal(extractProductAttributes('Kaos Kaki Tiga Pasang Tebal').packQuantity, 3);
      assert.equal(extractProductAttributes('Paket 5 Kaos Polos Combed 30s').packQuantity, 5);
      assert.equal(extractProductAttributes('Kaos Kaki Sport Lusinan 12 Pcs').packQuantity, 12);
      assert.equal(extractProductAttributes('Kaos Kaki Setengah Lusin').packQuantity, 6);
      assert.equal(extractProductAttributes('Set 6 Gelas Kopi Kaca').packQuantity, 6);
      assert.equal(extractProductAttributes('Alat Seduh Kopi 3-in-1').packQuantity, 3);
      assert.equal(extractProductAttributes('Kaos Kaki Olahraga 1 Pasang').packQuantity, 1);
      assert.equal(extractProductAttributes('Sepatu Sneakers Running Pria').packQuantity, 1);
    });

    it('normalizes weights, multiplied packs, volumes, storage, and power', () => {
      const coffee250 = extractProductAttributes('Kopi Arabika Gayo 250gr');
      assert.equal(coffee250.netWeightGrams, 250);
      assert.equal(coffee250.packQuantity, 1);

      const coffee1kg = extractProductAttributes('Biji Kopi Arabika Gayo 1Kg');
      assert.equal(coffee1kg.netWeightGrams, 1000);

      const coffeeMult = extractProductAttributes('Kopi Arabika Gayo 250gr x 2');
      assert.equal(coffeeMult.packQuantity, 2);
      assert.equal(coffeeMult.netWeightGrams, 500);
      assert.equal(coffeeMult.unitWeightGrams, 250);

      const soap500 = extractProductAttributes('Sabun Cuci Tangan 500ml');
      assert.equal(soap500.netVolumeMl, 500);

      const soap1l = extractProductAttributes('Sabun Cuci Tangan 1 Liter');
      assert.equal(soap1l.netVolumeMl, 1000);

      const soap15l = extractProductAttributes('Minyak Goreng 1,5 L');
      assert.equal(soap15l.netVolumeMl, 1500);

      const phone128 = extractProductAttributes('Samsung Galaxy A54 8/128GB');
      assert.equal(phone128.storageGb, 128);

      const phone256 = extractProductAttributes('Samsung Galaxy A54 8GB 256GB');
      assert.equal(phone256.storageGb, 256);

      const ssd1tb = extractProductAttributes('SSD NVMe 1TB PCIe');
      assert.equal(ssd1tb.storageGb, 1024);

      const mixer = extractProductAttributes('Hand Mixer Philips 350W');
      assert.equal(mixer.powerWatt, 350);
    });

    it('distinguishes main units from accessories/refills even when bonus accessories are included', () => {
      const dripper = extractProductAttributes('Hario V60 Ceramic Coffee Dripper 02');
      assert.equal(dripper.isAccessoryOrRefill, false);
      assert.ok(dripper.modelCodes.includes('v60'));
      assert.ok(dripper.modelCodes.includes('02'));

      const dripperBonus = extractProductAttributes('Dripper Kopi V60 Keramik 02 Bonus Kertas Filter 40 Lembar');
      assert.equal(dripperBonus.isAccessoryOrRefill, false);
      assert.equal(dripperBonus.packQuantity, 1);

      const paperFilter = extractProductAttributes('Kertas Filter Kopi V60 Isi 100 Lembar');
      assert.equal(paperFilter.isAccessoryOrRefill, true);
      assert.equal(paperFilter.accessoryType, 'paper_filter');
      assert.equal(paperFilter.packQuantity, 100);

      const phoneCase = extractProductAttributes('Casing Silikon HP Samsung A54');
      assert.equal(phoneCase.isAccessoryOrRefill, true);
      assert.equal(phoneCase.accessoryType, 'case');

      const refillSoap = extractProductAttributes('Refill Sabun Mandi Cair 450ml');
      assert.equal(refillSoap.isAccessoryOrRefill, true);
      assert.equal(refillSoap.accessoryType, 'refill');
    });

    it('builds high-precision search queries preserving brand, core noun, and key spec', () => {
      const q1 = extractProductAttributes('[PROMO COD] Biji Kopi Arabika Aceh Gayo 250gr Roasted').searchQuery;
      assert.ok(q1.includes('kopi'));
      assert.ok(q1.includes('arabika'));
      assert.ok(q1.includes('gayo'));
      assert.ok(q1.includes('250gr'));

      const q2 = extractProductAttributes('Hario V60 Ceramic Coffee Dripper 02').searchQuery;
      assert.ok(q2.includes('hario'));
      assert.ok(q2.includes('v60'));
      assert.ok(q2.includes('dripper'));
      assert.ok(q2.includes('02'));
    });
  });

  describe('Golden Pairwise Compatibility & Semantic Matching (50+ Indonesian Marketplace Cases)', () => {
    const goldenCases: Array<{
      label: string;
      target: string;
      candidate: string;
      expectedMatch: boolean;
      expectedRejectReason?: string;
    }> = [
      // Multi-pack & Indonesian number word pairs
      {
        label: '3 Pasang vs Isi 3 Psg',
        target: 'Kaos Kaki Olahraga 3 Pasang',
        candidate: 'Kaos Kaki Sport Isi 3 Psg',
        expectedMatch: true,
      },
      {
        label: '3 Pasang vs Tiga Pasang',
        target: 'Kaos Kaki Olahraga 3 Pasang',
        candidate: 'Kaos Kaki Olahraga Tiga Pasang Tebal',
        expectedMatch: true,
      },
      {
        label: '3 Pasang vs 1 Pasang (REJECT)',
        target: 'Kaos Kaki Olahraga 3 Pasang',
        candidate: 'Kaos Kaki Olahraga 1 Pasang',
        expectedMatch: false,
        expectedRejectReason: 'pack_quantity_mismatch',
      },
      {
        label: '3 Pasang vs Lusinan 12 Pcs (REJECT)',
        target: 'Kaos Kaki Olahraga 3 Pasang',
        candidate: 'Kaos Kaki Sport Lusinan 12 Pcs',
        expectedMatch: false,
        expectedRejectReason: 'pack_quantity_mismatch',
      },
      {
        label: '1 Pasang vs 3 Pasang (REJECT)',
        target: 'Kaos Kaki Olahraga 1 Pasang',
        candidate: 'Kaos Kaki Sport Isi 3 Pasang',
        expectedMatch: false,
        expectedRejectReason: 'pack_quantity_mismatch',
      },
      {
        label: '12 Pcs vs Selusin',
        target: 'Kaos Kaki Sport 12 Pcs',
        candidate: 'Kaos Kaki Olahraga Selusin Murah',
        expectedMatch: true,
      },
      {
        label: 'Paket 5 Kaos vs Paket Lima Kaos',
        target: 'Paket 5 Kaos Polos Katun',
        candidate: 'Paket Lima Kaos Polos Cotton',
        expectedMatch: true,
      },
      {
        label: 'Paket 5 Kaos vs Single Kaos (REJECT)',
        target: 'Paket 5 Kaos Polos Katun',
        candidate: 'Kaos Polos Katun Combed 30s',
        expectedMatch: false,
        expectedRejectReason: 'pack_quantity_mismatch',
      },

      // Weight, volume, multiplied packs, and storage
      {
        label: 'Kopi 250gr vs 250 Gram',
        target: 'Kopi Arabika Gayo 250gr',
        candidate: 'Biji Kopi Arabika Aceh Gayo 250 Gram',
        expectedMatch: true,
      },
      {
        label: 'Kopi 250gr vs 1Kg (REJECT)',
        target: 'Kopi Arabika Gayo 250gr',
        candidate: 'Kopi Arabika Gayo 1Kg',
        expectedMatch: false,
        expectedRejectReason: 'weight_mismatch',
      },
      {
        label: 'Kopi 250gr vs 500gr (REJECT)',
        target: 'Kopi Arabika Gayo 250gr',
        candidate: 'Biji Kopi Arabika Gayo 500gr',
        expectedMatch: false,
        expectedRejectReason: 'weight_mismatch',
      },
      {
        label: 'Kopi 250gr x 2 vs Paket 2x250gr',
        target: 'Kopi Arabika Gayo 250gr x 2',
        candidate: 'Biji Kopi Arabika Gayo 2 x 250gr',
        expectedMatch: true,
      },
      {
        label: 'Kopi 250gr x 2 vs Single 250gr (REJECT)',
        target: 'Kopi Arabika Gayo 250gr x 2',
        candidate: 'Kopi Arabika Gayo 250gr',
        expectedMatch: false,
        expectedRejectReason: 'pack_quantity_mismatch',
      },
      {
        label: 'Sabun 500ml vs 1 Liter (REJECT)',
        target: 'Sabun Cuci Tangan Lifebuoy 500ml',
        candidate: 'Sabun Cuci Tangan Lifebuoy 1 Liter',
        expectedMatch: false,
        expectedRejectReason: 'volume_mismatch',
      },
      {
        label: 'Sabun 1 Liter vs 1000ml',
        target: 'Sabun Cuci Tangan Lifebuoy 1 Liter',
        candidate: 'Sabun Cuci Tangan Lifebuoy 1000ml',
        expectedMatch: true,
      },
      {
        label: 'Samsung A54 128GB vs 256GB (REJECT)',
        target: 'Samsung Galaxy A54 5G 8/128GB',
        candidate: 'Samsung Galaxy A54 5G 8/256GB',
        expectedMatch: false,
        expectedRejectReason: 'storage_mismatch',
      },
      {
        label: 'Samsung A54 256GB vs 256GB',
        target: 'Samsung Galaxy A54 5G 8/256GB',
        candidate: 'HP Samsung Galaxy A54 8GB 256GB Resmi',
        expectedMatch: true,
      },

      // Main unit vs accessory/refill
      {
        label: 'Hario V60 Dripper 02 vs Dripper Keramik Size 02',
        target: 'Hario V60 Ceramic Coffee Dripper 02',
        candidate: 'Dripper Kopi V60 Keramik Size 02',
        expectedMatch: true,
      },
      {
        label: 'Hario V60 Dripper 02 vs Kertas Filter V60 (REJECT)',
        target: 'Hario V60 Ceramic Coffee Dripper 02',
        candidate: 'Kertas Filter Kopi V60 Isi 100 Lembar',
        expectedMatch: false,
        expectedRejectReason: 'accessory_vs_main_unit_mismatch',
      },
      {
        label: 'Hario V60 Dripper 02 vs V60 Dripper 01 (REJECT)',
        target: 'Hario V60 Ceramic Coffee Dripper 02',
        candidate: 'Hario V60 Ceramic Coffee Dripper 01',
        expectedMatch: false,
        expectedRejectReason: 'model_code_conflict',
      },
      {
        label: 'Hario V60 Dripper 02 vs Dripper 02 Bonus Filter',
        target: 'Hario V60 Ceramic Coffee Dripper 02',
        candidate: 'Dripper Kopi V60 Keramik 02 Bonus Kertas Filter',
        expectedMatch: true,
      },
      {
        label: 'Samsung A54 vs Casing Samsung A54 (REJECT)',
        target: 'Samsung Galaxy A54 5G 8/256GB',
        candidate: 'Casing Silikon Softcase Samsung Galaxy A54',
        expectedMatch: false,
        expectedRejectReason: 'accessory_vs_main_unit_mismatch',
      },
      {
        label: 'Samsung A54 vs Tempered Glass Samsung A54 (REJECT)',
        target: 'Samsung Galaxy A54 5G 8/256GB',
        candidate: 'Tempered Glass Anti Gores Samsung A54',
        expectedMatch: false,
        expectedRejectReason: 'accessory_vs_main_unit_mismatch',
      },
      {
        label: 'iPhone 15 Pro Max vs iPhone 15 Pro (REJECT)',
        target: 'Apple iPhone 15 Pro Max 256GB',
        candidate: 'Apple iPhone 15 Pro 256GB',
        expectedMatch: false,
        expectedRejectReason: 'model_code_conflict',
      },
      {
        label: 'iPhone 15 Pro Max vs iPhone 15 Regular (REJECT)',
        target: 'Apple iPhone 15 Pro Max 256GB',
        candidate: 'Apple iPhone 15 256GB Resmi',
        expectedMatch: false,
        expectedRejectReason: 'model_code_conflict',
      },

      // Fabric GSM & Model Code conflicts
      {
        label: 'Kaos Combed 30s vs Combed 24s (REJECT)',
        target: 'Kaos Polos Katun Combed 30s',
        candidate: 'Kaos Polos Katun Combed 24s',
        expectedMatch: false,
        expectedRejectReason: 'model_code_conflict',
      },
      {
        label: 'Kaos Combed 30s vs Combed 30s Promo',
        target: 'Kaos Polos Katun Combed 30s',
        candidate: '[PROMO COD] Baju Kaos Polos Cotton Combed 30s',
        expectedMatch: true,
      },

      // Cross-category / Disjoint product noun semantic rejection
      {
        label: 'Kaos Kaki Sport vs Sepatu Sport (REJECT semantic)',
        target: 'Kaos Kaki Olahraga Sport',
        candidate: 'Sepatu Sneakers Olahraga Sport',
        expectedMatch: false,
      },
      {
        label: 'Kopi Arabika Gayo vs Hario V60 Dripper (REJECT semantic)',
        target: 'Kopi Arabika Gayo 250gr',
        candidate: 'Hario V60 Ceramic Coffee Dripper 02',
        expectedMatch: false,
      },
      {
        label: 'Milk Frother vs Blender Dapur (REJECT semantic)',
        target: 'Electric Milk Frother Pengocok Susu Kopi',
        candidate: 'Blender Chopper Daging Listrik',
        expectedMatch: false,
      },
      {
        label: 'Serum Niacinamide vs Sunscreen SPF 50 (REJECT semantic)',
        target: 'Serum Wajah Niacinamide 10% Brightening',
        candidate: 'Sunscreen Tabir Surya SPF 50 PA++++',
        expectedMatch: false,
      },
      {
        label: 'Kemeja Batik Pria vs Celana Chino Pria (REJECT semantic)',
        target: 'Kemeja Batik Lengan Panjang Pria',
        candidate: 'Celana Panjang Chino Pria Slimfit',
        expectedMatch: false,
      },
      {
        label: 'Tongsis Bluetooth Tripod vs Earphone TWS (REJECT semantic)',
        target: 'Tongsis Tripod Selfie Stick Bluetooth',
        candidate: 'Earphone TWS Bluetooth Wireless Bass',
        expectedMatch: false,
      },

      // Positive cross-lingual & typo variants
      {
        label: 'Milk Frother vs Pengocok Susu Frother',
        target: 'Electric Milk Frother Pembuih Susu Kopi',
        candidate: 'Frother Pengocok Susu Kopi Elektrik',
        expectedMatch: true,
      },
      {
        label: 'Kaos Kaki Typo Kauskaki',
        target: 'Kaos Kaki Olahraga Panjang',
        candidate: 'Kauskaki Sport Panjang Tebal',
        expectedMatch: true,
      },
      {
        label: 'Sepatu Running vs Running Sneakers',
        target: 'Sepatu Lari Running Pria',
        candidate: 'Running Sneakers Olahraga Pria',
        expectedMatch: true,
      },
      {
        label: 'Sunscreen vs Tabir Surya SPF 50',
        target: 'Sunscreen Wajah SPF 50',
        candidate: 'Tabir Surya Sunscreen SPF 50 Gel',
        expectedMatch: true,
      },
      {
        label: 'Powerbank 10000mAh Match',
        target: 'Powerbank Anker 10000mAh Fast Charging',
        candidate: 'Anker Power Bank 10000mAh USB C',
        expectedMatch: true,
      },
      {
        label: 'Powerbank vs Wall Charger (REJECT semantic)',
        target: 'Powerbank Anker 10000mAh Fast Charging',
        candidate: 'Charger Adaptor Anker 20W Fast Charging',
        expectedMatch: false,
      },
      {
        label: 'Refill Sabun vs Main Bottle Sabun (REJECT accessory)',
        target: 'Refill Sabun Cuci Tangan 450ml',
        candidate: 'Sabun Cuci Tangan Botol Pump 450ml',
        expectedMatch: false,
        expectedRejectReason: 'accessory_vs_main_unit_mismatch',
      },
      {
        label: 'Refill Sabun vs Isi Ulang Sabun',
        target: 'Refill Sabun Mandi Cair 450ml',
        candidate: 'Isi Ulang Refill Sabun Mandi 450ml',
        expectedMatch: true,
      },
      {
        label: 'Kabel Data vs Charger (REJECT accessory)',
        target: 'Kabel Data USB Type C Fast Charging 1M',
        candidate: 'Adapter Charger Kepala Casan 20W',
        expectedMatch: false,
        expectedRejectReason: 'accessory_vs_main_unit_mismatch',
      },
      {
        label: 'Hand Mixer 350W Match',
        target: 'Hand Mixer Philips 350W',
        candidate: 'Mixer Pengocok Kue Philips 350 Watt',
        expectedMatch: true,
      },
      {
        label: 'Hand Mixer vs Blender (REJECT semantic)',
        target: 'Hand Mixer Philips 350W',
        candidate: 'Blender Philips 350W',
        expectedMatch: false,
      },
      {
        label: 'Keripik Pisang 200gr Match',
        target: 'Keripik Pisang Coklat 200gr',
        candidate: 'Kripik Pisang Rasa Coklat 200 Gram',
        expectedMatch: true,
      },
      {
        label: 'Keripik Pisang 200gr vs 500gr (REJECT)',
        target: 'Keripik Pisang Coklat 200gr',
        candidate: 'Keripik Pisang Coklat 500gr',
        expectedMatch: false,
        expectedRejectReason: 'weight_mismatch',
      },
      {
        label: 'Madu Hutan 500ml Match',
        target: 'Madu Hutan Murni 500ml',
        candidate: 'Madu Asli Hutan Murni 500 ml',
        expectedMatch: true,
      },
      {
        label: 'Madu Hutan 500ml vs 250ml (REJECT)',
        target: 'Madu Hutan Murni 500ml',
        candidate: 'Madu Hutan Murni 250ml',
        expectedMatch: false,
        expectedRejectReason: 'volume_mismatch',
      },
      {
        label: 'Tas Ransel Laptop vs Backpack',
        target: 'Tas Ransel Laptop Pria',
        candidate: 'Backpack Tas Laptop Kerja Pria',
        expectedMatch: true,
      },
      {
        label: 'Tas Ransel vs Dompet (REJECT semantic)',
        target: 'Tas Ransel Laptop Pria',
        candidate: 'Dompet Kulit Pria Lipat',
        expectedMatch: false,
      },
      {
        label: 'Kerajinan Anyaman Rotan Match',
        target: 'Keranjang Anyaman Rotan Handmade',
        candidate: 'Kerajinan Keranjang Anyaman Rotan Bambu',
        expectedMatch: true,
      },
      {
        label: 'Serum Niacinamide 30ml Match',
        target: 'Serum Wajah Niacinamide 10% 30ml',
        candidate: 'Serum Niacinamide 10% Brightening 30 ml',
        expectedMatch: true,
      },
      {
        label: 'Jaket Hoodie Fleece Match',
        target: 'Jaket Hoodie Fleece Tebal',
        candidate: 'Hoodie Sweater Katun Fleece',
        expectedMatch: true,
      },
    ];

    it(`evaluates all ${goldenCases.length} golden pairs accurately`, () => {
      for (const tc of goldenCases) {
        const targetAttrs = extractProductAttributes(tc.target);
        const candAttrs = extractProductAttributes(tc.candidate);
        const compat = checkAttributeCompatibility(targetAttrs, candAttrs);
        const sim = computeSemanticSimilarity(tc.target, tc.candidate);
        const matched = compat.compatible && sim >= 0.68;

        if (tc.expectedMatch) {
          assert.equal(
            matched,
            true,
            `Expected MATCH for "${tc.label}" ("${tc.target}" vs "${tc.candidate}"), got compat=${compat.compatible} (${compat.reason}), sim=${sim}`,
          );
        } else {
          assert.equal(
            matched,
            false,
            `Expected REJECT for "${tc.label}" ("${tc.target}" vs "${tc.candidate}"), got compat=${compat.compatible}, sim=${sim}`,
          );
          if (tc.expectedRejectReason) {
            assert.equal(
              compat.reason,
              tc.expectedRejectReason,
              `Expected reject reason ${tc.expectedRejectReason} for "${tc.label}", got ${compat.reason}`,
            );
          }
        }
      }
    });
  });

  describe('Embedding Vector Properties', () => {
    it('produces 384-dim L2-normalized vectors', () => {
      const vec = embedProductTitle('Hario V60 Ceramic Coffee Dripper 02');
      assert.equal(vec.length, EMBEDDING_DIM);
      const norm = Math.sqrt(vec.reduce((acc, v) => acc + v * v, 0));
      assert.ok(Math.abs(norm - 1) < 1e-6, `Expected unit norm, got ${norm}`);
      assert.equal(cosineSimilarity(vec, vec) > 0.9999, true);
    });
  });

  describe('Non-Circular MAD Outlier Filtering & End-to-End Matching', () => {
    it('retains valid Rp 45k-55k competitors even when user basePrice is 4x overpriced (Rp 200.000)', () => {
      const targetTitle = 'Kaos Kaki Olahraga 3 Pasang';
      const rawProducts = [
        { id: '1', name: 'Kaos Kaki Sport Isi 3 Psg', priceInt: 45000, shop: { name: 'Toko A', city: 'Jakarta' } },
        { id: '2', name: 'Kaos Kaki Olahraga Tiga Pasang', priceInt: 48000, shop: { name: 'Toko B', city: 'Bandung' } },
        { id: '3', name: 'Kaos Kaki Sport 3 Pasang Tebal', priceInt: 50000, shop: { name: 'Toko C', city: 'Tangerang' } },
        { id: '4', name: 'Kauskaki Olahraga Isi 3 Pasang', priceInt: 52000, shop: { name: 'Toko D', city: 'Jakarta' } },
        { id: '5', name: 'Kaos Kaki Running 3 Pasang', priceInt: 55000, shop: { name: 'Toko E', city: 'Surabaya' } },
        // Market junk / price outliers that passed title matching
        { id: '6', name: 'Kaos Kaki Olahraga 3 Pasang Promo', priceInt: 5000, shop: { name: 'Spam Murah', city: 'Jakarta' } },
        { id: '7', name: 'Kaos Kaki Olahraga 3 Pasang Limited', priceInt: 600000, shop: { name: 'Spam Mahal', city: 'Jakarta' } },
        // Attribute mismatches that should be rejected by hard gate
        { id: '8', name: 'Kaos Kaki Olahraga 1 Pasang', priceInt: 18000, shop: { name: 'Eceran', city: 'Jakarta' } },
        { id: '9', name: 'Kaos Kaki Sport Lusinan 12 Pcs', priceInt: 160000, shop: { name: 'Grosir', city: 'Jakarta' } },
      ];

      const matched = matchAndFilterCompetitors(targetTitle, rawProducts, {
        basePrice: 200000, // 4x overpriced compared to real market!
      });

      const prices = matched.map((m) => m.harga).sort((a, b) => a - b);
      assert.deepEqual(prices, [45000, 48000, 50000, 52000, 55000]);
      assert.ok(matched.every((m) => m.similarityScore >= 0.68));
    });

    it('rejects cheap V60 paper filters from V60 dripper pricing pool', () => {
      const targetTitle = 'Hario V60 Ceramic Coffee Dripper 02';
      const rawProducts = [
        { name: 'Dripper Kopi V60 Keramik Size 02', priceInt: 85000 },
        { name: 'Hario V60 Ceramic Dripper 02 White', priceInt: 245000 },
        { name: 'V60 Dripper Keramik 02 Pour Over', priceInt: 110000 },
        { name: 'V60 Coffee Dripper Ceramic 02 Bonus Kertas Filter', priceInt: 125000 },
        // Should all be rejected by accessory/size gates
        { name: 'Kertas Filter Kopi V60 Isi 100 Lembar', priceInt: 18000 },
        { name: 'Hario V60 Ceramic Coffee Dripper 01', priceInt: 195000 },
      ];

      const matched = matchAndFilterCompetitors(targetTitle, rawProducts, { basePrice: 120000 });
      assert.equal(matched.length, 4);
      assert.ok(!matched.some((m) => m.nama.includes('Kertas Filter Kopi V60 Isi 100')));
      assert.ok(!matched.some((m) => m.nama.includes('Dripper 01')));
    });

    it('filters log-price MAD outliers directly without circular anchoring', () => {
      const items = [
        { price: 1000 },
        { price: 46000 },
        { price: 49000 },
        { price: 50000 },
        { price: 51000 },
        { price: 54000 },
        { price: 500000 },
      ];
      const clean = filterPriceOutliersMAD(items);
      assert.deepEqual(
        clean.map((i) => i.price),
        [46000, 49000, 50000, 51000, 54000],
      );
    });
  });

  describe('Nearest-Centroid Category Classifier', () => {
    it('maps products across all 5 official ML OHE categories', () => {
      const categoryTests: Array<{ title: string; expectedModelCategory: (typeof ML_OHE_CATEGORIES)[number] }> = [
        { title: 'Samsung Galaxy A54 5G 8/256GB Garansi Resmi', expectedModelCategory: 'Elektronik' },
        { title: 'Electric Milk Frother Hand Mixer Pengocok Kopi', expectedModelCategory: 'Elektronik' },
        { title: 'Tongsis Tripod Bluetooth Selfie Stick', expectedModelCategory: 'Elektronik' },
        { title: 'Kaos Kaki Olahraga 3 Pasang Katun Tebal', expectedModelCategory: 'Fashion' },
        { title: 'Sepatu Sneakers Lari Running Pria', expectedModelCategory: 'Fashion' },
        { title: 'Kemeja Batik Lengan Panjang Pria', expectedModelCategory: 'Fashion' },
        { title: 'Serum Wajah Niacinamide 10% Skincare', expectedModelCategory: 'Kecantikan' },
        { title: 'Sunscreen Tabir Surya SPF 50 Gel', expectedModelCategory: 'Kecantikan' },
        { title: 'Hario V60 Ceramic Coffee Dripper 02', expectedModelCategory: 'Kerajinan' },
        { title: 'Kerajinan Anyaman Rotan Keranjang Handmade', expectedModelCategory: 'Kerajinan' },
        { title: 'Biji Kopi Arabika Aceh Gayo 250gr', expectedModelCategory: 'Makanan' },
        { title: 'Keripik Pisang Coklat Renyah 200gr', expectedModelCategory: 'Makanan' },
      ];

      for (const tc of categoryTests) {
        const res = classifyProductCategory(tc.title);
        assert.ok(
          ML_OHE_CATEGORIES.includes(res.modelCategory),
          `Invalid modelCategory "${res.modelCategory}" for "${tc.title}"`,
        );
        assert.equal(
          res.modelCategory,
          tc.expectedModelCategory,
          `Expected "${tc.expectedModelCategory}" for "${tc.title}", got "${res.modelCategory}" (${res.displayCategory})`,
        );
        assert.ok(res.displayCategory.length > 0);
        assert.ok(res.confidence >= 0.5 && res.confidence <= 1);
      }
    });
  });
});
