const { GarminConnect } = require('garmin-connect');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env.local' });

const email = process.env.GARMIN_EMAIL;
const password = process.env.GARMIN_PASSWORD;
const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

(async () => {
  try {
    const gc = new GarminConnect({ username: email, password: password });
    await gc.login();
    console.log('✅ Garmin Login Successful!');

    let allActivities = [];
    let start = 0;
    const limit = 100; // Garmin default/safe limit
    let keepFetching = true;

    console.log('📥 Starting bulk download...');

    while (keepFetching) {
      console.log(`Fetching records ${start} to ${start + limit}...`);
      const activities = await gc.getActivities(start, limit);
      
      if (activities.length === 0) {
        keepFetching = false;
      } else {
        allActivities = allActivities.concat(activities);
        start += limit;
        // Small delay to be nice to API
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    const filename = path.join(DATA_DIR, 'garmin_activities_all.json');
    fs.writeFileSync(filename, JSON.stringify(allActivities, null, 2));
    
    console.log(`\n🏁 Done! Saved ${allActivities.length} activities to ${filename}`);

  } catch (error) {
    console.error('❌ Sync Error:', error);
  }
})();
