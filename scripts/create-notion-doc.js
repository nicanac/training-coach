const fs = require('fs');

const API_KEY = fs.readFileSync('C:\\Users\\bruye\\.config\\notion\\api_key', 'utf8').trim();

async function createPage() {
  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      parent: { page_id: '178e6d8e-89bf-8039-ab30-e77b7f36e067' },
      properties: {
        title: {
          title: [
            {
              text: {
                content: 'Training Coach - Project Docs'
              }
            }
          ]
        }
      },
      children: [
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: 'Project Overview' } }]
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              { 
                text: { 
                  content: 'AI-powered training dashboard for XTri preparation. Built with Next.js 16, Supabase, and Tailwind CSS.' 
                } 
              }
            ]
          }
        },
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: 'Features Completed' } }]
          }
        },
        {
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [{ text: { content: 'Garmin sync (6000+ activities)' } }],
            checked: true
          }
        },
        {
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [{ text: { content: 'Supabase database setup' } }],
            checked: true
          }
        },
        {
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [{ text: { content: 'Dashboard UI' } }],
            checked: true
          }
        },
        {
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [{ text: { content: 'Dynamic training plan with fatigue analysis' } }],
            checked: true
          }
        },
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: 'Roadmap' } }]
          }
        },
        {
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [{ text: { content: 'Ollama AI integration' } }],
            checked: false
          }
        },
        {
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [{ text: { content: 'Analytics page' } }],
            checked: false
          }
        },
        {
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [{ text: { content: 'Deploy to Vercel' } }],
            checked: false
          }
        }
      ]
    })
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ Notion page created!');
    console.log(`🔗 ${data.url}`);
  } else {
    console.error('❌ Error:', data);
  }
}

createPage();
