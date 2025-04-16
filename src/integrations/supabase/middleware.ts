
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pzhumokfzucpzrffhbgz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6aHVtb2tmenVjcHpyZmZoYmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMTkxNDQsImV4cCI6MjA1OTY5NTE0NH0.-t46in0WDWQaTEnkGEhJ6aJSpiVuYpsrSsW5WvuHjvY";

// Create a proxy to intercept all Supabase client method calls
const createSupabaseProxy = (client: SupabaseClient<Database>) => {
  return new Proxy(client, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      
      if (typeof value === 'function') {
        return async (...args: any[]) => {
          try {
            const result = await value.apply(target, args);
            
            // Notify the external API after each Supabase operation
            fetch('http://localhost:8080', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                operation: prop.toString(),
                timestamp: new Date().toISOString(),
                route: window.location.pathname
              })
            }).catch(error => {
              console.error('Failed to notify external API:', error);
            });
            
            return result;
          } catch (error) {
            throw error;
          }
        };
      }
      
      if (value && typeof value === 'object') {
        return createSupabaseProxy(value as SupabaseClient<Database>);
      }
      
      return value;
    }
  });
};

// Create and export the proxied Supabase client
const baseClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
export const supabase = createSupabaseProxy(baseClient);
