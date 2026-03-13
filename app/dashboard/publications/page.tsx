'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Image as ImageIcon,
  ExternalLink,
  ShoppingBag,
  Store,
  Globe,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { publicationOperations, Publication } from '@/lib/publications';

const platforms = [
  { id: 'mercadolibre', name: 'Mercado Libre', icon: Store },
  { id: 'etsy', name: 'Etsy', icon: ShoppingBag },
  { id: 'amazon', name: 'Amazon', icon: Globe },
  { id: 'shopify', name: 'Shopify', icon: ShoppingBag },
  { id: 'custom', name: 'Personalizado', icon: Plus },
];

export default function PublicationsPage() {
  const { user } = useUser();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPubName, setNewPubName] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<Record<string, boolean>>({});
  const [isOptimizing, setIsOptimizing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Local state for debounced text fields
  const [localFields, setLocalFields] = useState<Record<string, Record<string, string>>>({});
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Initialize local fields when a publication is expanded
  useEffect(() => {
    if (expandedId) {
      const pub = publications.find(p => p.id === expandedId);
      if (pub && !localFields[expandedId]) {
        setLocalFields(prev => ({
          ...prev,
          [expandedId]: {
            name: pub.name || '',
            description: pub.product_data.description || '',
            tags: pub.product_data.tags || '',
            price: pub.product_data.price || '',
            brand: pub.product_data.brand || '',
            stock: pub.product_data.stock || '',
            model: pub.product_data.model || '',
            category: pub.product_data.category || '',
            warranty: pub.product_data.warranty || '',
          }
        }));
      }
    }
  }, [expandedId, publications]);

  // Sync local fields when publications change externally (e.g. after optimize)
  useEffect(() => {
    setLocalFields(prev => {
      const next = { ...prev };
      for (const pub of publications) {
        if (next[pub.id]) {
          const current = next[pub.id];
          // Only update fields that the user is NOT actively editing (no pending debounce timer)
          const timerKey = pub.id;
          if (!debounceTimers.current[timerKey + '_name'] && current.name !== pub.name) {
            next[pub.id] = { ...current, name: pub.name || '' };
          }
        }
      }
      return next;
    });
  }, [publications]);

  const handleLocalChange = useCallback((pubId: string, field: string, value: string) => {
    // Update local state immediately for responsive typing
    setLocalFields(prev => ({
      ...prev,
      [pubId]: { ...(prev[pubId] || {}), [field]: value }
    }));

    // Clear previous debounce timer for this field
    const timerKey = `${pubId}_${field}`;
    if (debounceTimers.current[timerKey]) {
      clearTimeout(debounceTimers.current[timerKey]);
    }

    // Set new debounce timer
    debounceTimers.current[timerKey] = setTimeout(() => {
      const pub = publications.find(p => p.id === pubId);
      if (!pub) return;

      if (field === 'name') {
        handleUpdate(pubId, { name: value });
      } else {
        handleUpdate(pubId, {
          product_data: { ...pub.product_data, [field]: value }
        });
      }
      delete debounceTimers.current[timerKey];
    }, 600);
  }, [publications]);

  // Helper to get local field value
  const getLocal = (pubId: string, field: string, fallback: string = '') => {
    return localFields[pubId]?.[field] ?? fallback;
  };

  useEffect(() => {
    if (user?.id) {
      loadPublications();
    }
  }, [user?.id]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const loadPublications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await publicationOperations.getAll(user!.id);
      setPublications(data);
    } catch (err: any) {
      console.error('Error loading publications:', err);
      setError(err.message || 'Error al cargar las publicaciones.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newPubName.trim()) return;
    try {
      setError(null);
      const newPub = await publicationOperations.create(user!.id, newPubName);
      setPublications([newPub, ...publications]);
      setNewPubName('');
      setIsCreateModalOpen(false);
      setExpandedId(newPub.id);
      setSuccess('Publicación creada con éxito.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error creating publication:', err);
      setError(err.message || 'Error al crear la publicación.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await publicationOperations.delete(id, user!.id);
      setPublications(publications.filter(p => p.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (error) {
      console.error('Error deleting publication:', error);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Publication>) => {
    try {
      const updated = await publicationOperations.update(id, user!.id, updates);
      setPublications(publications.map(p => p.id === id ? updated : p));
    } catch (error) {
      console.error('Error updating publication:', error);
    }
  };

  const handleOptimize = async (pub: Publication) => {
    setIsOptimizing(pub.id);
    setError(null);
    
    try {
      const response = await fetch('/api/publications/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pub.name,
          platform: pub.platform,
          product_data: pub.product_data,
          enabled_fields: pub.product_data.enabled_fields || {
            description: true,
            price: true,
            msi: true,
            shipping: true,
            warranty: true,
            condition: true,
            brand: true,
            model: true,
            category: true,
            stock: true,
            tags: true
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al optimizar con IA.');
      }

      await handleUpdate(pub.id, { optimized_content: data });
      setSuccess('¡Publicación optimizada con éxito!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error in optimization flow:', err);
      setError(err.message || 'Error al conectar con la IA.');
    } finally {
      setIsOptimizing(null);
    }
  };

  const toggleField = (pub: Publication, field: string) => {
    const currentFields = pub.product_data.enabled_fields || {
      description: true,
      price: true,
      msi: true,
      shipping: true,
      warranty: true,
      condition: true,
      brand: true,
      model: true,
      category: true,
      stock: true,
      tags: true
    };
    handleUpdate(pub.id, {
      product_data: {
        ...pub.product_data,
        enabled_fields: {
          ...currentFields,
          [field]: !currentFields[field]
        }
      }
    });
  };

  const isFieldEnabled = (pub: Publication, field: string) => {
    if (!pub.product_data.enabled_fields) return true;
    return pub.product_data.enabled_fields[field] !== false;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Publicaciones</h1>
          <p className="text-gray-400 mt-1">Crea y optimiza tus publicaciones para diferentes marketplaces.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-white text-black hover:bg-gray-200">
          <Plus className="mr-2 h-4 w-4" /> Nueva Publicación
        </Button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Éxito</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-400">Cargando publicaciones...</p>
        </div>
      ) : publications.length === 0 ? (
        <Card className="bg-[#0a0a0a] border-white/10 p-12 text-center">
          <div className="flex justify-center mb-4">
            <ShoppingBag className="h-12 w-12 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No hay publicaciones</h2>
          <p className="text-gray-400 mb-6">Comienza creando tu primera publicación para optimizarla con IA.</p>
          <Button onClick={() => setIsCreateModalOpen(true)} variant="outline" className="border-white/10 text-white hover:bg-white/5">
            Crear Publicación
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {publications.map((pub) => (
            <motion.div
              key={pub.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-[#111111] border rounded-xl transition-all duration-300 ${expandedId === pub.id ? 'border-blue-500/30 ring-1 ring-blue-500/10' : 'border-white/5 hover:border-white/10'}`}
            >
              <div className="p-4 flex items-center justify-between cursor-pointer group" onClick={() => setExpandedId(expandedId === pub.id ? null : pub.id)}>
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                    {pub.product_data.imageUrl ? (
                      <img src={pub.product_data.imageUrl} alt={pub.name} className="h-full w-full object-cover" />
                    ) : (
                      <ShoppingBag className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{pub.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {pub.platform && (
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-none capitalize text-[10px]">
                          {pub.platform}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(pub.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-gray-500 hover:text-red-400 hover:bg-red-400/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(pub.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {expandedId === pub.id ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
                </div>
              </div>

              <AnimatePresence>
                {expandedId === pub.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Separator className="bg-white/5" />
                    <div className="p-6 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Edit Section */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Configuración de la Publicación</h4>
                            
                            <div className="space-y-6">
                              {/* 1. Imagen (OBLIGATORIA) */}
                              <div className="relative">
                                <Label 
                                  htmlFor="file-upload" 
                                  className="p-8 rounded-xl border-2 border-dashed border-blue-500/20 bg-blue-500/5 group hover:border-blue-500/40 transition-all text-center flex flex-col items-center gap-4 cursor-pointer w-full"
                                >
                                  <span className="text-blue-400 font-bold text-xs uppercase mb-1">1. Foto del Producto (Obligatorio)</span>
                                  <div className="h-40 w-40 rounded-xl border border-white/10 bg-black/40 flex items-center justify-center overflow-hidden shadow-2xl group-hover:scale-105 transition-transform">
                                    {pub.product_data.imageUrl ? (
                                      <img src={pub.product_data.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="flex flex-col items-center gap-2">
                                        <ImageIcon className="text-gray-700 h-12 w-12" />
                                        <span className="text-[10px] text-gray-500 font-medium">Pulsa para subir</span>
                                      </div>
                                    )}
                                  </div>
                                </Label>
                                <Input 
                                  id="file-upload"
                                  type="file" 
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        handleUpdate(pub.id, { 
                                          product_data: { ...pub.product_data, imageUrl: reader.result as string } 
                                        });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </div>

                              {/* 2. Título y Descripción */}
                              <div className="space-y-4">
                                <div className="grid gap-2">
                                  <Label className="text-gray-400 text-xs">Título del Producto</Label>
                                  <Input 
                                    value={getLocal(pub.id, 'name', pub.name)}
                                    onChange={(e) => handleLocalChange(pub.id, 'name', e.target.value)}
                                    className="bg-black/60 border-white/10 text-white font-medium"
                                  />
                                </div>

                                <div className="grid gap-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-gray-400 text-xs">Descripción Detallada</Label>
                                    <input 
                                      type="checkbox" 
                                      checked={isFieldEnabled(pub, 'description')}
                                      onChange={() => toggleField(pub, 'description')}
                                      className="h-3 w-3 accent-blue-500"
                                    />
                                  </div>
                                  <textarea 
                                    value={getLocal(pub.id, 'description', pub.product_data.description || '')}
                                    onChange={(e) => handleLocalChange(pub.id, 'description', e.target.value)}
                                    className="min-h-[100px] w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500/30"
                                    placeholder="Describe tu producto..."
                                  />
                                </div>

                                <div className="grid gap-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-gray-400 text-xs">Tags SEO (Keywords)</Label>
                                    <input 
                                      type="checkbox" 
                                      checked={isFieldEnabled(pub, 'tags')}
                                      onChange={() => toggleField(pub, 'tags')}
                                      className="h-3 w-3 accent-blue-500"
                                    />
                                  </div>
                                  <Input 
                                    value={getLocal(pub.id, 'tags', pub.product_data.tags || '')}
                                    onChange={(e) => handleLocalChange(pub.id, 'tags', e.target.value)}
                                    placeholder="Ej: vintage, algodon, oferta, verano"
                                    className="bg-black/60 border-white/10 text-white italic"
                                  />
                                </div>
                              </div>

                              {/* 3. Campos Opcionales (Colapsable) */}
                              <div className="pt-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setShowAdvanced(prev => ({ ...prev, [pub.id]: !prev[pub.id] }))}
                                  className="w-full border border-white/5 bg-white/[0.02] text-gray-500 hover:text-gray-300 text-[10px] uppercase tracking-widest py-1"
                                >
                                  {showAdvanced[pub.id] ? 'Ocultar campos extra' : 'Mostrar campos extra (Opcional)'}
                                </Button>

                                <AnimatePresence>
                                  {showAdvanced[pub.id] && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden pt-4 space-y-4"
                                    >
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                          <div className="flex justify-between items-center"><Label className="text-[10px] text-gray-500">Precio</Label><input type="checkbox" checked={isFieldEnabled(pub, 'price')} onChange={() => toggleField(pub, 'price')} className="h-2 w-2 accent-blue-500"/></div>
                                          <Input value={getLocal(pub.id, 'price', pub.product_data.price || '')} onChange={(e) => handleLocalChange(pub.id, 'price', e.target.value)} placeholder="0.00" className="h-8 bg-black/40 border-white/5 text-xs text-white"/>
                                        </div>
                                        <div className="grid gap-2">
                                          <Label className="text-[10px] text-gray-500">Plataforma</Label>
                                          <select value={pub.platform || ''} onChange={(e) => handleUpdate(pub.id, { platform: e.target.value })} className="h-8 bg-black/40 border border-white/5 text-xs text-white rounded-md px-2 w-full appearance-none">
                                            <option value="" className="bg-[#111] text-white">Marketplace</option>
                                            {platforms.map(p => (<option key={p.id} value={p.id} className="bg-[#111] text-white">{p.name}</option>))}
                                          </select>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                          <div className="flex justify-between items-center"><Label className="text-[10px] text-gray-500">Marca</Label><input type="checkbox" checked={isFieldEnabled(pub, 'brand')} onChange={() => toggleField(pub, 'brand')} className="h-2 w-2 accent-blue-500"/></div>
                                          <Input value={getLocal(pub.id, 'brand', pub.product_data.brand || '')} onChange={(e) => handleLocalChange(pub.id, 'brand', e.target.value)} placeholder="Ej. Apple" className="h-8 bg-black/40 border-white/5 text-xs text-white"/>
                                        </div>
                                        <div className="grid gap-2">
                                          <div className="flex justify-between items-center"><Label className="text-[10px] text-gray-500">Stock</Label><input type="checkbox" checked={isFieldEnabled(pub, 'stock')} onChange={() => toggleField(pub, 'stock')} className="h-2 w-2 accent-blue-500"/></div>
                                          <Input value={getLocal(pub.id, 'stock', pub.product_data.stock || '')} onChange={(e) => handleLocalChange(pub.id, 'stock', e.target.value)} placeholder="Q" className="h-8 bg-black/40 border-white/5 text-xs text-white"/>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                          <div className="flex justify-between items-center"><Label className="text-[10px] text-gray-500">Modelo</Label><input type="checkbox" checked={isFieldEnabled(pub, 'model')} onChange={() => toggleField(pub, 'model')} className="h-2 w-2 accent-blue-500"/></div>
                                          <Input value={getLocal(pub.id, 'model', pub.product_data.model || '')} onChange={(e) => handleLocalChange(pub.id, 'model', e.target.value)} placeholder="Ej. iPhone 15" className="h-8 bg-black/40 border-white/5 text-xs text-white"/>
                                        </div>
                                        <div className="grid gap-2">
                                          <div className="flex justify-between items-center"><Label className="text-[10px] text-gray-500">Categoría</Label><input type="checkbox" checked={isFieldEnabled(pub, 'category')} onChange={() => toggleField(pub, 'category')} className="h-2 w-2 accent-blue-500"/></div>
                                          <Input value={getLocal(pub.id, 'category', pub.product_data.category || '')} onChange={(e) => handleLocalChange(pub.id, 'category', e.target.value)} placeholder="Ej. Electrónica" className="h-8 bg-black/40 border-white/5 text-xs text-white"/>
                                        </div>
                                      </div>

                                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-3">
                                        <div className="flex items-center justify-between">
                                          <Label className="text-[10px] text-gray-400">Condición</Label>
                                          <div className="flex gap-2">
                                            <Badge onClick={() => handleUpdate(pub.id, { product_data: { ...pub.product_data, condition: 'new' } })} className={`text-[9px] px-2 py-0 cursor-pointer ${pub.product_data.condition === 'new' ? 'bg-blue-600' : 'bg-transparent border border-white/10 text-gray-600'}`}>Nuevo</Badge>
                                            <Badge onClick={() => handleUpdate(pub.id, { product_data: { ...pub.product_data, condition: 'used' } })} className={`text-[9px] px-2 py-0 cursor-pointer ${pub.product_data.condition === 'used' ? 'bg-blue-600' : 'bg-transparent border border-white/10 text-gray-600'}`}>Usado</Badge>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                          <Label className="text-[10px] text-gray-400">Envío Gratis</Label>
                                          <input 
                                            type="checkbox" 
                                            checked={pub.product_data.shipping === 'free'} 
                                            onChange={(e) => handleUpdate(pub.id, { product_data: { ...pub.product_data, shipping: e.target.checked ? 'free' : 'buyer' } })}
                                            className="h-3 w-3 accent-blue-500"
                                          />
                                        </div>

                                        <div className="flex items-center justify-between">
                                          <Label className="text-[10px] text-gray-400">Meses Sin Intereses (MSI)</Label>
                                          <input 
                                            type="checkbox" 
                                            checked={pub.product_data.msi || false} 
                                            onChange={(e) => handleUpdate(pub.id, { product_data: { ...pub.product_data, msi: e.target.checked } })}
                                            className="h-3 w-3 accent-blue-500"
                                          />
                                        </div>

                                        <div className="grid gap-2">
                                          <div className="flex justify-between items-center">
                                            <Label className="text-[10px] text-gray-400">Meses de Garantía</Label>
                                            <input 
                                              type="checkbox" 
                                              checked={isFieldEnabled(pub, 'warranty')}
                                              onChange={() => toggleField(pub, 'warranty')}
                                              className="h-3 w-3 accent-blue-500"
                                            />
                                          </div>
                                          <Input 
                                            value={getLocal(pub.id, 'warranty', pub.product_data.warranty || '')}
                                            onChange={(e) => handleLocalChange(pub.id, 'warranty', e.target.value)}
                                            placeholder="Ej. 12 meses"
                                            className="h-8 bg-black/40 border-white/10 text-xs text-white"
                                          />
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>

                            <Button 
                              onClick={() => handleOptimize(pub)} 
                              disabled={isOptimizing === pub.id || !pub.product_data.imageUrl}
                              className={`w-full h-12 text-md font-bold transition-all ${!pub.product_data.imageUrl ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'}`}
                            >
                              {isOptimizing === pub.id ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Optimizando...</>
                              ) : (
                                <><Sparkles className="mr-2 h-5 w-5" /> Optimizar Publicación</>
                              )}
                            </Button>
                            {!pub.product_data.imageUrl && (
                              <p className="text-[10px] text-red-400/60 text-center">Debes subir una foto para poder generar.</p>
                            )}
                          </div>
                        {/* Result Section */}
                        <div className="space-y-6">
                          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contenido Optimizado</h4>
                          
                          {pub.optimized_content.title ? (
                            <div className="space-y-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 animate-fade-in">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-[10px] text-blue-400 uppercase font-bold">Título Ganador</Label>
                                  {pub.optimized_content.modelUsed && (
                                    <Badge variant="outline" className="text-[8px] py-0 px-1.5 border-blue-500/30 text-blue-400/70 bg-blue-500/5">
                                      AI: {pub.optimized_content.modelUsed}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-white text-sm font-medium leading-tight">{pub.optimized_content.title}</p>
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-[10px] text-blue-400 uppercase font-bold">Descripción Estratégica</Label>
                                <p className="text-gray-400 text-xs leading-relaxed">{pub.optimized_content.description}</p>
                              </div>

                              <div className="flex gap-4">
                                <div className="space-y-1">
                                  <Label className="text-[10px] text-blue-400 uppercase font-bold">Precio Sugerido</Label>
                                  <p className="text-emerald-400 font-bold">${pub.optimized_content.suggestedPrice}</p>
                                </div>
                                <div className="space-y-1 flex-1">
                                  <Label className="text-[10px] text-blue-400 uppercase font-bold">Hashtags</Label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {pub.optimized_content.hashtags?.map(tag => (
                                      <span key={tag} className="text-[9px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">#{tag}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <Button variant="ghost" size="sm" className="w-full mt-4 text-xs text-blue-400 hover:bg-blue-400/10">
                                <ExternalLink className="mr-2 h-3 w-3" /> Ver guía de publicación en {pub.platform}
                              </Button>
                            </div>
                          ) : (
                            <div className="h-[250px] border border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-center p-6 bg-white/[0.01]">
                              <Sparkles className="h-8 w-8 text-gray-700 mb-2" />
                              <p className="text-gray-500 text-sm">Selecciona una plataforma y haz clic en optimizar para generar contenido automático.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Publicación</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-gray-300">Nombra tu nueva publicación</Label>
              <Input 
                id="name" 
                placeholder="Ej. Sudadera Vintage Oversize" 
                value={newPubName}
                onChange={(e) => setNewPubName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="bg-black/40 border-white/10 text-white"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white">
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!newPubName.trim()} className="bg-white text-black hover:bg-gray-200">
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
