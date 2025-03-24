import mongoose from 'mongoose';

const SaleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: true
  },
  pricePerUnit: {
    type: Number,
    required: true
  },
  costPerUnit: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  }
});

const SaleSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  items: [SaleItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  profit: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'credit'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'partial', 'pending'],
    default: 'paid'
  },
  pendingAmount: {
    type: Number,
    default: 0
  },
  saleDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate invoice number before saving
SaleSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    const lastSale = await this.constructor.findOne({
      invoiceNumber: new RegExp(`^GKK${year}${month}`)
    }).sort({ invoiceNumber: -1 });

    let sequence = '0001';
    if (lastSale) {
      const lastSequence = parseInt(lastSale.invoiceNumber.slice(-4));
      sequence = (lastSequence + 1).toString().padStart(4, '0');
    }

    this.invoiceNumber = `GKK${year}${month}${sequence}`;
  }
  next();
});

// Calculate profit before saving
SaleSchema.pre('save', function(next) {
  let totalCost = 0;
  this.items.forEach(item => {
    totalCost += (item.costPerUnit * item.quantity);
  });
  this.profit = this.totalAmount - totalCost;
  next();
});

export default mongoose.models.Sale || mongoose.model('Sale', SaleSchema);
