const router = require('express').Router();
const { authenticate } = require('../../middleware/auth');
const authCtrl = require('../../controllers/authController');
const productCtrl = require('../../controllers/productController');
const categoryCtrl = require('../../controllers/categoryController');
const { getCart, addToCart, updateCart, removeFromCart, getOrders, getOrder, createOrder } = require('../../controllers/cartOrderController');

// Auth
router.post('/auth/register',   authCtrl.register);
router.post('/auth/login',      authCtrl.login);
router.post('/auth/logout',     authenticate, authCtrl.logout);
router.post('/auth/send-otp',   authCtrl.sendOtp);
router.post('/auth/verify-otp', authCtrl.verifyOtp);
router.get('/auth/me',          authenticate, authCtrl.getMe);

// Products
router.get('/products',     productCtrl.getProducts);
router.get('/products/:id', productCtrl.getProduct);

// Categories & Brands
router.get('/categories', categoryCtrl.getCategories);
router.get('/brands',     categoryCtrl.getBrands);

// Cart
router.get('/cart',        authenticate, getCart);
router.post('/cart',       authenticate, addToCart);
router.put('/cart/:id',    authenticate, updateCart);
router.delete('/cart/:id', authenticate, removeFromCart);

// Orders
router.get('/orders',     authenticate, getOrders);
router.get('/orders/:id', authenticate, getOrder);
router.post('/orders',    authenticate, createOrder);

module.exports = router;