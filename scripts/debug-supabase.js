
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  // Try to query the table directly to see if it works
  console.log("🔍 Inspecting table 'activities'...");
  
  const { data, error } = await supabase
    .from('activities')
    .select('activity_id')
    .limit(1);

  if (error) {
    console.error("❌ Error querying 'activities':", error.message);
    if (error.code === 'PGRST204') {
        console.error("💡 PGRST204 means the table was not found in the exposed schema.");
        console.error("   - Did you run the SQL in the dashboard?");
        console.error("   - Is the table in the 'public' schema?");
        console.error("   - Did you click 'Run' on the SQL editor?");
    }
  } else {
    console.log("✅ Table found! Query successful.");
    console.log("Data sample:", data);
  }
}

inspectSchema();
