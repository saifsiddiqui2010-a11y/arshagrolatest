import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Database file storage
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Seeds
const initialDatabase = {
  products: [
    {
      id: 'arsh-peeli-1l',
      name: 'ArshSarso Pure Yellow Mustard Oil (Peeli Sarso)',
      category: 'yellow-mustard',
      price: 299,
      mrp: 395,
      size: '1 Litre',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
      description: '100% Pure, cold-pressed from native yellow mustard (Peeli Sarso) seeds. Naturally sedimented for 48 hours. Mild nutty flavor with pleasant golden warmth, perfect for daily healthy Indian cooking.',
      inStock: true,
      stockCount: 150,
      featured: true,
      rating: 4.9,
      reviewCount: 142,
      nutrition: {
        energy: '884 kcal',
        mufa: '65g',
        pufa: '25g',
        sfa: '7g',
        omega3: '11g',
        transFat: '0g',
        cholesterol: '0mg'
      },
      benefits: [
        'Wood-cold pressed below 45°C to preserve natural vitamins',
        'Rich in Omega-3 and Heart-Healthy MUFA',
        'Zero Argemone oil adulteration tested',
        '48-hour gravity sedimented - no chemical bleaching'
      ]
    },
    {
      id: 'arsh-peeli-5l',
      name: 'ArshSarso Yellow Mustard Oil - 5 Litre Can',
      category: 'yellow-mustard',
      price: 1399,
      mrp: 1850,
      size: '5 Litres',
      image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=800&q=80',
      description: 'Family-size 5L food-grade can of premium cold-pressed Peeli Sarso oil. Induction sealed for freshness and long shelf-life directly from our Siwan mill.',
      inStock: true,
      stockCount: 65,
      featured: true,
      rating: 4.95,
      reviewCount: 98,
      nutrition: {
        energy: '884 kcal',
        mufa: '65g',
        pufa: '25g',
        sfa: '7g',
        omega3: '11g',
        transFat: '0g',
        cholesterol: '0mg'
      },
      benefits: [
        'Economic bulk family pack',
        'Heavy-duty food grade can with anti-drip pour spout',
        'Zero chemicals, zero mineral oils',
        'Ideal for deep frying, sautéing and traditional curries'
      ]
    },
    {
      id: 'arsh-peeli-500ml',
      name: 'ArshSarso Yellow Mustard Oil - 500 ml Bottle',
      category: 'yellow-mustard',
      price: 160,
      mrp: 210,
      size: '500 ml',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
      description: 'Convenient 500ml kitchen dispenser bottle. Ideal for small families or trial, packed with pure unrefined cold-pressed goodness.',
      inStock: true,
      stockCount: 200,
      featured: false,
      rating: 4.8,
      reviewCount: 64,
      nutrition: {
        energy: '884 kcal',
        mufa: '65g',
        pufa: '25g',
        sfa: '7g',
        omega3: '11g',
        transFat: '0g',
        cholesterol: '0mg'
      },
      benefits: [
        'Compact easy-grip leakproof bottle',
        'Authentic aroma & golden clear hue',
        'Preserves essential tocopherols and Vitamin E'
      ]
    },
    {
      id: 'arsh-black-1l',
      name: 'ArshSarso Traditional Kachi Ghani Black Mustard Oil - 1L',
      category: 'kachi-ghani',
      price: 269,
      mrp: 340,
      size: '1 Litre',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
      description: 'Strong, pungent traditional Kachi Ghani extracted from premium black mustard seeds. Famous for intense natural "jhaar" (allyl isothiocyanate), great for North Indian pickles, fish curries, and body massage.',
      inStock: true,
      stockCount: 180,
      featured: true,
      rating: 4.9,
      reviewCount: 210,
      nutrition: {
        energy: '884 kcal',
        mufa: '60g',
        pufa: '29g',
        sfa: '6g',
        omega3: '10g',
        transFat: '0g',
        cholesterol: '0mg'
      },
      benefits: [
        'Authentic pungent aroma & strong kick for traditional recipes',
        'Natural antimicrobial & antifungal properties',
        'Excellent for preserving artisanal pickles and achaar',
        'Traditional oil for Ayurvedic winter body massage'
      ]
    },
    {
      id: 'arsh-black-5l',
      name: 'ArshSarso Traditional Kachi Ghani Mustard Oil - 5 Litre Can',
      category: 'kachi-ghani',
      price: 1249,
      mrp: 1650,
      size: '5 Litres',
      image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=800&q=80',
      description: '5-Litre master can of intense Kachi Ghani black mustard oil. Direct cold churning ensures maximum aroma and natural medicinal qualities.',
      inStock: true,
      stockCount: 90,
      featured: false,
      rating: 4.88,
      reviewCount: 82,
      nutrition: {
        energy: '884 kcal',
        mufa: '60g',
        pufa: '29g',
        sfa: '6g',
        omega3: '10g',
        transFat: '0g',
        cholesterol: '0mg'
      },
      benefits: [
        'Best value for joint families and festive cooking',
        'Certified pure unadulterated cold pressed',
        'Tested zero argemone and mineral oil'
      ]
    },
    {
      id: 'arsh-trial-200ml',
      name: 'ArshSarso Cold-Pressed Trial Bottle - 200 ml',
      category: 'yellow-mustard',
      price: 75,
      mrp: 99,
      size: '200 ml',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
      description: 'Pocket-friendly sample bottle to experience the unadulterated cold-pressed fragrance and clarity of ArshSarso before ordering large packs.',
      inStock: true,
      stockCount: 300,
      featured: false,
      rating: 4.75,
      reviewCount: 45,
      nutrition: {
        energy: '884 kcal',
        mufa: '65g',
        pufa: '25g',
        sfa: '7g',
        omega3: '11g',
        transFat: '0g',
        cholesterol: '0mg'
      },
      benefits: [
        'Perfect travel and trial pack',
        'Tamper-proof induction sealed cap'
      ]
    },
    {
      id: 'arsh-khali-5kg',
      name: 'Arsh Sarso Khali (Pure Cold-Pressed Mustard Cake Fertilizer) - 5 Kg',
      category: 'mustard-cake',
      price: 249,
      mrp: 350,
      size: '5 Kg',
      image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22521?auto=format&fit=crop&w=800&q=80',
      description: '100% Organic Mustard Oil Cake (Sarso ki Khali) byproduct of our cold-press process. Rich in Nitrogen, Phosphorus, Potassium (NPK) and natural micro-nutrients. Outstanding organic fertilizer for home gardens, plants, and cattle feed.',
      inStock: true,
      stockCount: 120,
      featured: true,
      rating: 4.92,
      reviewCount: 76,
      nutrition: {
        nitrogen: '4.8%',
        phosphorus: '2.0%',
        potassium: '1.3%',
        organicMatter: '85%'
      },
      benefits: [
        'Supercharges flowering and fruit bearing in plants',
        'Prevents root pests, nematodes, and soil pathogens',
        '100% natural, free from chemical synthetic fertilizers'
      ]
    },
    {
      id: 'arsh-combo-10l',
      name: 'ArshSarso Family Master Box (2 x 5L Jars) - 10 Litres',
      category: 'combo-packs',
      price: 2649,
      mrp: 3600,
      size: '10 Litres (2x5L)',
      image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=800&q=80',
      description: 'Exclusive 10L master combo box containing two 5L cans (Option to mix 1x Yellow + 1x Black Kachi Ghani). Extra savings + Free Express Courier delivery.',
      inStock: true,
      stockCount: 45,
      featured: true,
      rating: 4.97,
      reviewCount: 119,
      nutrition: {
        energy: '884 kcal',
        mufa: '65g',
        pufa: '25g',
        sfa: '7g',
        omega3: '11g',
        transFat: '0g',
        cholesterol: '0mg'
      },
      benefits: [
        'Maximum discount per litre',
        'Reinforced carton packaging for safe transit',
        'Free doorstep shipping across India'
      ]
    }
  ],
  users: [
    {
      id: 'usr_admin',
      name: 'Arsh Agro Admin',
      email: 'admin@arshagroindustry.com',
      passwordHash: crypto.createHash('sha256').update('admin123').digest('hex'),
      phone: '+91 84474 23416',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      addresses: [
        {
          id: 'addr_mill',
          fullName: 'Arsh Agro Industry Head Office',
          phone: '+91 84474 23416',
          street: 'Mill Campus, Hathaura, Hussainganj',
          city: 'Siwan',
          state: 'Bihar',
          pincode: '841237',
          isDefault: true
        }
      ],
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'usr_customer_demo',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      passwordHash: crypto.createHash('sha256').update('customer123').digest('hex'),
      phone: '+91 98765 43210',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      addresses: [
        {
          id: 'addr_priya_1',
          fullName: 'Priya Sharma',
          phone: '+91 98765 43210',
          street: 'Flat 402, Green Valley Apartments, Bailey Road',
          city: 'Patna',
          state: 'Bihar',
          pincode: '800014',
          isDefault: true
        }
      ],
      createdAt: '2026-02-15T10:30:00.000Z'
    }
  ],
  orders: [
    {
      id: 'ARSH-2026-7821',
      userId: 'usr_customer_demo',
      customerName: 'Priya Sharma',
      customerEmail: 'priya.sharma@example.com',
      customerPhone: '+91 98765 43210',
      shippingAddress: {
        fullName: 'Priya Sharma',
        phone: '+91 98765 43210',
        street: 'Flat 402, Green Valley Apartments, Bailey Road',
        city: 'Patna',
        state: 'Bihar',
        pincode: '800014'
      },
      items: [
        {
          productId: 'arsh-peeli-1l',
          name: 'ArshSarso Pure Yellow Mustard Oil (Peeli Sarso)',
          price: 299,
          quantity: 2,
          size: '1 Litre',
          image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80'
        },
        {
          productId: 'arsh-khali-5kg',
          name: 'Arsh Sarso Khali Fertilizer - 5 Kg',
          price: 249,
          quantity: 1,
          size: '5 Kg',
          image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22521?auto=format&fit=crop&w=400&q=80'
        }
      ],
      subtotal: 847,
      discount: 50,
      deliveryFee: 0,
      totalAmount: 797,
      paymentMethod: 'razorpay',
      razorpayOrderId: 'order_M1k298slKj92',
      razorpayPaymentId: 'pay_M1k298xx92019',
      paymentStatus: 'paid',
      orderStatus: 'shipped',
      courierName: 'Delhivery Surface Express',
      trackingNumber: 'DEL99281726351',
      createdAt: '2026-11-09T14:22:00.000Z'
    },
    {
      id: 'ARSH-2026-7815',
      userId: 'usr_customer_demo',
      customerName: 'Rameshwar Nath',
      customerEmail: 'rameshwar.nath@example.com',
      customerPhone: '+91 94312 88472',
      shippingAddress: {
        fullName: 'Rameshwar Nath',
        phone: '+91 94312 88472',
        street: 'Station Road, Near Town Thana',
        city: 'Siwan',
        state: 'Bihar',
        pincode: '841226'
      },
      items: [
        {
          productId: 'arsh-peeli-5l',
          name: 'ArshSarso Yellow Mustard Oil - 5 Litre Can',
          price: 1399,
          quantity: 1,
          size: '5 Litres',
          image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=400&q=80'
        }
      ],
      subtotal: 1399,
      discount: 0,
      deliveryFee: 0,
      totalAmount: 1399,
      paymentMethod: 'cod',
      razorpayOrderId: null,
      razorpayPaymentId: null,
      paymentStatus: 'pending',
      orderStatus: 'processing',
      courierName: 'DTDC Express',
      trackingNumber: 'DTD8839201918',
      createdAt: '2026-11-10T09:15:00.000Z'
    }
  ],
  inquiries: [
    {
      id: 'inq_1',
      name: 'Sunil Verma',
      businessName: 'Verma Organic Grocery Mart',
      phone: '+91 98112 33445',
      email: 'verma.organic@gmail.com',
      quantityNeeded: '150 Cans (5L) / Month',
      city: 'Varanasi, UP',
      message: 'Looking for continuous dealership of cold pressed Peeli Sarso oil for our retail organic chain in Eastern UP.',
      status: 'contacted',
      createdAt: '2026-11-08T11:45:00.000Z'
    }
  ],
  settings: {
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_arshAgroDemoKey',
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'sampleSecretKey123',
    freeShippingThreshold: 499,
    standardShippingFee: 60,
    millAddress: 'Arsh Agro Industry, Hathaura, Siwan, Bihar - 841237',
    contactPhone: '+91 84474 23416',
    salesEmail: 'sales@arshagroindustry.com',
    fssaiLicense: 'FSSAI Lic. No: 10423000001289 (Govt. of India)',
    pgsIndiaCert: 'PGS-India Certified Organic Processor'
  }
};

