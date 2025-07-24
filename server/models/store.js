import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    required: true,
    trim: true,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },

  category: {
    type: String,
    required: true,
    trim: true,
  },

  brand: {
    type: String,
    default: '',
    trim: true,
  },

  stock: {
    type: Number,
    required: true,
    min: 0,
  },

  images: {
    type: [String], 
    required: true,
    validate: {
      validator: (val) => Array.isArray(val) && val.length > 0,
      message: 'At least one image URL is required',
    },
  },

  storeId: {
    type: String,
    required: true,
  },
  color: {
    type: [String],
    default: [],
    validate: {
      validator: (val) => Array.isArray(val) && val.length > 0,
      message: 'At least one color is required',
    },
  },
  size: {
    type: [String],
    default: [],
    validate: {
      validator: (val) => Array.isArray(val) && val.length > 0,
      message: 'At least one size is required',
    },
  },
 brand_logo: {
    type: String,
    default: '',
  },
  reviewsCount: {
    type: Number,
    default: 0,
  },

  views: {
    type: Number,
    default: 0,
  },

  purchasedCount: {
    type: Number,
    default: 0,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  averageRating:{
    type:Number,
    default : 0 ,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  strict:false,
},

);

export default mongoose.model('Product', productSchema);
