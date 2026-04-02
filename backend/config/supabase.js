import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Example Insert Helper
export const supabaseInsert = async (table, data) => {
    const { data: result, error } = await supabase.from(table).insert([data]).select();
    if (error) throw error;
    return result;
};

// Example Fetch Helper
export const supabaseFetch = async (table, query = {}) => {
    let { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    return data;
};
