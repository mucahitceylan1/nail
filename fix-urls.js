// fix-urls.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching client_photos...");
  const { data: photos, error } = await supabase.from('client_photos').select('id, image_url, storage_path, storage_bucket');
  
  if (error) {
    console.error("Error fetching photos:", error);
    return;
  }

  let updated = 0;
  for (const photo of photos) {
    if (photo.image_url && photo.image_url.includes('pub-a83798d313c54ad3ba39704bd82f3b28.r2.dev') || photo.image_url.includes('pub-44f14bc9131a4b94b9aec81b900309de.r2.dev')) {
      const bucket = photo.storage_bucket || 'appointment-media';
      const { data } = supabase.storage.from(bucket).getPublicUrl(photo.storage_path);
      
      const newUrl = data.publicUrl;
      console.log(`Fixing photo ${photo.id}: ${photo.image_url} -> ${newUrl}`);
      
      await supabase.from('client_photos').update({ image_url: newUrl }).eq('id', photo.id);
      updated++;
    }
  }
  
  console.log(`\nFixed ${updated} client_photos.\n`);
  
  console.log("Fetching public_gallery_assets...");
  const { data: assets, error: err2 } = await supabase.from('public_gallery_assets').select('id, image_url, storage_path');
  
  if (err2) {
    console.error("Error fetching gallery:", err2);
    return;
  }
  
  let updatedAssets = 0;
  for (const asset of assets) {
    if (asset.image_url && asset.image_url.includes('.r2.dev')) {
      const { data } = supabase.storage.from('site-gallery').getPublicUrl(asset.storage_path);
      const newUrl = data.publicUrl;
      console.log(`Fixing asset ${asset.id}: ${asset.image_url} -> ${newUrl}`);
      
      await supabase.from('public_gallery_assets').update({ image_url: newUrl }).eq('id', asset.id);
      updatedAssets++;
    }
  }
  
  console.log(`Fixed ${updatedAssets} gallery assets.\n`);
  console.log("Done.");
}

run();
