// database/seed.js — Run: node seed.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
const { createClient } = require('@supabase/supabase-js');

console.log('✅ SUPABASE_URL:', process.env.SUPABASE_URL);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DOG_PRODUCTS = [
  { names: ['Adult Dry Dog Food', 'Puppy Dry Food', 'Senior Dog Food', 'Grain Free Dry Food', 'Baked Dry Food'], cat: 1, pet: 'dog' },
  { names: ['Wet Dog Food Pouch', 'Dog Food Gravy', 'Puppy Wet Food', 'Senior Wet Food', 'Premium Wet Food'], cat: 1, pet: 'dog' },
  { names: ['Training Treats', 'Dental Treats', 'Jerky Treats', 'Biscuits & Cookies', 'Bones & Chews'], cat: 2, pet: 'dog' },
  { names: ['Chew Toy', 'Squeaky Toy', 'Rope Toy', 'Ball & Fetch Toy', 'Plush Toy', 'Interactive Toy'], cat: 3, pet: 'dog' },
  { names: ['Dog Shampoo', 'Dog Conditioner', 'Dog Brush', 'Nail Clipper', 'Dog Deodorant', 'Grooming Kit'], cat: 4, pet: 'dog' },
  { names: ['Dog Collar', 'Dog Leash', 'Dog Harness', 'Dog Bed', 'Dog Bowl', 'Dog Carrier'], cat: 5, pet: 'dog' },
  { names: ['Multivitamin', 'Calcium Supplement', 'Dewormer', 'Tick & Flea Control', 'Joint Supplement'], cat: 6, pet: 'dog' },
];

const CAT_PRODUCTS = [
  { names: ['Adult Dry Cat Food', 'Kitten Dry Food', 'Senior Cat Food', 'Indoor Cat Food', 'Hairball Control'], cat: 7, pet: 'cat' },
  { names: ['Cat Wet Food Pouch', 'Tuna Cat Food', 'Chicken Cat Gravy', 'Kitten Wet Food', 'Premium Cat Food'], cat: 7, pet: 'cat' },
  { names: ['Creamy Cat Treats', 'Crunchy Cat Treats', 'Catnip Treats', 'Dental Cat Treats', 'Training Treats'], cat: 8, pet: 'cat' },
  { names: ['Cat Teaser', 'Cat Ball', 'Catnip Toy', 'Cat Tree', 'Cat Scratcher', 'Interactive Cat Toy'], cat: 9, pet: 'cat' },
  { names: ['Clumping Litter', 'Crystal Litter', 'Scented Litter', 'Litter Box', 'Litter Scoop'], cat: 10, pet: 'cat' },
  { names: ['Cat Shampoo', 'Cat Brush', 'Cat Nail Clipper', 'Cat Wipes', 'Grooming Glove'], cat: 11, pet: 'cat' },
  { names: ['Cat Multivitamin', 'Hairball Remedy', 'Cat Dewormer', 'Flea & Tick Spray', 'Cat Probiotic'], cat: 12, pet: 'cat' },
];

const BRANDS = [
  { id: 1, name: 'Royal Canin' }, { id: 2, name: 'Pedigree' }, { id: 3, name: 'Whiskas' },
  { id: 4, name: 'Drools' }, { id: 5, name: 'Farmina' }, { id: 6, name: 'Henlo' },
  { id: 7, name: 'Sheba' }, { id: 8, name: 'Felix' }, { id: 9, name: 'Purepet' },
  { id: 10, name: 'Kennel Kitchen' },
];

const SIZES = ['400g', '1kg', '1.5kg', '3kg', '6kg', '10kg', '15kg', '20kg', '500ml', '250ml', 'Pack of 10', 'Pack of 5'];

const IMAGES_DOG = [
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
  'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=400',
  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
  'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=400',
];

const IMAGES_CAT = [
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400',
  'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400',
  'https://images.unsplash.com/photo-1478098711619-5ab0b478d6e6?w=400',
  'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=400',
];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max) { return parseFloat((Math.random() * (max - min) + min).toFixed(2)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateProducts(count = 10000) {
  const products = [];
  const allTemplates = [...DOG_PRODUCTS, ...CAT_PRODUCTS];
  let skuCounter = 1000;

  for (let i = 0; i < count; i++) {
    const template = pick(allTemplates);
    const brand = pick(BRANDS);
    const productName = pick(template.names);
    const size = pick(SIZES);
    const originalPrice = randFloat(199, 4999);
    const discountPct = rand(0, 40) / 100;
    const price = parseFloat((originalPrice * (1 - discountPct)).toFixed(2));
    const images = template.pet === 'dog' ? IMAGES_DOG : IMAGES_CAT;

    products.push({
      name: `${brand.name} ${productName} ${size}`,
      description: `Premium quality ${productName.toLowerCase()} from ${brand.name}. Specially formulated for your ${template.pet}'s health and happiness. Made with high-quality ingredients. ${size} pack.`,
      price,
      original_price: discountPct > 0 ? originalPrice : null,
      stock: rand(0, 500),
      category_id: template.cat,
      brand_id: brand.id,
      sku: `PM-${skuCounter++}`,
      image_url: pick(images),
      pet_type: template.pet,
      rating: randFloat(3.0, 5.0),
      review_count: rand(5, 2500),
      tags: [template.pet, brand.name.toLowerCase().replace(' ', '-'), productName.split(' ')[0].toLowerCase()],
      is_active: true,
      is_featured: Math.random() < 0.05,
    });
  }
  return products;
}

async function seed() {
  console.log('🌱 Starting seed...');
  const products = generateProducts(10000);
  const BATCH = 500;

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    const { error } = await supabase.from('products').insert(batch);
    if (error) {
      console.error(`❌ Batch ${i / BATCH + 1} error:`, error.message);
      process.exit(1);
    }
    console.log(`✅ Inserted batch ${i / BATCH + 1}/${Math.ceil(products.length / BATCH)}`);
  }
  console.log('🎉 Seeding complete! 10,000 products inserted.');
}

seed().catch(console.error);
