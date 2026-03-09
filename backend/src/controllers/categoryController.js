const { supabase } = require('../config/supabase');

const getCategories = async (req, res, next) => {
  try {
    const { pet_type } = req.query;
    let query = supabase.from('categories').select('*').eq('is_active', true).order('sort_order');
    if (pet_type) query = query.or(`pet_type.eq.${pet_type},pet_type.eq.both`);
    const { data, error } = await query;
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, data: { categories: data } });
  } catch (err) { next(err); }
};

const getBrands = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('brands').select('*').eq('is_active', true).order('name');
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, data: { brands: data } });
  } catch (err) { next(err); }
};

module.exports = { getCategories, getBrands };