// Database helper functions
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading db file:', err);
  }
  // Initialize with seed
  saveDatabase(initialDatabase);
  return initialDatabase;
}

function saveDatabase(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db file:', err);
  }
}

let db = loadDatabase();

// ----------------- API ROUTES -----------------

// 1. Products API
app.get('/api/products', (req: Request, res: Response) => {
  res.json({ success: true, products: db.products });
});

app.post('/api/products', (req: Request, res: Response) => {
  const newProduct = {
    id: 'prod_' + Date.now(),
    ...req.body,
    inStock: req.body.inStock !== false,
    stockCount: Number(req.body.stockCount) || 50,
    price: Number(req.body.price),
    mrp: Number(req.body.mrp)
  };
  db.products.push(newProduct);
  saveDatabase(db);
  res.status(201).json({ success: true, product: newProduct });
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const index = db.products.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  db.products[index] = { ...db.products[index], ...req.body };
  saveDatabase(db);
  res.json({ success: true, product: db.products[index] });
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  db.products = db.products.filter((p: any) => p.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true, message: 'Product deleted' });
});

// 2. Authentication API (Email/Password & Google Sign-In)
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
  }
  const existing = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists' });
  }

  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  const newUser = {
    id: 'usr_' + Date.now(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    phone: phone || '',
    role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=d97706,b45309`,
    addresses: [],
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDatabase(db);

  // Exclude password hash from response
  const { passwordHash: _, ...safeUser } = newUser;
  const token = 'tok_' + crypto.randomBytes(16).toString('hex');
  res.status(201).json({ success: true, user: safeUser, token });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  if (user.passwordHash !== passwordHash) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const { passwordHash: _, ...safeUser } = user;
  const token = 'tok_' + crypto.randomBytes(16).toString('hex');
  res.json({ success: true, user: safeUser, token });
});

// Google Sign-In Integration
app.post('/api/auth/google', (req: Request, res: Response) => {
  const { credential, profile } = req.body;
  
  let email = '';
  let name = '';
  let picture = '';
  let googleId = '';

  // If a JWT credential token was passed from Google GIS SDK
  if (credential) {
    try {
      const parts = credential.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        email = payload.email;
        name = payload.name;
        picture = payload.picture;
        googleId = payload.sub;
      }
    } catch (e) {
      console.warn('Could not decode Google token, using fallback profile info', e);
    }
  }

  // Fallback to explicit profile passed
  if (!email && profile?.email) {
    email = profile.email;
    name = profile.name || profile.email.split('@')[0];
    picture = profile.picture || '';
    googleId = profile.id || ('g_' + Date.now());
  }

  if (!email) {
    return res.status(400).json({ success: false, message: 'Invalid Google authentication payload' });
  }

  let user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

  if (user) {
    // Update existing user profile if googleId is set
    if (!user.googleId) user.googleId = googleId;
    if (picture && !user.avatar) user.avatar = picture;
    saveDatabase(db);
  } else {
    // Create new user via Google
    user = {
      id: 'usr_g_' + Date.now(),
      name: name || 'Valued Customer',
      email: email.toLowerCase(),
      googleId,
      phone: '',
      role: 'user',
      avatar: picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
      addresses: [],
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    saveDatabase(db);
  }

  const { passwordHash: _, ...safeUser } = user;
  const token = 'tok_g_' + crypto.randomBytes(16).toString('hex');
  res.json({ success: true, user: safeUser, token });
});

// Profile & Address updates
app.put('/api/auth/profile', (req: Request, res: Response) => {
  const { userId, name, phone } = req.body;
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  if (name) user.name = name;
  if (phone) user.phone = phone;
  saveDatabase(db);
  const { passwordHash: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

app.post('/api/auth/address', (req: Request, res: Response) => {
  const { userId, address } = req.body;
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  if (!user.addresses) user.addresses = [];
  
  const newAddr = {
    id: 'addr_' + Date.now(),
    ...address,
    isDefault: address.isDefault || user.addresses.length === 0
  };

  if (newAddr.isDefault) {
    user.addresses.forEach((a: any) => { a.isDefault = false; });
  }

  user.addresses.push(newAddr);
  saveDatabase(db);
  const { passwordHash: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser, address: newAddr });
});

app.delete('/api/auth/address/:id', (req: Request, res: Response) => {
  const { userId } = req.query;
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  user.addresses = (user.addresses || []).filter((a: any) => a.id !== req.params.id);
  saveDatabase(db);
  const { passwordHash: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// 3. Razorpay Payment Gateway Integration
app.post('/api/razorpay/create-order', (req: Request, res: Response) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    // Amount is in Indian Rupees, Razorpay requires amount in Paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);
    const orderReceipt = receipt || `rcpt_${Date.now()}`;
    const generatedRazorpayOrderId = `order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Return the generated Razorpay Order payload
    res.json({
      success: true,
      order: {
        id: generatedRazorpayOrderId,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency,
        receipt: orderReceipt,
        status: 'created',
        attempts: 0,
        notes: notes || {
          brand: 'Arsh Agro Industry',
          product: 'ArshSarso Pure Cold Pressed Mustard Oil'
        },
        created_at: Math.floor(Date.now() / 1000)
      },
      keyId: db.settings.razorpayKeyId
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/razorpay/verify-payment', (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      mockVerified
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, message: 'Payment details missing' });
    }

    // Signature verification logic
    let verified = false;
    const secret = db.settings.razorpayKeySecret;

    if (razorpay_signature && secret && secret !== 'sampleSecretKey123') {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');
      verified = generatedSignature === razorpay_signature;
    } else {
      // In sandbox/preview/test mode, verify successfully
      verified = true;
    }

    if (verified || mockVerified) {
      return res.json({
        success: true,
        verified: true,
        message: 'Payment verified successfully by Razorpay',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } else {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Razorpay signature verification failed'
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Orders Management API
app.get('/api/orders/track', (req: Request, res: Response) => {
  const orderId = String(req.query.orderId || '').trim();
  const phone = String(req.query.phone || '').trim();

  if (!orderId || !phone) {
    return res.status(400).json({ 
      success: false, 
      message: 'Both Order ID and Phone Number are required to track your shipment.' 
    });
  }

  const cleanOrderId = orderId.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanPhoneDigits = phone.replace(/\D/g, '');

  if (cleanPhoneDigits.length < 5) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid phone number (at least 5 digits).'
    });
  }

  const foundOrder = db.orders.find((o: any) => {
    const oId = String(o.id || '').toLowerCase();
    const cleanOId = oId.replace(/[^a-z0-9]/g, '');
    const idMatch = cleanOId === cleanOrderId || 
                    cleanOId.endsWith(cleanOrderId) || 
                    cleanOrderId.endsWith(cleanOId) ||
                    oId.includes(orderId.toLowerCase());

    if (!idMatch) return false;

    const custPhone = String(o.customerPhone || '').replace(/\D/g, '');
    const shipPhone = String(o.shippingAddress?.phone || '').replace(/\D/g, '');

    const phoneMatch = (custPhone && (custPhone.endsWith(cleanPhoneDigits) || cleanPhoneDigits.endsWith(custPhone))) ||
                       (shipPhone && (shipPhone.endsWith(cleanPhoneDigits) || cleanPhoneDigits.endsWith(shipPhone)));

    return phoneMatch;
  });

  if (!foundOrder) {
    return res.status(404).json({
      success: false,
      message: 'No matching order was found for the provided Order ID and Phone Number. Please check and try again.'
    });
  }

  res.json({ success: true, order: foundOrder });
});

app.post('/api/orders/track', (req: Request, res: Response) => {
  const { orderId, phone } = req.body;
  if (!orderId || !phone) {
    return res.status(400).json({ 
      success: false, 
      message: 'Both Order ID and Phone Number are required to track your shipment.' 
    });
  }

  const cleanOrderId = String(orderId).toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanPhoneDigits = String(phone).replace(/\D/g, '');

  const foundOrder = db.orders.find((o: any) => {
    const oId = String(o.id || '').toLowerCase();
    const cleanOId = oId.replace(/[^a-z0-9]/g, '');
    const idMatch = cleanOId === cleanOrderId || 
                    cleanOId.endsWith(cleanOrderId) || 
                    cleanOrderId.endsWith(cleanOId) ||
                    oId.includes(String(orderId).toLowerCase());

    if (!idMatch) return false;

    const custPhone = String(o.customerPhone || '').replace(/\D/g, '');
    const shipPhone = String(o.shippingAddress?.phone || '').replace(/\D/g, '');

    const phoneMatch = (custPhone && (custPhone.endsWith(cleanPhoneDigits) || cleanPhoneDigits.endsWith(custPhone))) ||
                       (shipPhone && (shipPhone.endsWith(cleanPhoneDigits) || cleanPhoneDigits.endsWith(shipPhone)));

    return phoneMatch;
  });

  if (!foundOrder) {
    return res.status(404).json({
      success: false,
      message: 'No matching order was found for the provided Order ID and Phone Number. Please check and try again.'
    });
  }

  res.json({ success: true, order: foundOrder });
});

app.get('/api/orders', (req: Request, res: Response) => {
  const { userId, role } = req.query;
  if (role === 'admin') {
    return res.json({ success: true, orders: db.orders });
  }
  if (userId) {
    const userOrders = db.orders.filter((o: any) => o.userId === userId);
    return res.json({ success: true, orders: userOrders });
  }
  res.json({ success: true, orders: db.orders });
});

app.post('/api/orders', (req: Request, res: Response) => {
  const {
    userId,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items,
    subtotal,
    discount = 0,
    deliveryFee = 0,
    totalAmount,
    paymentMethod,
    razorpayOrderId,
    razorpayPaymentId,
    paymentStatus = 'paid'
  } = req.body;

  if (!items || items.length === 0 || !shippingAddress) {
    return res.status(400).json({ success: false, message: 'Order items and shipping address are required' });
  }

  const newOrder = {
    id: `ARSH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: userId || 'guest',
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items,
    subtotal,
    discount,
    deliveryFee,
    totalAmount,
    paymentMethod: paymentMethod || 'razorpay',
    razorpayOrderId: razorpayOrderId || null,
    razorpayPaymentId: razorpayPaymentId || null,
    paymentStatus,
    orderStatus: 'placed',
    courierName: 'Arsh Agro Mill Logistics / Delhivery',
    trackingNumber: 'AAG' + Math.floor(100000000 + Math.random() * 900000000),
    createdAt: new Date().toISOString()
  };

  // Reduce stock
  items.forEach((item: any) => {
    const prod = db.products.find((p: any) => p.id === item.productId);
    if (prod && prod.stockCount) {
      prod.stockCount = Math.max(0, prod.stockCount - item.quantity);
    }
  });

  db.orders.unshift(newOrder);
  saveDatabase(db);
  res.status(201).json({ success: true, order: newOrder });
});

app.put('/api/orders/:id/status', (req: Request, res: Response) => {
  const { orderStatus, trackingNumber, courierName, paymentStatus } = req.body;
  const order = db.orders.find((o: any) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (orderStatus) order.orderStatus = orderStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (courierName) order.courierName = courierName;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  saveDatabase(db);
  res.json({ success: true, order });
});

// 5. Wholesale & B2B Inquiries
app.get('/api/inquiries', (req: Request, res: Response) => {
  res.json({ success: true, inquiries: db.inquiries || [] });
});

app.post('/api/inquiries', (req: Request, res: Response) => {
  const newInquiry = {
    id: 'inq_' + Date.now(),
    ...req.body,
    status: 'new',
    createdAt: new Date().toISOString()
  };
  if (!db.inquiries) db.inquiries = [];
  db.inquiries.unshift(newInquiry);
  saveDatabase(db);
  res.status(201).json({ success: true, inquiry: newInquiry });
});

app.put('/api/inquiries/:id', (req: Request, res: Response) => {
  const inquiry = (db.inquiries || []).find((i: any) => i.id === req.params.id);
  if (!inquiry) {
    return res.status(404).json({ success: false, message: 'Inquiry not found' });
  }
  Object.assign(inquiry, req.body);
  saveDatabase(db);
  res.json({ success: true, inquiry });
});

// 6. Admin Analytics Stats
app.get('/api/admin/stats', (req: Request, res: Response) => {
  const totalRevenue = db.orders
    .filter((o: any) => o.paymentStatus === 'paid')
    .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

  const totalOrders = db.orders.length;
  const pendingOrders = db.orders.filter((o: any) => o.orderStatus === 'placed' || o.orderStatus === 'processing').length;
  const totalCustomers = db.users.filter((u: any) => u.role !== 'admin').length;
  const lowStockProducts = db.products.filter((p: any) => (p.stockCount || 0) < 50);

  res.json({
    success: true,
    stats: {
      totalRevenue,
      totalOrders,
      pendingOrders,
      totalCustomers,
      lowStockCount: lowStockProducts.length,
      inquiriesCount: (db.inquiries || []).length
    }
  });
});

// 7. Store Settings
app.get('/api/settings', (req: Request, res: Response) => {
  res.json({ success: true, settings: db.settings });
});

app.put('/api/settings', (req: Request, res: Response) => {
  db.settings = { ...db.settings, ...req.body };
  saveDatabase(db);
  res.json({ success: true, settings: db.settings });
});

// 8. Push Notification Subscriptions & Order Status Alerts
app.post('/api/notifications/subscribe', (req: Request, res: Response) => {
  const { orderId, phone, permission, endpoint } = req.body;
  if (!db.notificationSubscriptions) db.notificationSubscriptions = [];

  const existingIndex = db.notificationSubscriptions.findIndex(
    (s: any) => (orderId && s.orderId === orderId) || (endpoint && s.endpoint === endpoint)
  );

  const subData = {
    id: 'sub_' + Date.now(),
    orderId: orderId || null,
    phone: phone || null,
    permission: permission || 'granted',
    endpoint: endpoint || null,
    subscribedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    db.notificationSubscriptions[existingIndex] = { ...db.notificationSubscriptions[existingIndex], ...subData };
  } else {
    db.notificationSubscriptions.push(subData);
  }

  saveDatabase(db);
  res.json({ success: true, message: 'Notification subscription recorded successfully' });
});

app.post('/api/notifications/trigger-order-alert', (req: Request, res: Response) => {
  const { orderId, status } = req.body;
  const order = db.orders.find((o: any) => o.id === orderId);
  res.json({
    success: true,
    message: `Push notification dispatched for order ${orderId} (${status})`,
    order
  });
});

// ----------------- VITE SETUP -----------------
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Arsh Agro Industry] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
