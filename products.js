const express = require('express');
const axios = require('axios');
const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const auth = require('../middleware/auth');
const { getRedisClient } = require('../config/redis');
const { scrapePrice } = require('../utils/scraper');

const router = express.Router();

// Sponsored search endpoint (server-side proxy)
// NOTE: kept unauthenticated for local/dev convenience. For production, protect this route.
router.get('/sponsored', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ message: 'Missing query parameter `q`' });

    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'SERPAPI_API_KEY not configured on server' });

    const url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(q)}&api_key=${apiKey}`;
    const resp = await axios.get(url, { timeout: 10000 });
    const results = resp.data?.shopping_results || [];

    const items = results.map((r) => {
      const priceRaw = r.price || r.extracted_price || r['price'] || null;
      let price = null;
      if (priceRaw !== undefined && priceRaw !== null) {
        const parsed = parseFloat(String(priceRaw).replace(/[^0-9.\-]/g, ''));
        if (!Number.isNaN(parsed)) price = parsed;
      }
      return {
        title: r.title || r.product_title || r.name || '',
        url: r.link || r.product_link || r.offer_link || r.source || '',
        seller: r.source || r.merchant || r.store || '',
        price,
        raw: r,
      };
    });

    const lowestPrice = items.reduce((acc, it) => {
      if (it.price === null || it.price === undefined) return acc;
      return acc === null ? it.price : Math.min(acc, it.price);
    }, null);

    return res.json({ items, lowestPrice });
  } catch (error) {
    console.error('Sponsored search error', error?.message || error);
    return res.status(500).json({ message: 'Error fetching sponsored results', error: error?.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const redis = getRedisClient();
    const cacheKey = `products:${req.userId}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json({ products: JSON.parse(cached), cached: true });
      }
    }

    const products = await Product.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(100);

    if (redis) {
      await redis.setEx(cacheKey, 300, JSON.stringify(products));
    }

    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, url, platform, targetPrice } = req.body;

    const priceData = await scrapePrice(url, platform);

    const product = new Product({
      name,
      url,
      platform,
      targetPrice,
      currentPrice: priceData?.price || 0,
      userId: req.userId,
      priceHistory: priceData ? [{
        price: priceData.price,
        date: new Date()
      }] : []
    });

    await product.save();

    const redis = getRedisClient();
    if (redis) {
      await redis.del(`products:${req.userId}`);
    }

    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.metadata.views += 1;
    await product.save();

    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const redis = getRedisClient();
    if (redis) {
      await redis.del(`products:${req.userId}`);
    }

    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const redis = getRedisClient();
    if (redis) {
      await redis.del(`products:${req.userId}`);
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});



// Sponsored search endpoint (server-side proxy)
// Uses SerpAPI (https://serpapi.com/) when `SERPAPI_API_KEY` is provided in env.
// Returns standardized items and lowestPrice. Do not call Google directly from the browser.

router.get('/sponsored', auth, async (req, res) => {
  console.log("arrived at api key");
  try {
    console.log("arrived at api key2");


    const q = (req.query.q || '').trim();
    if (!q) {
      return res.status(400).json({ message: 'Missing query parameter `q`' });
    }

    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'SERPAPI_API_KEY not configured on server' });
    }
    console.log("arrived at api key");
    const url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(q)}&api_key=${apiKey}`;

    const resp = await axios.get(url, { timeout: 10000 });
    const results = resp.data?.shopping_results || [];

    const items = (results || []).map((r) => {
      // SerpAPI shopping result fields vary; normalize to: title, url, price, seller
      const priceRaw = r.price || r.extracted_price || r['price'] || null;
      let price = null;
      if (priceRaw !== undefined && priceRaw !== null) {
        const parsed = parseFloat(String(priceRaw).replace(/[^0-9.\-]/g, ''));
        if (!Number.isNaN(parsed)) price = parsed;
      }
      console.log('response', r);
      return {
        title: r.title || r.product_title || r.name || '',
        url: r.link || r.product_link || r.offer_link || r.source || '',
        seller: r.source || r.merchant || r.store || '',
        price,
        raw: r,
      };
    });

    const lowestPrice = items.reduce((acc, it) => {
      if (it.price === null || it.price === undefined) return acc;
      return acc === null ? it.price : Math.min(acc, it.price);
    }, null);

    res.json({ items, lowestPrice });
  } catch (error) {
    console.error('Sponsored search error', error?.message || error);
    res.status(500).json({ message: 'Error fetching sponsored results', error: error?.message });
  }
});


module.exports = router;