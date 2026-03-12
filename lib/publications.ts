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
    tags?: string
    enabled_fields?: Record<string, boolean>
  }
  platform?: string
  optimized_content: {
    title?: string
    description?: string
    suggestedPrice?: string
    hashtags?: string[]
    modelUsed?: string
  }
  created_at: string
}

export const publicationOperations = {
  // Get all publications for a user
  getAll: async (userId: string) => {
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
  },

  // Get single publication
  getById: async (id: string, userId: string) => {
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
  },

  // Create publication
  create: async (userId: string, name: string) => {
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
  },

  // Update publication
  update: async (id: string, userId: string, updates: Partial<Publication>) => {
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
  },

  // Delete publication
  delete: async (id: string, userId: string) => {
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
  }
}
