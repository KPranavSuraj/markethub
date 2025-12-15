const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['Amazon', 'Flipkart', 'eBay', 'Other']
  },
  currentPrice: {
    type: Number,
    default: 0
  },
  targetPrice: {
    type: Number
  },
  priceHistory: [{
    price: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  lastChecked: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    views: { type: Number, default: 0 },
    priceChecks: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.index({ userId: 1, createdAt: -1 });
productSchema.index({ platform: 1 });

module.exports = mongoose.model('Product', productSchema);