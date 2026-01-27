
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  console.log("🕵️‍♀️ Listing all tables in 'public' schema...");
  
  // This query hits the internal Postgres schema info
  // It works if the Service Role Key has permission (which it usually does)
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_schema, table_name')
    .eq('table_schema', 'public');

  // Note: The JS client might block direct access to system tables.
  // If this fails, we'll know the API is locked down tight.
  
  if (error) {
    console.error("❌ API Blocked:", error.message);
    
    // Fallback: Try to Insert a dummy row to 'activities' and see the specific error
    console.log("👉 Trying blind insert to 'activities'...");
    const { error: insertError } = await supabase
        .from('activities')
        .insert([{ activity_id: 999999999, name: 'Test' }]);
        
    if (insertError) {
        console.error("❌ Insert Failed:", insertError.message);
    } else {
        console.log("✅ Insert WORKED! The table exists!");
        // Clean up
        await supabase.from('activities').delete().eq('activity_id', 999999999);
    }
    
  } else {
    console.log("✅ Tables found:");
    console.table(data);
  }
}

listTables();
