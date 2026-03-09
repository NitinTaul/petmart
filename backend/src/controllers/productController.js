const { supabase } = require('../config/supabase');

// GET /api/v1/products
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20,
      category_id, brand_id, pet_type,
      min_price, max_price,
      search, sort = 'created_at', order = 'desc',
      featured,
    } = req.query;

    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    // Only select fields needed for list view (avoid overfetching)
    let query = supabase
      .from('products')
      .select('id,name,price,original_price,image_url,pet_type,rating,review_count,stock,brand_id,category_id,is_featured', { count: 'exact' })
      .eq('is_active', true)
      .range(from, to);

    if (category_id) query = query.eq('category_id', parseInt(category_id));
    if (brand_id)    query = query.eq('brand_id', parseInt(brand_id));
    if (pet_type)    query = query.eq('pet_type', pet_type);
    if (min_price)   query = query.gte('price', parseFloat(min_price));
    if (max_price)   query = query.lte('price', parseFloat(max_price));
    if (featured === 'true') query = query.eq('is_featured', true);

    // Full-text search on name
    if (search) query = query.textSearch('name', search, { type: 'websearch' });

    const validSorts = ['price', 'rating', 'created_at', 'review_count'];
    const sortField = validSorts.includes(sort) ? sort : 'created_at';
    query = query.order(sortField, { ascending: order === 'asc' });

    const { data, error, count } = await query;
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({
      success: true,
      data: {
        products: data,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
          hasMore: to < count - 1,
        },
      },
    });
  } catch (err) { next(err); }
};

// GET /api/v1/products/:id
const getProduct = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name,slug), brands(name,slug)')
      .eq('id', req.params.id)
      .eq('is_active', true)
      .single();

    if (error || !data) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, data: { product: data } });
  } catch (err) { next(err); }
};

module.exports = { getProducts, getProduct };
