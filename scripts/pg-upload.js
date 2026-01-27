
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env.local' });

const projectRef = 'oywluhseaawgzntpudgr';
const password = process.env.GARMIN_PASSWORD;
const directString = `postgres://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;

const DATA_FILE = path.join(__dirname, '../data/garmin_activities_all.json');

async function uploadDirectly() {
  console.log("🔌 Connecting via Postgres...");
  
  const client = new Client({
    connectionString: directString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("✅ Connected!");

    if (!fs.existsSync(DATA_FILE)) {
      console.error('❌ Data file not found');
      return;
    }

    const activities = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    console.log(`📂 Processing ${activities.length} activities...`);

    let success = 0;
    const batchSize = 100;

    for (let i = 0; i < activities.length; i += batchSize) {
      const batch = activities.slice(i, i + batchSize);
      
      const values = [];
      const params = [];
      let paramIndex = 1;

      batch.forEach(a => {
        values.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
        
        params.push(
            a.activityId,
            a.activityName || 'Unknown',
            a.activityType.typeKey,
            a.startTimeLocal,
            a.distance,
            a.duration,
            Math.round(a.averageHR) || null,
            Math.round(a.maxHR) || null,
            Math.round(a.calories) || null,
            a // Raw JSON
        );
      });

      const query = `
        INSERT INTO activities (activity_id, name, type, start_time, distance, duration, avg_hr, max_hr, calories, raw_data)
        VALUES ${values.join(',')}
        ON CONFLICT (activity_id) DO NOTHING;
      `;

      await client.query(query, params);
      success += batch.length;
      console.log(`✅ Inserted ${Math.min(success, activities.length)}`);
    }

    console.log("🏁 DONE! All data uploaded.");

  } catch (err) {
    console.error("❌ DB Error:", err);
  } finally {
    await client.end();
  }
}

uploadDirectly();
