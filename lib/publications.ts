import { supabase } from './supabase'

export interface Publication {
  id: string
  user_id: string
  name: string
  product_data: {
    description?: string
    price?: string
    imageUrl?: string
    msi?: boolean
    shipping?: 'free' | 'buyer'
    warranty?: string
    condition?: 'new' | 'used'
    brand?: string
    model?: string
    category?: string
    stock?: string
    style?: string
    length?: 'short' | 'medium' | 'long'
    enabled_fields?: Record<string, boolean>
  }
  platform?: string
  optimized_content: {
    title?: string
    description?: string
    suggestedPrice?: string
    modelUsed?: string
    optimizationState?: string
  }
  created_at: string
}

// Basic retry logic for transient network errors
const withRetry = async <T>(operation: () => Promise<T>, maxRetries = 2, delay = 1000): Promise<T> => {
  let lastError: any;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const isNetworkError = error.message?.toLowerCase().includes('fetch') ||
        error.message?.toLowerCase().includes('network') ||
        error.status >= 500;

      if (isNetworkError && i < maxRetries) {
        console.warn(`Transient error detected, retrying (${i + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

export const publicationOperations = {
  // Get all publications for a user
  getAll: async (userId: string) => {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error (getAll):', error.message, error.details)
        throw new Error(`No se pudieron cargar las publicaciones: ${error.message}`)
      }
      return data as Publication[]
    });
  },

  // Get single publication
  getById: async (id: string, userId: string) => {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Supabase error (getById):', error.message)
        throw new Error(`No se pudo cargar la publicación: ${error.message}`)
      }
      return data as Publication
    });
  },

  // Create publication
  create: async (userId: string, name: string) => {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('publications')
        .insert({
          user_id: userId,
          name: name,
          product_data: {},
          optimized_content: {}
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error (create):', error.message)
        throw new Error(`No se pudo crear la publicación: ${error.message}. ¿Ejecutaste el script SQL?`)
      }
      return data as Publication
    });
  },

  // Update publication
  update: async (id: string, userId: string, updates: Partial<Publication>) => {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('publications')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Supabase error (update):', error.message)
        throw new Error(`No se pudo actualizar: ${error.message}`)
      }
      return data as Publication
    });
  },

  // Delete publication
  delete: async (id: string, userId: string) => {
    return withRetry(async () => {
      const { error } = await supabase
        .from('publications')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('Supabase error (delete):', error.message)
        throw new Error(`No se pudo borrar: ${error.message}`)
      }
      return true
    });
  },

  // Get usage stats strictly for the last 30 days
  getUsageStats: async (userId: string) => {
    return withRetry(async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, count, error } = await supabase
        .from('publications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true }); // Oldest first

      if (error) {
        console.error('Supabase error (getUsageStats):', error.message);
        throw new Error(`No se pudo obtener el uso: ${error.message}`);
      }

      const totalCount = count || 0;
      let daysUntilReset = 0;

      if (totalCount > 0 && data && data.length > 0) {
        const oldestDate = new Date(data[0].created_at);
        const resetDate = new Date(oldestDate);
        resetDate.setDate(resetDate.getDate() + 30);
        
        const now = new Date();
        const diffTime = resetDate.getTime() - now.getTime();
        daysUntilReset = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }

      return { count: totalCount, daysUntilReset };
    });
  }
}
