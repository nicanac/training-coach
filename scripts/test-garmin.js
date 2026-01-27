const { GarminConnect } = require('garmin-connect');
require('dotenv').config({ path: '../.env.local' });

const email = process.env.GARMIN_EMAIL;
const password = process.env.GARMIN_PASSWORD;

(async () => {
  try {
    const gc = new GarminConnect({ username: email, password: password });
    await gc.login();
    console.log('✅ Garmin Login Successful!');

    const profile = await gc.getUserProfile();
    console.log(`👤 Connected as: ${profile.displayName}`);

    const today = new Date();
    // Get last 5 activities
    const activities = await gc.getActivities(0, 5);
    
    console.log('\n🏃 Recent Activities:');
    activities.forEach(activity => {
      console.log(`- [${activity.startTimeLocal}] ${activity.activityName} (${(activity.distance / 1000).toFixed(2)} km)`);
    });

  } catch (error) {
    console.error('❌ Garmin Sync Error:', error);
  }
})();
