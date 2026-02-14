import { db } from './database'
import { randomUUID } from 'crypto'

export interface InvoiceItem {
  id: string
  invoiceId: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  clientAddress?: string
  platform: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  createdAt: string
  dueDate: string
  paymentMethod?: string
  notes?: string
  userId: string
}

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  createdAt: string
  userId: string
}

// Invoice operations
export const invoiceOperations = {
  // Get all invoices for a user
  getAll: (userId: string): Invoice[] => {
    const invoices = db.prepare(`
      SELECT * FROM invoices 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(userId) as Invoice[]

    return invoices.map(invoice => ({
      ...invoice,
      items: invoiceOperations.getItems(invoice.id)
    }))
  },

  // Get single invoice
  getById: (id: string, userId: string): Invoice | null => {
    const invoice = db.prepare(`
      SELECT * FROM invoices 
      WHERE id = ? AND user_id = ?
    `).get(id, userId) as Invoice | undefined

    if (!invoice) return null

    return {
      ...invoice,
      items: invoiceOperations.getItems(invoice.id)
    }
  },

  // Create invoice
  create: (data: Omit<Invoice, 'id' | 'createdAt'>): Invoice => {
    const id = randomUUID()
    const invoiceNumber = data.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`

    const stmt = db.prepare(`
      INSERT INTO invoices (
        id, invoice_number, client_name, client_email, client_phone, 
        client_address, platform, subtotal, tax, total, status, 
        due_date, payment_method, notes, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id, invoiceNumber, data.clientName, data.clientEmail, data.clientPhone,
      data.clientAddress, data.platform, data.subtotal, data.tax, data.total,
      data.status, data.dueDate, data.paymentMethod, data.notes, data.userId
    )

    // Insert invoice items
    if (data.items && data.items.length > 0) {
      const itemStmt = db.prepare(`
        INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, total)
        VALUES (?, ?, ?, ?, ?, ?)
      `)

      for (const item of data.items) {
        itemStmt.run(randomUUID(), id, item.description, item.quantity, item.unitPrice, item.total)
      }
    }

    return invoiceOperations.getById(id, data.userId)!
  },

  // Update invoice
  update: (id: string, userId: string, data: Partial<Invoice>): Invoice | null => {
    const current = invoiceOperations.getById(id, userId)
    if (!current) return null

    const updateFields = []
    const values = []

    if (data.clientName !== undefined) {
      updateFields.push('client_name = ?')
      values.push(data.clientName)
    }
    if (data.clientEmail !== undefined) {
      updateFields.push('client_email = ?')
      values.push(data.clientEmail)
    }
    if (data.clientPhone !== undefined) {
      updateFields.push('client_phone = ?')
      values.push(data.clientPhone)
    }
    if (data.clientAddress !== undefined) {
      updateFields.push('client_address = ?')
      values.push(data.clientAddress)
    }
    if (data.platform !== undefined) {
      updateFields.push('platform = ?')
      values.push(data.platform)
    }
    if (data.subtotal !== undefined) {
      updateFields.push('subtotal = ?')
      values.push(data.subtotal)
    }
    if (data.tax !== undefined) {
      updateFields.push('tax = ?')
      values.push(data.tax)
    }
    if (data.total !== undefined) {
      updateFields.push('total = ?')
      values.push(data.total)
    }
    if (data.status !== undefined) {
      updateFields.push('status = ?')
      values.push(data.status)
    }
    if (data.dueDate !== undefined) {
      updateFields.push('due_date = ?')
      values.push(data.dueDate)
    }
    if (data.paymentMethod !== undefined) {
      updateFields.push('payment_method = ?')
      values.push(data.paymentMethod)
    }
    if (data.notes !== undefined) {
      updateFields.push('notes = ?')
      values.push(data.notes)
    }

    if (updateFields.length > 0) {
      const stmt = db.prepare(`
        UPDATE invoices SET ${updateFields.join(', ')}
        WHERE id = ? AND user_id = ?
      `)
      stmt.run(...values, id, userId)
    }

    // Update items if provided
    if (data.items) {
      // Delete existing items
      db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(id)
      
      // Insert new items
      const itemStmt = db.prepare(`
        INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, total)
        VALUES (?, ?, ?, ?, ?, ?)
      `)

      for (const item of data.items) {
        itemStmt.run(randomUUID(), id, item.description, item.quantity, item.unitPrice, item.total)
      }
    }

    return invoiceOperations.getById(id, userId)
  },

  // Delete invoice
  delete: (id: string, userId: string): boolean => {
    const result = db.prepare(`
      DELETE FROM invoices WHERE id = ? AND user_id = ?
    `).run(id, userId)
    
    return result.changes > 0
  },

  // Get invoice items
  getItems: (invoiceId: string): InvoiceItem[] => {
    return db.prepare(`
      SELECT * FROM invoice_items WHERE invoice_id = ?
    `).all(invoiceId) as InvoiceItem[]
  }
}

// Client operations
export const clientOperations = {
  // Get all clients for a user
  getAll: (userId: string): Client[] => {
    return db.prepare(`
      SELECT * FROM clients 
      WHERE user_id = ? 
      ORDER BY name ASC
    `).all(userId) as Client[]
  },

  // Get single client
  getById: (id: string, userId: string): Client | null => {
    return db.prepare(`
      SELECT * FROM clients 
      WHERE id = ? AND user_id = ?
    `).get(id, userId) as Client | null
  },

  // Create client
  create: (data: Omit<Client, 'id' | 'createdAt'>): Client => {
    const id = randomUUID()
    
    const stmt = db.prepare(`
      INSERT INTO clients (id, name, email, phone, address, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    stmt.run(id, data.name, data.email, data.phone, data.address, data.userId)

    return clientOperations.getById(id, data.userId)!
  },

  // Update client
  update: (id: string, userId: string, data: Partial<Client>): Client | null => {
    const current = clientOperations.getById(id, userId)
    if (!current) return null

    const updateFields = []
    const values = []

    if (data.name !== undefined) {
      updateFields.push('name = ?')
      values.push(data.name)
    }
    if (data.email !== undefined) {
      updateFields.push('email = ?')
      values.push(data.email)
    }
    if (data.phone !== undefined) {
      updateFields.push('phone = ?')
      values.push(data.phone)
    }
    if (data.address !== undefined) {
      updateFields.push('address = ?')
      values.push(data.address)
    }

    if (updateFields.length > 0) {
      const stmt = db.prepare(`
        UPDATE clients SET ${updateFields.join(', ')}
        WHERE id = ? AND user_id = ?
      `)
      stmt.run(...values, id, userId)
    }

    return clientOperations.getById(id, userId)
  },

  // Delete client
  delete: (id: string, userId: string): boolean => {
    const result = db.prepare(`
      DELETE FROM clients WHERE id = ? AND user_id = ?
    `).run(id, userId)
    
    return result.changes > 0
  }
}
