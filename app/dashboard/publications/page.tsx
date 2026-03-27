'use client';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect, useRef } from 'react';
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
  CheckCircle2,
  Copy,
  Check,
  SquareArrowOutUpRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { publicationOperations, Publication } from '@/lib/publications';
import { useSubscription } from '@/app/contexts/SubscriptionContext';
import { useCurrency } from '@/app/contexts/CurrencyContext';

const formatText = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    let content = line;
    let isBullet = false;

    // Support basic list items
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      isBullet = true;
      content = line.trim().substring(2);
    }

    // Parse **bold** parts
    const parts = content.split(/(\*\*.*?\*\*)/g);

    const formattedLine = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={j}>{part}</span>;
    });

    if (isBullet) {
      return (
        <li key={i} className="ml-4 list-disc marker:text-blue-500 mb-1">
          {formattedLine}
        </li>
      );
    }

    return (
      <span key={i} className="block mb-2 last:mb-0">
        {formattedLine}
      </span>
    );
  });
};
const platforms = [
  { id: 'mercadolibre', name: 'Mercado Libre', icon: Store },
  { id: 'facebook', name: 'Facebook Marketplace', icon: Store },
  { id: 'etsy', name: 'Etsy', icon: ShoppingBag },
  { id: 'amazon', name: 'Amazon', icon: Globe },
  { id: 'shopify', name: 'Shopify', icon: ShoppingBag },
];

const CURRENCIES = [
  'MXN', 'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD',
  'NZD', 'KRW', 'SGD', 'NOK', 'INR', 'RUB', 'ZAR', 'TRY', 'BRL', 'TWD',
  'DKK', 'PLN', 'THB', 'IDR', 'CZK'
];

