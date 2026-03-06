import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

async function run(count = 50) {
  for (let i = 1; i <= count; i++) {
    const email = `mieter${i}@test.de`;

    const { error } = await supabase.auth.admin.createUser({
      email,
      password: 'Test123456!',
      email_confirm: true,
      user_metadata: {
        name: `Test Mieter ${i}`,
        telefon: '+491234567890',
      },
    });

    if (error) console.log('Fehler bei', email, error.message);
    else console.log('Erstellt:', email);
  }
}

run(50);