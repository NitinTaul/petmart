const { supabaseAdmin: supabase } = require('../config/supabase');

// ── CART ────────────────────────────────────────────────────

// GET /api/v1/cart
const getCart = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(id,name,price,original_price,image_url,stock)')
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, data: { items: data } });
  } catch (err) { next(err); }
};

// POST /api/v1/cart
const addToCart = async (req, res, next) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) return res.status(400).json({ success: false, message: 'product_id required' });

    const { data, error } = await supabase
      .from('cart_items')
      .upsert({ user_id: req.user.id, product_id, quantity }, { onConflict: 'user_id,product_id' })
      .select();

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, message: 'Added to cart', data: { item: data[0] } });
  } catch (err) { next(err); }
};

// PUT /api/v1/cart/:id
const updateCart = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'quantity must be >= 1' });
    }
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select();

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, data: { item: data[0] } });
  } catch (err) { next(err); }
};

// DELETE /api/v1/cart/:id
const removeFromCart = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) { next(err); }
};

// ── ORDERS ──────────────────────────────────────────────────

// GET /api/v1/orders
const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) query = query.eq('status', status);
    const { data, error, count } = await query;
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({
      success: true,
      data: {
        orders: data,
        pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) },
      },
    });
  } catch (err) { next(err); }
};

// GET /api/v1/orders/:id
const getOrder = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: { order: data } });
  } catch (err) { next(err); }
};

// POST /api/v1/orders
const createOrder = async (req, res, next) => {
  try {
    const { shipping_address, payment_method = 'cod', notes } = req.body;
    if (!shipping_address) return res.status(400).json({ success: false, message: 'shipping_address required' });

    // Fetch cart
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*, products(id,name,price,image_url,stock)')
      .eq('user_id', req.user.id);

    if (cartError || !cartItems?.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const total = cartItems.reduce((sum, item) => sum + item.products.price * item.quantity, 0);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ user_id: req.user.id, total_amount: total, shipping_address, payment_method, notes })
      .select().single();

    if (orderError) return res.status(400).json({ success: false, message: orderError.message });

    // Create order items
    const items = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.products.name,
      product_image: item.products.image_url,
      quantity: item.quantity,
      unit_price: item.products.price,
    }));

    await supabase.from('order_items').insert(items);

    // Clear cart
    await supabase.from('cart_items').delete().eq('user_id', req.user.id);

    res.status(201).json({ success: true, message: 'Order placed successfully!', data: { order } });
  } catch (err) { next(err); }
};

module.exports = { getCart, addToCart, updateCart, removeFromCart, getOrders, getOrder, createOrder };
