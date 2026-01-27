
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/garmin_activities_all.json');

function analyze() {
  const rawData = fs.readFileSync(DATA_FILE, 'utf8');
  const activities = JSON.parse(rawData);

  // Filter for 2026 (current season)
  const currentYearActivities = activities.filter(a => a.startTimeLocal.startsWith('2025') || a.startTimeLocal.startsWith('2026'));
  
  const stats = {
    total_activities: currentYearActivities.length,
    by_type: {},
    total_distance: 0,
    total_duration: 0,
    recent_load: [] // Last 4 weeks
  };

  currentYearActivities.forEach(a => {
    const type = a.activityType.typeKey;
    stats.by_type[type] = (stats.by_type[type] || 0) + 1;
    stats.total_distance += a.distance;
    stats.total_duration += a.duration;
  });

  console.log("📊 **Training Analysis (2025-2026 Season)**");
  console.log(`- **Total Sessions:** ${stats.total_activities}`);
  console.log(`- **Total Distance:** ${(stats.total_distance / 1000).toFixed(1)} km`);
  console.log(`- **Total Time:** ${(stats.total_duration / 3600).toFixed(1)} hours`);
  
  console.log("\n🏃 **Activity Breakdown:**");
  Object.entries(stats.by_type).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`);
  });

  // Calculate "Run" specific stats for the XTri goal
  const runs = currentYearActivities.filter(a => a.activityType.typeKey === 'running');
  const totalRunDist = runs.reduce((sum, r) => sum + r.distance, 0);
  console.log(`\n🏔️ **XTri Prep (Running):**`);
  console.log(`  - Total Run Volume: ${(totalRunDist/1000).toFixed(1)} km`);
  console.log(`  - Avg Run Distance: ${(totalRunDist/1000 / runs.length || 0).toFixed(1)} km`);

}

analyze();
