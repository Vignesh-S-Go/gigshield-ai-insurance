import dotenv from 'dotenv';
dotenv.config();
console.log('PORT:', process.env.PORT);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
