
import mongoose from 'mongoose'

const serviceProviderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  serviceProviderType: {
    type: String,
    enum: [
      "Incubator",
  "Accelerator",
  "Institution/University",
  "Private Coworking Space",
  "Community Space",
  // "Studio",
  "R & D Labs",
  "Communities",
  "Investors",
  "Creators",
  "State Missions"

    ],
    required: false,
    default: null,
  },
  agreementUrl: {
   type: String,
  default: null,
},
  serviceName: {
    type: String,
    required: false,
    default: null,
  },
  address: {
    type: String,
    required: false,
    default: null,
  },
  features: {
    type: [String],
    default: [],
  },
  images: {
    type: [String],
    default: [],
  },
  city: {
    type: String,
    required: false,
    default: null,
  },
  stateProvince: {
    type: String,
    required: false,
    default: null,
  },
  zipPostalCode: {
    type: String,
    required: false,
    default: null,
  },
  primaryContact1Name: {
    type: String,
    required: false,
    default: null,
  },
  primaryContact1Designation: {
    type: String,
    required: false,
    default: null,
  },
  contact2Name: {
    type: String,
    default: null,
  },
  contact2Designation: {
    type: String,
    default: null,
  },
  primaryContactNumber: {
    type: String,
    required: false,
    default: null,
  },
  isPhoneVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  alternateContactNumber: {
    type: String,
    default: null,
  },
  primaryEmailId: {
    type: String,
    required: false,
    default: null,
    validate: {
      validator: function(v: string | null) {
        if (!v) return true // Allow null
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v)
      },
      message: 'Invalid email format',
    }
  },
  alternateEmailId: {
    type: String,
    default: null,
    validate: {
      validator: function(v: string | null) {
        if (!v) return true
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v)
      },
      message: 'Invalid alternate email format',
    },
  },
  logoUrl: {
    type: String,
    default: null,
  },
  websiteUrl: {
    type: String,
    default: null,
  },
  gstNumber: {
    type: String,
    default: null,
  },
  applyGst: {
    type: String,
    enum: ['yes','no'],
    default: 'no',
  },
  isApproved: {
    type: Boolean,
    required: true,
    default: false, // Default to false to prevent immediate login
  },
  // In your Service Provider schema
  invoiceType: {
    type: String,
    enum: ['self','cumma'],
    default: 'self',
  },
settlementType:{
  type:String,
  enum:['monthly','weekly'],
  default:'monthly'
},
invoiceTemplate:{
  type:String,
  enum:['template1' , 'template2'],
  default:'template1',
}
,
  bankName: {
  type: String,
  required: false,
  default: null,
},
accountNumber: {
  type: String,
  required: false,
  default: null,
},
ifscCode: {
  type: String,
  required: false,
  default: null,
},
accountHolderName: {
  type: String,
  required: false,
  default: null,
},
bankBranch: {
  type: String,
  required: false,
  default: null,
},
coupons: {
  type: [{
    couponCode: { 
      type: String, 
      required: true,
      uppercase: true,
      trim: true
    },
    discount: { 
      type: Number, 
      required: true,
      min: 1,
      max: 100 
    },
    minimumValue: { 
      type: Number, 
      required: true,
      min: 0,
      default: 0 
    },
    validFrom: { 
      type: Date, 
      required: true 
    },
    validTo: { 
      type: Date, 
      required: true 
    },
    isActive: {
      type: Boolean,
      default: true
    },
    usageLimit: {
      type: Number,
      default: null
    },
    usedCount: {
      type: Number,
      default: 0
    },
    applicableFacilities: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Facility',
      default: []
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  default: []
},
  // ✅ Add this line

  timings: {
    type: {
      monday: {
        isOpen: { type: Boolean, required: true },
        openTime: { type: String },
        closeTime: { type: String }
      },
      tuesday: {
        isOpen: { type: Boolean, required: true },
        openTime: { type: String },
        closeTime: { type: String }
      },
      wednesday: {
        isOpen: { type: Boolean, required: true },
        openTime: { type: String },
        closeTime: { type: String }
      },
      thursday: {
        isOpen: { type: Boolean, required: true },
        openTime: { type: String },
        closeTime: { type: String }
      },
      friday: {
        isOpen: { type: Boolean, required: true },
        openTime: { type: String },
        closeTime: { type: String }
      },
      saturday: {
        isOpen: { type: Boolean, required: true },
        openTime: { type: String },
        closeTime: { type: String }
      },
      sunday: {
        isOpen: { type: Boolean, required: true },
        openTime: { type: String },
        closeTime: { type: String }
      }
    },
    default: () => ({
      monday: { isOpen: false },
      tuesday: { isOpen: false },
      wednesday: { isOpen: false },
      thursday: { isOpen: false },
      friday: { isOpen: false },
      saturday: { isOpen: false },
      sunday: { isOpen: false }
    })
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, {
  collection: 'Service Provider'
})

// Update timestamps on save
serviceProviderSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

// Clear existing models to avoid caching issues
if (mongoose.models.ServiceProvider) {
  delete mongoose.models.ServiceProvider
}

// Debug: Log schema paths to verify gstNumber is included
// console.log('Schema paths check:')
// console.log('gstNumber path exists:', 'gstNumber' in serviceProviderSchema.paths)
// console.log('gstNumber path definition:', serviceProviderSchema.paths.gstNumber)

const ServiceProvider = mongoose.model('ServiceProvider', serviceProviderSchema, 'Service Provider')

export default ServiceProvider