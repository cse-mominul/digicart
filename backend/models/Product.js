const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    images: [{ type: String, trim: true }],
    category: { type: String, required: true, trim: true },
    countInStock: { type: Number, required: true, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    compareAtPrice: { type: Number, default: 0, min: 0 },
    discountText: { type: String, trim: true, default: '15% OFF' },
    displayRating: { type: Number, default: 4, min: 0, max: 5 },
    displayReviewsText: { type: String, trim: true, default: '11.78k reviews' },
    additionalInfo: [
      {
        label: { type: String, trim: true, default: '' },
        value: { type: String, trim: true, default: '' },
      },
    ],
  },
  { timestamps: true }
);

productSchema.pre('validate', function (next) {
  if (this.countInStock == null && this.stock != null) {
    this.countInStock = this.stock;
  }

  if (this.stock == null && this.countInStock != null) {
    this.stock = this.countInStock;
  }

  if (this.isModified('countInStock') && !this.isModified('stock')) {
    this.stock = this.countInStock;
  }

  if (this.isModified('stock') && !this.isModified('countInStock')) {
    this.countInStock = this.stock;
  }

  const cleanedImages = Array.isArray(this.images)
    ? this.images
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean)
    : [];

  if (!cleanedImages.length && this.image) {
    cleanedImages.push(this.image);
  }

  if (!this.image && cleanedImages.length) {
    this.image = cleanedImages[0];
  }

  this.images = cleanedImages;

  next();
});

module.exports = mongoose.model('Product', productSchema);
