"use client";

import { supabase } from './supabase';

export async function testSupabaseConnection() {
  try {
    console.log('[Supabase] Checking configuration...');
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase configuration');
    }
    
    console.log('[Supabase] Configuration found, testing API connection...');
    
    // First try a simple health check
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' });
    
    if (error) {
      console.error('[Supabase] Connection error:', error.message);
      return false;
    }
    
    console.log('[Supabase] Connection successful');
    return true;
  } catch (error) {
    console.error('[Supabase] Critical error:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
} 