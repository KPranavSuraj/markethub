const express = require('express');
const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/overview', auth, async (req, res) => {
  try {
    const products = await Product.find({ userId: req.userId });

    const totalProducts = products.length;
    const trackedProducts = products.filter(p => p.isActive).length;
    const avgPrice = products.reduce((sum, p) => sum + p.currentPrice, 0) / (totalProducts || 1);
    const priceAlerts = products.filter(
      p => p.targetPrice && p.currentPrice <= p.targetPrice
    ).length;

    res.json({
      totalProducts,
      trackedProducts,
      avgPrice,
      priceAlerts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching overview', error: error.message });
  }
});

router.get('/trends', auth, async (req, res) => {
  try {
    const products = await Product.find({ userId: req.userId });

    const trends = [];
    const daysBack = 30;
    const now = new Date();

    for (let i = daysBack; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayPrices = products
        .flatMap(p => p.priceHistory)
        .filter(ph => {
          const phDate = new Date(ph.date).toISOString().split('T')[0];
          return phDate === dateStr;
        })
        .map(ph => ph.price);

      if (dayPrices.length > 0) {
        trends.push({
          date: dateStr,
          avgPrice: parseFloat((dayPrices.reduce((a, b) => a + b, 0) / dayPrices.length).toFixed(2)),
          minPrice: parseFloat(Math.min(...dayPrices).toFixed(2)),
          maxPrice: parseFloat(Math.max(...dayPrices).toFixed(2))
        });
      }
    }

    res.json({ trends });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trends', error: error.message });
  }
});

router.get('/performance', auth, async (req, res) => {
  try {
    const products = await Product.find({ userId: req.userId })
      .sort({ 'metadata.views': -1 })
      .limit(10);

    const performance = products.map(p => ({
      product: p.name.substring(0, 20),
      views: p.metadata.views,
      priceChecks: p.metadata.priceChecks
    }));

    res.json({ performance });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching performance', error: error.message });
  }
});

module.exports = router;