export default function PublicationsPage() {
  const { user } = useUser();
  const { isPro } = useSubscription();
  const { convert, format, currency, location } = useCurrency();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPubName, setNewPubName] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<Record<string, boolean>>({});
  const [isOptimizing, setIsOptimizing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});
  const [publicationsCount, setPublicationsCount] = useState(0);
  const [daysUntilReset, setDaysUntilReset] = useState(0);
  const updateTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    // Cleanup timeouts on unmount
    return () => {
      Object.values(updateTimeoutRef.current).forEach(clearTimeout);
    };
  }, []);

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
      const stats = await publicationOperations.getUsageStats(user!.id);
      setPublications(data);
      setPublicationsCount(stats.count);
      setDaysUntilReset(stats.daysUntilReset);
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
      
      const stats = await publicationOperations.getUsageStats(user!.id);
      setPublicationsCount(stats.count);
      setDaysUntilReset(stats.daysUntilReset);

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

  const handleUpdate = async (id: string, updates: Partial<Publication>, debounce = false) => {
    let latestPub: Publication | undefined;

    // Optimistically update local state immediately and capture the latest state
    setPublications(prev => {
      const newList = prev.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          if (updates.product_data) {
            updated.product_data = { ...p.product_data, ...updates.product_data };
          }
          latestPub = updated;
          return updated;
        }
        return p;
      });
      return newList;
    });

    const triggerUpdate = async () => {
      if (!latestPub) return;
      try {
        // Ensure we send the merged product_data to prevent overwriting other fields in JSONB
        const dataToSave = { ...updates };
        if (updates.product_data) {
          dataToSave.product_data = latestPub.product_data;
        }
        await publicationOperations.update(id, user!.id, dataToSave);
      } catch (error) {
        console.error('Error updating publication:', error);
      }
    };

    if (!debounce) {
      await triggerUpdate();
      return;
    }

    // Debounced update
    if (updateTimeoutRef.current[id]) {
      clearTimeout(updateTimeoutRef.current[id]);
    }

    updateTimeoutRef.current[id] = setTimeout(async () => {
      await triggerUpdate();
      delete updateTimeoutRef.current[id];
    }, 1000);
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus({ ...copyStatus, [id]: true });
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
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
            stock: true
          },
          style: pub.product_data.style || 'Profesional',
          length: pub.product_data.length || 'medium'
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
      stock: true
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Publicaciones</h1>
          <div className="flex flex-col gap-1 mt-2">
            <p className="text-gray-400">Crea y optimiza tus publicaciones para diferentes marketplaces.</p>
            {!isPro && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`${publicationsCount >= 3 ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-white/30 text-white bg-white/10'}`}>
                  {publicationsCount}/3 Publicaciones (30 días)
                </Badge>
                {publicationsCount >= 3 && daysUntilReset > 0 && (
                  <span className="text-xs text-red-400 font-medium">
                    Faltan {daysUntilReset} días para crear más
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)} 
          disabled={!isPro && publicationsCount >= 3}
          className="bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
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
                          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Configuración de la Publicación </h4>

                          <div className="space-y-6">
                            {/* 1. Imagen (OBLIGATORIA) */}
                            <div className="relative">
                              <Label
                                htmlFor="file-upload"
                                className="p-8 rounded-xl border-2 border-dashed border-blue-500/20 bg-blue-500/5 group hover:border-blue-500/40 transition-all text-center flex flex-col items-center gap-4 cursor-pointer w-full"
                              >
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

                            {/* 2. Título, Plataforma y Descripción */}
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label className="text-gray-400 text-xs">Título del Producto</Label>
                                  <Input
                                    value={pub.name}
                                    onChange={(e) => handleUpdate(pub.id, { name: e.target.value }, true)}
                                    className="bg-black/60 border-white/10 text-white font-medium focus:ring-blue-500/50"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label className="text-gray-400 text-xs">Plataforma de Venta</Label>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" className="h-10 w-full bg-black/60 border-white/10 text-white justify-between px-3 font-normal hover:bg-black/80">
                                        {pub.platform ? platforms.find(p => p.id === pub.platform)?.name : "Selecciona tu plataforma..."}
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[300px] bg-[#111111] border-white/10">
                                      {platforms.map((p) => (
                                        <DropdownMenuItem
                                          key={p.id}
                                          onClick={() => handleUpdate(pub.id, { platform: p.id })}
                                          className="text-white hover:bg-white/10 cursor-pointer"
                                        >
                                          {p.name}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
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
                                  value={pub.product_data.description || ''}
                                  onChange={(e) => handleUpdate(pub.id, {
                                    product_data: { ...pub.product_data, description: e.target.value }
                                  }, true)}
                                  className="min-h-[100px] w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500/50 transition-all outline-none"
                                  placeholder="Describe tu producto..."
                                />
                              </div>

                              <div className="grid gap-2">
                                <Label className="text-gray-400 text-xs">Estilo de Redacción</Label>
                                <div className="grid grid-cols-2 gap-2">
                                  {['Persuasivo', 'Informativo', 'Profesional', 'Creativo'].map((style) => (
                                    <Button
                                      key={style}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUpdate(pub.id, { product_data: { ...pub.product_data, style } })}
                                      className={`text-[10px] h-8 border-white/10 ${pub.product_data.style === style ? 'bg-blue-600 text-white border-blue-600' : 'bg-black/40 text-gray-400 hover:bg-white/5'}`}
                                    >
                                      {style}
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              <div className="grid gap-2">
                                <Label className="text-gray-400 text-xs">Longitud de Publicación</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  {[{ id: 'short', label: 'Corto' }, { id: 'medium', label: 'Mediano' }, { id: 'long', label: 'Largo' }].map((len) => (
                                    <Button
                                      key={len.id}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUpdate(pub.id, { product_data: { ...pub.product_data, length: len.id as any } })}
                                      className={`text-[10px] h-8 border-white/10 ${pub.product_data.length === len.id || (!pub.product_data.length && len.id === 'medium') ? 'bg-blue-600 text-white border-blue-600' : 'bg-black/40 text-gray-400 hover:bg-white/5'}`}
                                    >
                                      {len.label}
                                    </Button>
                                  ))}
                                </div>
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="grid gap-2">
                                        <div className="flex justify-between items-center"><Label className="text-[10px] text-gray-500">Precio</Label><input type="checkbox" checked={isFieldEnabled(pub, 'price')} onChange={() => toggleField(pub, 'price')} className="h-2 w-2 accent-blue-500" /></div>
                                        <Input value={pub.product_data.price || ''} onChange={(e) => handleUpdate(pub.id, { product_data: { ...pub.product_data, price: e.target.value } }, true)} placeholder="0.00" className="h-8 bg-black/40 border-white/5 text-xs text-white focus:ring-blue-500/50" />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label className="text-[10px] text-gray-500">Plataforma de Venta</Label>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="h-8 w-full bg-black/40 border-white/5 text-white justify-between px-2 text-xs font-normal hover:bg-black/60">
                                              {pub.platform ? platforms.find(p => p.id === pub.platform)?.name : "Selecciona tu plataforma"}
                                              <ChevronDown className="h-3 w-3 opacity-50" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent className="w-[200px] bg-[#111111] border-white/10">
                                            {platforms.map((p) => (
                                              <DropdownMenuItem
                                                key={p.id}
                                                onClick={() => handleUpdate(pub.id, { platform: p.id })}
                                                className="text-white hover:bg-white/10 cursor-pointer text-xs"
                                              >
                                                {p.name}
                                              </DropdownMenuItem>
                                            ))}
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="grid gap-2">
                                        <div className="flex justify-between items-center"><Label className="text-[10px] text-gray-500">Marca</Label><input type="checkbox" checked={isFieldEnabled(pub, 'brand')} onChange={() => toggleField(pub, 'brand')} className="h-2 w-2 accent-blue-500" /></div>
                                        <Input value={pub.product_data.brand || ''} onChange={(e) => handleUpdate(pub.id, { product_data: { ...pub.product_data, brand: e.target.value } }, true)} placeholder="Ej. Apple" className="h-8 bg-black/40 border-white/5 text-xs text-white focus:ring-blue-500/50" />
                                      </div>
                                      <div className="grid gap-2">
                                        <div className="flex justify-between items-center"><Label className="text-[10px] text-gray-500">Stock</Label><input type="checkbox" checked={isFieldEnabled(pub, 'stock')} onChange={() => toggleField(pub, 'stock')} className="h-2 w-2 accent-blue-500" /></div>
                                        <Input value={pub.product_data.stock || ''} onChange={(e) => handleUpdate(pub.id, { product_data: { ...pub.product_data, stock: e.target.value } }, true)} placeholder="Q" className="h-8 bg-black/40 border-white/5 text-xs text-white focus:ring-blue-500/50" />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="grid gap-2">
                                        <div className="flex justify-between items-center"><Label className="text-[10px] text-gray-500">Modelo</Label><input type="checkbox" checked={isFieldEnabled(pub, 'model')} onChange={() => toggleField(pub, 'model')} className="h-2 w-2 accent-blue-500" /></div>
                                        <Input value={pub.product_data.model || ''} onChange={(e) => handleUpdate(pub.id, { product_data: { ...pub.product_data, model: e.target.value } }, true)} placeholder="Ej. iPhone 15" className="h-8 bg-black/40 border-white/5 text-xs text-white focus:ring-blue-500/50" />
                                      </div>
                                      <div className="grid gap-2">
                                        <div className="flex justify-between items-center"><Label className="text-[10px] text-gray-500">Categoría</Label><input type="checkbox" checked={isFieldEnabled(pub, 'category')} onChange={() => toggleField(pub, 'category')} className="h-2 w-2 accent-blue-500" /></div>
                                        <Input value={pub.product_data.category || ''} onChange={(e) => handleUpdate(pub.id, { product_data: { ...pub.product_data, category: e.target.value } }, true)} placeholder="Ej. Electrónica" className="h-8 bg-black/40 border-white/5 text-xs text-white focus:ring-blue-500/50" />
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
                                          value={pub.product_data.warranty || ''}
                                          onChange={(e) => handleUpdate(pub.id, {
                                            product_data: { ...pub.product_data, warranty: e.target.value }
                                          }, true)}
                                          placeholder="Ej. 12 meses"
                                          className="h-8 bg-black/40 border-white/10 text-xs text-white focus:ring-blue-500/50 outline-none"
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
                            disabled={isOptimizing === pub.id || !pub.product_data.imageUrl || !pub.name?.trim() || !pub.platform}
                            className={`w-full h-12 text-md font-bold transition-all ${(!pub.product_data.imageUrl || !pub.name?.trim() || !pub.platform) ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'}`}
                          >
                            {isOptimizing === pub.id ? (
                              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Optimizando...</>
                            ) : (
                              <><a className="mr-2 h-5 w-5" />Optimizar Publicación</>
                            )}
                          </Button>
                          <div className="text-center space-y-1">
                            {(!pub.product_data.imageUrl || !pub.name?.trim() || !pub.platform) && (
                              <p className="text-[10px] text-red-400/60">Debes llenar todos los campos obligatorios para generar tu publicación </p>
                            )}
                            {!isPro && (
                              <p className="text-[11px] font-medium text-gray-400">
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Result Section */}
                        <div className="space-y-6">
                          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contenido Optimizado</h4>

                          {pub.optimized_content.title ? (
                            <div className="space-y-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 animate-fade-in">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-[10px] text-blue-400 uppercase font-bold">Título Ganador</Label>
                                  <div className="flex items-center gap-2">
                                    {isPro && pub.optimized_content.optimizationState && (
                                      <Badge variant="outline" className="text-[10px] py-0 px-2 border-emerald-500/30 text-emerald-400 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                        Estado: {pub.optimized_content.optimizationState}
                                      </Badge>
                                    )}
                                 
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-blue-400 hover:bg-blue-400/10"
                                      onClick={() => handleCopy(pub.optimized_content.title || '', pub.id + '-title')}
                                    >
                                      {copyStatus[pub.id + '-title'] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-white text-sm font-medium leading-tight">{pub.optimized_content.title}</p>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-[10px] text-blue-400 uppercase font-bold">Descripción Estratégica</Label>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-blue-400 hover:bg-blue-400/10"
                                    onClick={() => handleCopy(pub.optimized_content.description || '', pub.id + '-desc')}
                                  >
                                    {copyStatus[pub.id + '-desc'] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                  </Button>
                                </div>
                                <div className="text-gray-400 text-xs leading-relaxed">
                                  {formatText(pub.optimized_content.description || '')}
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                  <div className="flex items-center justify-between mb-1">
                                    <Label className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">Precio Sugerido por IA</Label>
                                    <Badge variant="outline" className="text-[8px] border-blue-500/30 text-blue-400 bg-blue-500/5">Estimado</Badge>
                                  </div>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">
                                      {format(
                                        convert(Number(pub.optimized_content.suggestedPrice || 0), currency, selectedCurrencies[pub.id] || 'MXN'),
                                        selectedCurrencies[pub.id] || 'MXN'
                                      )}
                                    </span>
                                    
                                    <div className="relative flex items-center bg-white/5 rounded-md hover:bg-white/10 transition-colors border border-white/10 overflow-hidden">

                             
                                        
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-full bg-transparent text-white font-medium hover:bg-white/10 px-2 py-1 text-xs gap-1">
                                              {selectedCurrencies[pub.id] || 'MXN'}
                                              <ChevronDown className="h-3 w-3 opacity-50" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent className="max-h-[300px] overflow-y-auto bg-[#111111] border-white/10">
                                            {CURRENCIES.map((c) => (
                                              <DropdownMenuItem
                                                key={c}
                                                onClick={() => setSelectedCurrencies(prev => ({ ...prev, [pub.id]: c }))}
                                                className="text-white hover:bg-white/10 cursor-pointer text-xs"
                                              >
                                                {c}
                                              </DropdownMenuItem>
                                            ))}
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    
                                  </div>
                                  <p className="text-[9px] text-gray-500 mt-1">Este precio es una recomendación basada en el mercado actual para un producto similar.</p>
                                </div>


<div className="flex items-center gap-2 flex-wrap">
  <p className="text-[10px] text-blue-400 uppercase font-bold">
    Modelo de IA utilizado:
  </p>

  {pub.optimized_content.modelUsed && (
    <a
      href="https://www.llama.com/docs/model-cards-and-prompt-formats/llama3_3/"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] 
                 border border-blue-500/30 bg-blue-500/5 text-white 
                 hover:bg-blue-500/10 transition-all"
    >
      {pub.optimized_content.modelUsed}
      <SquareArrowOutUpRight className="h-3 w-3 opacity-70" />
    </a>
  )}
</div>


              </div>

                              
                              <div className="flex gap-4">
                              
                              </div>
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
