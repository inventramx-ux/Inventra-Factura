import dotenv from 'dotenv';
import { optimizePublication } from './lib/ai.js'; // Note: Node might need .js or help with TS

dotenv.config({ path: '.env.local' });

async function test() {
  console.log('Testing Groq Optimization...');
  try {
    const result = await optimizePublication(
      "iPhone 15 Pro",
      "Mercado Libre",
      {
        description: "iPhone 15 Pro de 128GB, color titanio natural. Poco uso.",
        price: "18000",
        condition: "Usado",
        brand: "Apple"
      },
      {
        description: true,
        price: true,
        condition: true,
        brand: true
      },
      "Profesional",
      false,
      "short"
    );
    console.log('Success!');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

test();
