import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectDB } from './db.js';
import User from './models/User.js';
import Shop from './models/Shop.js';
import Review from './models/Review.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_chaispot';


app.use(cors());
app.use(express.json());


connectDB();


const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authentication token, authorization denied.' });
    }
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(401).json({ message: 'User not found, authorization denied.' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid.' });
  }
};




app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      points: 65 
    });

    await newUser.save();

    const token = jwt.sign({ email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        email: newUser.email,
        points: newUser.points
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        email: user.email,
        points: user.points
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/users/me', auth, async (req, res) => {
  res.json({
    email: req.user.email,
    points: req.user.points,
    claimedCoupons: req.user.claimedCoupons
  });
});




app.get('/api/shops', async (req, res) => {
  try {
    const shops = await Shop.find().sort({ createdAt: -1 });
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/shops', auth, async (req, res) => {
  try {
    const { name, address, description, photoUrl, latitude, longitude } = req.body;

    if (!name || !address || !description) {
      return res.status(400).json({ message: 'Name, address, and description are required.' });
    }

    let shopLat = latitude;
    let shopLng = longitude;

    if (shopLat === undefined || shopLng === undefined) {
      
      const sfCenterLat = 37.7749;
      const sfCenterLng = -122.4194;
      const randomOffsetLat = (Math.random() - 0.5) * 0.05;
      const randomOffsetLng = (Math.random() - 0.5) * 0.05;
      shopLat = sfCenterLat + randomOffsetLat;
      shopLng = sfCenterLng + randomOffsetLng;
    }

    const newShop = new Shop({
      name,
      address,
      description,
      photoUrl: photoUrl || undefined,
      latitude: shopLat,
      longitude: shopLng
    });

    await newShop.save();

    
    req.user.points += 15;
    await req.user.save();

    res.status(201).json({
      shop: newShop,
      points: req.user.points
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/reviews', auth, async (req, res) => {
  try {
    const { shopId, rating, text } = req.body;

    if (!shopId || !rating || !text) {
      return res.status(400).json({ message: 'ShopId, rating, and description text are required.' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found.' });
    }

    
    let review = await Review.findOne({ shopId, userEmail: req.user.email });

    if (review) {
      
      review.rating = rating;
      review.text = text;
      await review.save();
    } else {
      
      review = new Review({
        shopId,
        userEmail: req.user.email,
        rating,
        text
      });
      await review.save();

      
      req.user.points += 10;
      await req.user.save();
    }

    
    const shopReviews = await Review.find({ shopId });
    const totalRating = shopReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = parseFloat((totalRating / shopReviews.length).toFixed(1));

    shop.averageRating = avgRating;
    shop.reviewCount = shopReviews.length;
    await shop.save();

    res.json({
      review,
      shop,
      points: req.user.points
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




app.post('/api/rewards/redeem', auth, async (req, res) => {
  try {
    if (req.user.points < 50) {
      return res.status(400).json({ message: 'Insufficient points. 50 points required.' });
    }

    
    req.user.points -= 50;

    
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'CHAI-';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    
    const newCoupon = {
      code,
      claimedAt: new Date(),
      description: 'Free Traditional Masala Chai'
    };

    req.user.claimedCoupons.unshift(newCoupon);
    await req.user.save();

    res.json({
      code,
      points: req.user.points,
      coupon: newCoupon
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/', (req, res) => {
  res.send('ChaiSpot Backend API is running...');
});


app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
