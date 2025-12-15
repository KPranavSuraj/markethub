const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  platform: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    availability: Boolean,
    discount: Number,
    rating: Number
  }
});

priceHistorySchema.index({ productId: 1, timestamp: -1 });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);