
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Force re-auth/refresh options
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

const DATA_FILE = path.join(__dirname, '../data/garmin_activities_all.json');

async function uploadActivities() {
  console.log("🔄 Initializing upload...");
  
  if (!fs.existsSync(DATA_FILE)) {
    console.error('❌ Data file not found:', DATA_FILE);
    return;
  }

  const rawData = fs.readFileSync(DATA_FILE, 'utf8');
  const activities = JSON.parse(rawData);
  console.log(`📂 Loaded ${activities.length} activities.`);

  const batchSize = 100;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < activities.length; i += batchSize) {
    const batch = activities.slice(i, i + batchSize).map(a => ({
      activity_id: a.activityId,
      name: a.activityName,
      type: a.activityType.typeKey,
      start_time: a.startTimeLocal,
      distance: a.distance,
      duration: a.duration,
      avg_hr: a.averageHR,
      max_hr: a.maxHR,
      calories: a.calories,
      raw_data: a 
    }));

    const { error } = await supabase
      .from('activities')
      .upsert(batch, { onConflict: 'activity_id' });

    if (error) {
      console.error(`❌ Batch ${i} failed:`, error.message);
      errorCount++;
    } else {
      console.log(`✅ Uploaded ${i} - ${Math.min(i + batchSize, activities.length)}`);
      successCount++;
    }
    
    // Tiny delay to prevent rate limits
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log('🏁 Final Status:');
  console.log(`- Batches Success: ${successCount}`);
  console.log(`- Batches Failed: ${errorCount}`);
}

uploadActivities();
