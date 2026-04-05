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
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Maximize2
} from 'lucide-react';
import { removeBackground, processImage, upscaleImage, autoEnhanceColors, sharpenImage } from '@/lib/imageProcessor';
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
import { useTranslations, useLocale } from 'next-intl';

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
        <li key={i} className="ml-4 list-disc marker:text-white mb-1">
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
  { id: 'mercadolibre', name: 'Mercado Libre' },
  { id: 'facebook', name: 'Facebook Marketplace' },
  { id: 'etsy', name: 'Etsy' },
  { id: 'amazon', name: 'Amazon' },
  { id: 'shopify', name: 'Shopify' },
];

const CURRENCIES = [
  'MXN', 'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD',
  'NZD', 'KRW', 'SGD', 'NOK', 'INR', 'RUB', 'ZAR', 'TRY', 'BRL', 'TWD',
  'DKK', 'PLN', 'THB', 'IDR', 'CZK'
];

const OPTIMIZATION_TOOL_KEYS = [
  { id: 'background', labelKey: 'background', descKey: 'backgroundDesc' },
  { id: 'upscale', labelKey: 'resolution', descKey: 'resolutionDesc' },
  { id: 'enhance', labelKey: 'color', descKey: 'colorDesc' },
  { id: 'sharpen', labelKey: 'sharpness', descKey: 'sharpnessDesc' },
  { id: 'export', labelKey: 'export', descKey: 'exportDesc' },
] as const;

export default function PublicationsPage() {
  const { user } = useUser();
  const { isPro } = useSubscription();
  const { convert, format, currency, location } = useCurrency();
  const t = useTranslations('publications');
  const locale = useLocale();
  const tc = useTranslations('common');
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
  const [activeOptTool, setActiveOptTool] = useState<Record<string, string>>({});
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
      setError(err.message || t('errorLoading'));
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
      setSuccess(t('createdSuccess'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error creating publication:', err);
      setError(err.message || t('errorCreating'));
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
      // 1. Batch Image Optimization
      const opt = pub.product_data.imageOptimization || {};

      const allIndices = [-1, ...(pub.product_data.additionalImages?.map((_, i) => i) || [])];

      let optimizedMainUrl = pub.product_data.imageUrl || '';
      const resultsMap: Record<number, string> = {};

      for (const idx of allIndices) {
        const isMain = idx === -1;
        const source = isMain ? pub.product_data.imageUrl : pub.product_data.additionalImages?.[idx];

        if (!source) continue;

        // Surgical Check: Is any tool enabled for THIS specific image index?
        const needsBG = opt.removeBackgroundIndices?.includes(idx);
        const needsUpscale = opt.upscaleIndices?.includes(idx);
        const needsEnhance = opt.autoEnhanceIndices?.includes(idx);
        const needsSharpen = opt.sharpenIndices?.includes(idx);
        const needsPreset = opt.preset && opt.preset !== 'standard';

        if (!needsBG && !needsUpscale && !needsEnhance && !needsSharpen && !needsPreset) {
          continue;
        }

        let currentUrl = source;
        try {
          if (needsBG) {
            currentUrl = await removeBackground(currentUrl, { bgColor: opt.bgColor });
          }
          if (needsUpscale) {
            currentUrl = await upscaleImage(currentUrl);
          }
          if (needsEnhance) {
            currentUrl = await autoEnhanceColors(currentUrl, opt.enhanceIntensity);
          }
          if (needsSharpen) {
            currentUrl = await sharpenImage(currentUrl, opt.sharpenAmount);
          }
          if (needsPreset) {
            const width = opt.targetWidth || (opt.preset === 'mercadolibre' ? 1200 : opt.preset === 'amazon' ? 1600 : opt.preset === 'pinterest' ? 1000 : 1080);
            const height = opt.targetHeight || (opt.preset === 'mercadolibre' ? 1200 : opt.preset === 'amazon' ? 1600 : opt.preset === 'pinterest' ? 1500 : 1080);
            currentUrl = await processImage(currentUrl!, { width, height, format: 'jpeg' });
          }

          if (isMain) {
            optimizedMainUrl = currentUrl;
          } else {
            resultsMap[idx] = currentUrl;
          }
        } catch (imgErr) {
          console.error(`Error processing image ${idx}:`, imgErr);
        }
      }

      const finalAdditionals = (pub.product_data.additionalImages || []).map((img, idx) => resultsMap[idx] || img);

      // 2. AI Content Generation
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
          length: pub.product_data.length || 'medium',
          locale: locale
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errorOptimizing'));
      }

      // 3. Update both text and image in optimized_content
      await handleUpdate(pub.id, {
        optimized_content: {
          ...data,
          imageUrl: optimizedMainUrl,
          additionalOptimizedImages: finalAdditionals
        }
      });
      setSuccess(t('optimizedSuccess'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error in optimization flow:', err);
      setError(err.message || t('errorConnection'));
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
          <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
          <div className="flex flex-col gap-1 mt-2">
            <p className="text-gray-400">{t('subtitle')}</p>
            {!isPro && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`${publicationsCount >= 3 ? 'border-zinc-500/30 text-zinc-400 bg-zinc-500/10' : 'border-white/30 text-white bg-white/10'}`}>
                  {t('pubsCount', { count: publicationsCount })}
                </Badge>
                {publicationsCount >= 3 && daysUntilReset > 0 && (
                  <span className="text-xs text-red-400 font-medium">
                    {t('daysUntilReset', { days: daysUntilReset })}
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
          <Plus className="mr-2 h-4 w-4" /> {t('newPublication')}
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
              <AlertTitle>{tc('success')}</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-gray-400">{t('loadingPublications')}</p>
        </div>
      ) : publications.length === 0 ? (
        <Card className="bg-[#0a0a0a] border-white/10 p-12 text-center">
          <div className="flex justify-center mb-4">
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">{t('noPublications')}</h2>
          <p className="text-gray-400 mb-6">{t('noPublicationsDesc')}</p>
          <Button onClick={() => setIsCreateModalOpen(true)} variant="outline" className="border-white/10 text-white hover:bg-white/5">
            {t('createPublication')}
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
              className={`bg-[#111111] border rounded-xl transition-all duration-300 ${expandedId === pub.id ? 'border-white/30 ring-1 ring-white/10' : 'border-white/5 hover:border-white/10'}`}
            >
              <div className="p-4 flex items-center justify-between cursor-pointer group" onClick={() => setExpandedId(expandedId === pub.id ? null : pub.id)}>
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                    {pub.product_data.imageUrl ? (
                      <img src={pub.product_data.imageUrl} alt={pub.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-white/5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{pub.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {pub.platform && (
                        <Badge variant="secondary" className="bg-white/10 text-white border-none capitalize text-[10px]">

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
                          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{t('configSection')}</h4>

                          <div className="space-y-6">
                            {/* 1. Imagen (OBLIGATORIA) */}
                            <div className="space-y-4">
                              <Label className="text-gray-400 text-xs uppercase tracking-wider font-bold">{t('mainImage')}</Label>
                              <div className="relative group">
                                <Label
                                  htmlFor="file-upload"
                                  className="p-8 rounded-xl border-2 border-dashed border-white/20 bg-white/5 group-hover:border-white/40 transition-all text-center flex flex-col items-center gap-4 cursor-pointer w-full"
                                >
                                  <div className="h-48 w-48 rounded-xl border border-white/10 bg-black/40 flex items-center justify-center overflow-hidden shadow-2xl group-hover:scale-[1.02] transition-all">
                                    {pub.product_data.imageUrl ? (
                                      <img src={pub.product_data.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="flex flex-col items-center gap-2">
                                        <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">{t('clickToUpload')}</span>
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

                              {/* Galería de Imágenes Adicionales */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-gray-400 text-xs uppercase tracking-wider font-bold">{t('additionalImages')} ({pub.product_data.additionalImages?.length || 0}/10)</Label>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] text-white hover:text-zinc-300 hover:bg-white/10"
                                    onClick={() => document.getElementById(`extra-upload-${pub.id}`)?.click()}
                                  >
                                    <Plus className="h-3 w-3 mr-1" /> {t('add')}
                                  </Button>
                                  <input
                                    id={`extra-upload-${pub.id}`}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                      const files = Array.from(e.target.files || []);
                                      const currentImages = pub.product_data.additionalImages || [];

                                      files.forEach(file => {
                                        if (currentImages.length >= 10) return;
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          const newImages = [...(pub.product_data.additionalImages || []), reader.result as string];
                                          handleUpdate(pub.id, {
                                            product_data: { ...pub.product_data, additionalImages: newImages }
                                          });
                                        };
                                        reader.readAsDataURL(file);
                                      });
                                    }}
                                  />
                                </div>

                                <div className="grid grid-cols-5 gap-2">
                                  {pub.product_data.additionalImages?.map((img, idx) => (
                                    <div key={idx} className="group relative aspect-square rounded-lg border border-white/10 bg-black/40 overflow-hidden">
                                      <img src={img} className="h-full w-full object-cover" />
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 text-white hover:text-zinc-300 hover:bg-white/10"
                                          onClick={() => {
                                            const newImages = [...pub.product_data.additionalImages!];
                                            const mainImg = pub.product_data.imageUrl;
                                            const selectedImg = newImages[idx];
                                            newImages[idx] = mainImg || '';
                                            handleUpdate(pub.id, {
                                              product_data: {
                                                ...pub.product_data,
                                                imageUrl: selectedImg,
                                                additionalImages: newImages.filter(i => i)
                                              }
                                            });
                                          }}
                                        >
                                          <Maximize2 className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 text-white hover:text-zinc-400 hover:bg-zinc-400/20"
                                          onClick={() => {
                                            const newImages = pub.product_data.additionalImages!.filter((_, i) => i !== idx);
                                            handleUpdate(pub.id, {
                                              product_data: { ...pub.product_data, additionalImages: newImages }
                                            });
                                          }}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                  {Array.from({ length: Math.max(0, 5 - (pub.product_data.additionalImages?.length || 0)) }).map((_, i) => (
                                    <div
                                      key={`empty-${i}`}
                                      className="aspect-square rounded-lg border border-dashed border-white/5 bg-white/[0.02] flex items-center justify-center cursor-pointer hover:bg-white/[0.05] transition-colors"
                                      onClick={() => document.getElementById(`extra-upload-${pub.id}`)?.click()}
                                    >
                                      <Plus className="h-4 w-4 text-gray-700" />
                                    </div>
                                  ))}
                                </div>
                                {/* Optimización de Imágenes */}
                                <div className="pt-4 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{t('imageOptimization')}</h5>
                                    </div>








                                  </div>
                                  <div className="flex bg-black/60 p-2 rounded-xl border border-white/5 shadow-inner w-fit mx-auto overflow-visible">
                                    {OPTIMIZATION_TOOL_KEYS.map((tool) => {
                                      const activeToolId = activeOptTool[pub.id] || 'background';
                                      const isActive = activeToolId === tool.id;
                                      const count = tool.id === 'background' ? (pub.product_data.imageOptimization?.removeBackgroundIndices?.length || 0) :
                                        tool.id === 'upscale' ? (pub.product_data.imageOptimization?.upscaleIndices?.length || 0) :
                                          tool.id === 'enhance' ? (pub.product_data.imageOptimization?.autoEnhanceIndices?.length || 0) :
                                            tool.id === 'sharpen' ? (pub.product_data.imageOptimization?.sharpenIndices?.length || 0) :
                                              (pub.product_data.imageOptimization?.preset && pub.product_data.imageOptimization.preset !== 'standard' ? 1 : 0);
                                      return (
                                        <button
                                          key={tool.id}
                                          onClick={() => setActiveOptTool(prev => ({ ...prev, [pub.id]: tool.id }))}
                                          className={`relative px-4 py-2 rounded-lg transition-all flex items-center group ${isActive ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                        >
                                          <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{t(tool.labelKey)}</span>
                                          {count > 0 && !isActive && (
                                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[8px] font-bold text-black ring-2 ring-[#0a0a0a] z-10">
                                              {count}
                                            </span>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  <div className="p-5 rounded-2xl border border-white/10 bg-white/5 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                    </div>

                                    <AnimatePresence mode="wait">
                                      <motion.div
                                        key={activeOptTool[pub.id] || 'background'}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-5"
                                      >
                                        {/* Header Tool Section */}
                                        <div className="flex items-center justify-between gap-4">
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                              <Label className="text-sm font-bold text-white">
                                                {t(OPTIMIZATION_TOOL_KEYS.find(tk => tk.id === (activeOptTool[pub.id] || 'background'))?.labelKey || 'background')}
                                              </Label>
                                            </div>
                                            <p className="text-[11px] text-gray-500 font-medium">
                                              {t(OPTIMIZATION_TOOL_KEYS.find(tk => tk.id === (activeOptTool[pub.id] || 'background'))?.descKey || 'backgroundDesc')}
                                            </p>
                                          </div>

                                          {(activeOptTool[pub.id] || 'background') !== 'export' && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 text-[10px] px-3 bg-white/5 hover:bg-white/10 text-gray-400 border border-white/5"
                                              onClick={() => {
                                                const current = pub.product_data.imageOptimization || {};
                                                const toolId = activeOptTool[pub.id] || 'background';
                                                const field =
                                                  toolId === 'background' ? 'removeBackgroundIndices' :
                                                    toolId === 'upscale' ? 'upscaleIndices' :
                                                      toolId === 'enhance' ? 'autoEnhanceIndices' :
                                                        toolId === 'sharpen' ? 'sharpenIndices' : null;

                                                if (!field) return;
                                                const allIndices = [-1, ...(pub.product_data.additionalImages?.map((_, i) => i) || [])];
                                                const isAll = (current[field] as number[] || []).length === allIndices.length;
                                                handleUpdate(pub.id, {
                                                  product_data: {
                                                    ...pub.product_data,
                                                    imageOptimization: { ...current, [field]: isAll ? [] : allIndices }
                                                  }
                                                });
                                              }}
                                            >
                                              {(() => {
                                                const current = pub.product_data.imageOptimization || {};
                                                const toolId = activeOptTool[pub.id] || 'background';
                                                const field =
                                                  toolId === 'background' ? 'removeBackgroundIndices' :
                                                    toolId === 'upscale' ? 'upscaleIndices' :
                                                      toolId === 'enhance' ? 'autoEnhanceIndices' :
                                                        toolId === 'sharpen' ? 'sharpenIndices' : null;

                                                if (!field) return '';
                                                const allIndices = [-1, ...(pub.product_data.additionalImages?.map((_, i) => i) || [])];
                                                return (current[field] as number[] || []).length === allIndices.length ? t('deselectAll') : t('selectAll');
                                              })()}
                                            </Button>
                                          )}
                                        </div>

                                        {/* Image Selection Grid (shared for most tools) */}
                                        {(activeOptTool[pub.id] || 'background') !== 'export' && (
                                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                                            {[
                                              { url: pub.product_data.imageUrl, index: -1 },
                                              ...(pub.product_data.additionalImages?.map((url, idx) => ({ url, index: idx })) || [])
                                            ].map((img, i) => {
                                              const toolId = activeOptTool[pub.id] || 'background';
                                              const field =
                                                toolId === 'background' ? 'removeBackgroundIndices' :
                                                  toolId === 'upscale' ? 'upscaleIndices' :
                                                    toolId === 'enhance' ? 'autoEnhanceIndices' :
                                                      toolId === 'sharpen' ? 'sharpenIndices' : null;

                                              const isSelected = field ? (pub.product_data.imageOptimization?.[field] as number[])?.includes(img.index) : false;

                                              return (
                                                <div
                                                  key={i}
                                                  onClick={() => {
                                                    if (!field) return;
                                                    const current = pub.product_data.imageOptimization || {};
                                                    const selected = [...((current[field] as number[]) || [])];
                                                    const exists = selected.indexOf(img.index);
                                                    if (exists > -1) selected.splice(exists, 1);
                                                    else selected.push(img.index);
                                                    handleUpdate(pub.id, { product_data: { ...pub.product_data, imageOptimization: { ...current, [field]: selected } } });
                                                  }}
                                                  className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-300 ${isSelected ? 'border-white ring-4 ring-white/10 scale-[0.98]' : 'border-white/5 opacity-40 hover:opacity-100 hover:border-white/20'}`}
                                                >
                                                  <img src={img.url} className="h-full w-full object-cover" />
                                                  {isSelected && (
                                                    <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
                                                      <div className="bg-white rounded-full p-1 shadow-lg">
                                                        <Check className="h-2.5 w-2.5 text-black stroke-[3]" />
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}

                                        {/* Extra Options for specific tools */}
                                        <div className="pt-2">
                                          {(activeOptTool[pub.id] || 'background') === 'background' && pub.product_data.imageOptimization?.removeBackgroundIndices?.length! > 0 && (
                                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                              <Label className="text-[10px] text-gray-500 uppercase font-black tracking-widest pl-1">{t('resultBackground')}</Label>
                                              <div className="flex gap-2">
                                                {['transparent', 'white', 'black'].map((color) => (
                                                  <Button
                                                    key={color}
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                      const current = pub.product_data.imageOptimization || {};
                                                      handleUpdate(pub.id, { product_data: { ...pub.product_data, imageOptimization: { ...current, bgColor: color as any } } });
                                                    }}
                                                    className={`flex-1 h-8 text-[11px] font-bold ${pub.product_data.imageOptimization?.bgColor === color ? 'bg-white text-black shadow-lg' : 'bg-black/40 text-gray-500 hover:text-white border border-white/5'}`}
                                                  >
                                                    {color === 'transparent' ? t('transparent') : color === 'white' ? t('white') : t('black')}
                                                  </Button>
                                                ))}
                                              </div>
                                            </motion.div>
                                          )}

                                          {(activeOptTool[pub.id] || 'background') === 'enhance' && pub.product_data.imageOptimization?.autoEnhanceIndices?.length! > 0 && (
                                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                              <Label className="text-[10px] text-gray-500 uppercase font-black tracking-widest pl-1">{t('enhanceMode')}</Label>
                                              <div className="flex gap-2">
                                                {[{ id: 'natural', label: t('natural') }, { id: 'vivid', label: t('vivid') }, { id: 'crisp', label: t('crisp') }].map((mode) => (
                                                  <Button
                                                    key={mode.id}
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                      const current = pub.product_data.imageOptimization || {};
                                                      handleUpdate(pub.id, { product_data: { ...pub.product_data, imageOptimization: { ...current, enhanceIntensity: mode.id as any } } });
                                                    }}
                                                    className={`flex-1 h-8 text-[11px] font-bold ${pub.product_data.imageOptimization?.enhanceIntensity === mode.id ? 'bg-white text-black shadow-lg' : 'bg-black/40 text-gray-500 hover:text-white border border-white/5'}`}
                                                  >
                                                    {mode.label}
                                                  </Button>
                                                ))}
                                              </div>
                                            </motion.div>
                                          )}

                                          {(activeOptTool[pub.id] || 'background') === 'export' && (
                                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                              <div className="space-y-2">
                                                <Label className="text-[10px] text-gray-500 uppercase font-black tracking-widest pl-1">{t('publishDestination')}</Label>
                                                <DropdownMenu>
                                                  <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" className="w-full h-11 bg-black/60 border-white/10 text-white justify-between px-4 rounded-xl hover:bg-black/80 transition-all">
                                                      <span className="flex items-center gap-3">
                                                        <span className="font-semibold text-sm">
                                                          {pub.product_data.imageOptimization?.preset === 'mercadolibre' ? 'Mercado Libre (1200 x 1200)' :
                                                            pub.product_data.imageOptimization?.preset === 'amazon' ? 'Amazon (1600 x 1600)' :
                                                              pub.product_data.imageOptimization?.preset === 'pinterest' ? 'Pinterest (1000 x 1500)' :
                                                                pub.product_data.imageOptimization?.preset === 'custom' ? `${t('custom')} (${pub.product_data.imageOptimization?.targetWidth || 0} x ${pub.product_data.imageOptimization?.targetHeight || 0})` : t('originalQuality')}
                                                        </span>
                                                      </span>
                                                      <ChevronDown className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent className="w-[calc(100vw-40rem)] min-w-[240px] bg-[#0a0a0a] border-white/10 rounded-xl shadow-2xl p-1">
                                                    {[
                                                      { id: 'standard', label: t('standardNoChanges'), w: 0, h: 0 },
                                                      { id: 'mercadolibre', label: 'Mercado Libre', w: 1200, h: 1200 },
                                                      { id: 'amazon', label: 'Amazon', w: 1600, h: 1600 },
                                                      { id: 'pinterest', label: 'Pinterest', w: 1000, h: 1500 },
                                                      { id: 'custom', label: t('custom'), w: 1080, h: 1080 }
                                                    ].map((p) => (
                                                      <DropdownMenuItem
                                                        key={p.id}
                                                        onClick={() => {
                                                          const current = pub.product_data.imageOptimization || {};
                                                          handleUpdate(pub.id, {
                                                            product_data: {
                                                              ...pub.product_data,
                                                              imageOptimization: {
                                                                ...current,
                                                                preset: p.id as any,
                                                                targetWidth: p.w || undefined,
                                                                targetHeight: p.h || undefined
                                                              }
                                                            }
                                                          });
                                                        }}
                                                        className="text-gray-300 focus:text-white focus:bg-white/5 cursor-pointer flex justify-between gap-3 px-3 py-2 rounded-lg"
                                                      >
                                                        <span className="font-medium text-xs">{p.label}</span>
                                                        {p.w > 0 && <span className="text-[10px] opacity-40 font-mono">[{p.w}x{p.h}]</span>}
                                                      </DropdownMenuItem>
                                                    ))}
                                                  </DropdownMenuContent>
                                                </DropdownMenu>
                                              </div>

                                              <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                  <Label className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">{t('widthPx')}</Label>
                                                  <Input
                                                    type="number"
                                                    value={pub.product_data.imageOptimization?.targetWidth || ''}
                                                    onChange={(e) => {
                                                      const current = pub.product_data.imageOptimization || {};
                                                      handleUpdate(pub.id, {
                                                        product_data: {
                                                          ...pub.product_data,
                                                          imageOptimization: {
                                                            ...current,
                                                            preset: 'custom',
                                                            targetWidth: parseInt(e.target.value) || undefined
                                                          }
                                                        }
                                                      });
                                                    }}
                                                    className="h-10 bg-black/40 border-white/5 text-xs text-white rounded-lg focus:ring-white/20"
                                                    placeholder="Auto"
                                                  />
                                                </div>
                                                <div className="space-y-1.5">
                                                  <Label className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">{t('heightPx')}</Label>
                                                  <Input
                                                    type="number"
                                                    value={pub.product_data.imageOptimization?.targetHeight || ''}
                                                    onChange={(e) => {
                                                      const current = pub.product_data.imageOptimization || {};
                                                      handleUpdate(pub.id, {
                                                        product_data: {
                                                          ...pub.product_data,
                                                          imageOptimization: {
                                                            ...current,
                                                            preset: 'custom',
                                                            targetHeight: parseInt(e.target.value) || undefined
                                                          }
                                                        }
                                                      });
                                                    }}
                                                    className="h-10 bg-black/40 border-white/5 text-xs text-white rounded-lg focus:ring-white/20"
                                                    placeholder="Auto"
                                                  />
                                                </div>
                                              </div>
                                            </motion.div>
                                          )}
                                        </div>
                                      </motion.div>
                                    </AnimatePresence>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 2. Título, Plataforma y Descripción */}
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label className="text-gray-400 text-xs">{t('productTitle')}</Label>
                                  <Input
                                    value={pub.name}
                                    onChange={(e) => handleUpdate(pub.id, { name: e.target.value }, true)}
                                    className="bg-black/60 border-white/10 text-white font-medium focus:ring-white/20"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label className="text-gray-400 text-xs">{t('salesPlatform')}</Label>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" className="h-10 w-full bg-black/60 border-white/10 text-white justify-between px-3 font-normal hover:bg-black/80">
                                        {pub.platform ? platforms.find(p => p.id === pub.platform)?.name : t('selectPlatform')}
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
                                  <Label className="text-gray-400 text-xs">{t('detailedDescription')}</Label>
                                  <input
                                    type="checkbox"
                                    checked={isFieldEnabled(pub, 'description')}
                                    onChange={() => toggleField(pub, 'description')}
                                    className="h-3 w-3 accent-white/40"
                                  />
                                </div>
                                <textarea
                                  value={pub.product_data.description || ''}
                                  onChange={(e) => handleUpdate(pub.id, {
                                    product_data: { ...pub.product_data, description: e.target.value }
                                  }, true)}
                                  className="min-h-[100px] w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:ring-1 focus:ring-white/20 transition-all outline-none"
                                  placeholder={t('describeProduct')}
                                />
                              </div>

                              <div className="grid gap-2">
                                <Label className="text-gray-400 text-xs">{t('writingStyle')}</Label>
                                <div className="grid grid-cols-2 gap-2">
                                  {[{ key: 'persuasive', value: 'Persuasivo' }, { key: 'informative', value: 'Informativo' }, { key: 'professional', value: 'Profesional' }, { key: 'creative', value: 'Creativo' }].map((style) => (
                                    <Button
                                      key={style.value}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUpdate(pub.id, { product_data: { ...pub.product_data, style: style.value } })}
                                      className={`text-[10px] h-8 border-white/10 ${pub.product_data.style === style.value ? 'bg-white text-black border-white' : 'bg-black/40 text-gray-400 hover:bg-white/5'}`}
                                    >
                                      {t(style.key as any)}
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              <div className="grid gap-2">
                                <Label className="text-gray-400 text-xs">{t('publicationLength')}</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  {[{ id: 'short', label: t('short') }, { id: 'medium', label: t('medium') }, { id: 'long', label: t('long') }].map((len) => (
                                    <Button
                                      key={len.id}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUpdate(pub.id, { product_data: { ...pub.product_data, length: len.id as any } })}
                                      className={`text-[10px] h-8 border-white/10 ${pub.product_data.length === len.id || (!pub.product_data.length && len.id === 'medium') ? 'bg-white text-black border-white' : 'bg-black/40 text-gray-400 hover:bg-white/5'}`}
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
                                {showAdvanced[pub.id] ? t('hideExtraFields') : t('showExtraFields')}
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
                                        <div className="flex justify-between items-center"><Label className="text-[10px] text-gray-500">{t('price')}</Label><input type="checkbox" checked={isFieldEnabled(pub, 'price')} onChange={() => toggleField(pub, 'price')} className="h-2 w-2 accent-white/40" /></div>
                                        <Input value={pub.product_data.price || ''} onChange={(e) => handleUpdate(pub.id, { product_data: { ...pub.product_data, price: e.target.value } }, true)} placeholder="0.00" className="h-8 bg-black/40 border-white/5 text-xs text-white focus:ring-white/20" />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label className="text-[10px] text-gray-500">{t('salesPlatform')}</Label>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="h-8 w-full bg-black/40 border-white/5 text-white justify-between px-2 text-xs font-normal hover:bg-black/60">
                                              {pub.platform ? platforms.find(p => p.id === pub.platform)?.name : t('selectPlatform')}
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
                                        <div className="flex justify-between items-center"><Label className="text-[10px] text-gray-500">{t('brand')}</Label><input type="checkbox" checked={isFieldEnabled(pub, 'brand')} onChange={() => toggleField(pub, 'brand')} className="h-2 w-2 accent-white/40" /></div>
                                        <Input value={pub.product_data.brand || ''} onChange={(e) => handleUpdate(pub.id, { product_data: { ...pub.product_data, brand: e.target.value } }, true)} placeholder="Ej. Apple" className="h-8 bg-black/40 border-white/5 text-xs text-white focus:ring-white/20" />
                                      </div>
                                      <div className="grid gap-2">
                                        <div className="flex justify-between items-center"><Label className="text-[10px] text-gray-500">{t('stock')}</Label><input type="checkbox" checked={isFieldEnabled(pub, 'stock')} onChange={() => toggleField(pub, 'stock')} className="h-2 w-2 accent-white/40" /></div>
                                        <Input value={pub.product_data.stock || ''} onChange={(e) => handleUpdate(pub.id, { product_data: { ...pub.product_data, stock: e.target.value } }, true)} placeholder="Q" className="h-8 bg-black/40 border-white/5 text-xs text-white focus:ring-white/20" />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="grid gap-2">
                                        <div className="flex justify-between items-center"><Label className="text-[10px] text-gray-500">{t('model')}</Label><input type="checkbox" checked={isFieldEnabled(pub, 'model')} onChange={() => toggleField(pub, 'model')} className="h-2 w-2 accent-white/40" /></div>
                                        <Input value={pub.product_data.model || ''} onChange={(e) => handleUpdate(pub.id, { product_data: { ...pub.product_data, model: e.target.value } }, true)} placeholder="Ej. iPhone 15" className="h-8 bg-black/40 border-white/5 text-xs text-white focus:ring-white/20" />
                                      </div>
                                      <div className="grid gap-2">
                                        <div className="flex justify-between items-center"><Label className="text-[10px] text-gray-500">{t('category')}</Label><input type="checkbox" checked={isFieldEnabled(pub, 'category')} onChange={() => toggleField(pub, 'category')} className="h-2 w-2 accent-white/40" /></div>
                                        <Input value={pub.product_data.category || ''} onChange={(e) => handleUpdate(pub.id, { product_data: { ...pub.product_data, category: e.target.value } }, true)} placeholder="Ej. Electrónica" className="h-8 bg-black/40 border-white/5 text-xs text-white focus:ring-white/20" />
                                      </div>
                                    </div>

                                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <Label className="text-[10px] text-gray-400">{t('condition')}</Label>
                                        <div className="flex gap-2">
                                          <Badge onClick={() => handleUpdate(pub.id, { product_data: { ...pub.product_data, condition: 'new' } })} className={`text-[9px] px-2 py-0 cursor-pointer ${pub.product_data.condition === 'new' ? 'bg-white text-black' : 'bg-transparent border border-white/10 text-gray-600'}`}>{t('new')}</Badge>
                                          <Badge onClick={() => handleUpdate(pub.id, { product_data: { ...pub.product_data, condition: 'used' } })} className={`text-[9px] px-2 py-0 cursor-pointer ${pub.product_data.condition === 'used' ? 'bg-white text-black' : 'bg-transparent border border-white/10 text-gray-600'}`}>{t('used')}</Badge>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between">
                                        <Label className="text-[10px] text-gray-400">{t('freeShipping')}</Label>
                                        <input
                                          type="checkbox"
                                          checked={pub.product_data.shipping === 'free'}
                                          onChange={(e) => handleUpdate(pub.id, { product_data: { ...pub.product_data, shipping: e.target.checked ? 'free' : 'buyer' } })}
                                          className="h-3 w-3 accent-white/40"
                                        />
                                      </div>

                                      <div className="flex items-center justify-between">
                                        <Label className="text-[10px] text-gray-400">{t('msi')}</Label>
                                        <input
                                          type="checkbox"
                                          checked={pub.product_data.msi || false}
                                          onChange={(e) => handleUpdate(pub.id, { product_data: { ...pub.product_data, msi: e.target.checked } })}
                                          className="h-3 w-3 accent-white/40"
                                        />
                                      </div>

                                      <div className="grid gap-2">
                                        <div className="flex justify-between items-center">
                                          <Label className="text-[10px] text-gray-400">{t('warrantyMonths')}</Label>
                                          <input
                                            type="checkbox"
                                            checked={isFieldEnabled(pub, 'warranty')}
                                            onChange={() => toggleField(pub, 'warranty')}
                                            className="h-3 w-3 accent-white/40"
                                          />
                                        </div>
                                        <Input
                                          value={pub.product_data.warranty || ''}
                                          onChange={(e) => handleUpdate(pub.id, {
                                            product_data: { ...pub.product_data, warranty: e.target.value }
                                          }, true)}
                                          placeholder={t('warrantyPlaceholder')}
                                          className="h-8 bg-black/40 border-white/10 text-xs text-white focus:ring-white/20 outline-none"
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
                            className={`w-full h-12 text-md font-bold transition-all ${(!pub.product_data.imageUrl || !pub.name?.trim() || !pub.platform) ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-zinc-200 text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]'}`}
                          >
                            {isOptimizing === pub.id ? (
                              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('optimizing')}</>
                            ) : (
                              <><a className="mr-2 h-5 w-5" />{t('optimizePublication')}</>
                            )}
                          </Button>
                          <div className="text-center space-y-1">
                            {(!pub.product_data.imageUrl || !pub.name?.trim() || !pub.platform) && (
                              <p className="text-[10px] text-red-400/60">{t('requiredFieldsWarning')}</p>
                            )}
                            {!isPro && (
                              <p className="text-[11px] font-medium text-gray-400">
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Result Section */}
                        <div className="space-y-6">
                          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{t('optimizedContent')}</h4>

                          {pub.optimized_content.title ? (
                            <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10 animate-fade-in shadow-[0_8px_30px_rgb(0,0,0,0.12)]">

                              {/* 1. Hero Image (Portada) */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-[10px] text-white uppercase font-bold tracking-wider">{t('optimizedPreview')}</Label>
                                </div>
                                <div className="group relative aspect-video rounded-lg border border-white/10 bg-white/5 overflow-hidden shadow-inner font-mono">
                                  {pub.optimized_content.imageUrl || pub.product_data.imageUrl ? (
                                    <>
                                      <img
                                        src={pub.optimized_content.imageUrl || pub.product_data.imageUrl}
                                        className="h-full w-full object-contain p-2"
                                      />
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-12 w-12 text-white border border-white/20 hover:bg-white/10"
                                          onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = (pub.optimized_content.imageUrl || pub.product_data.imageUrl)!;
                                            link.download = `optimized-main-${pub.id}.png`;
                                            link.click();
                                          }}
                                        >
                                          <Download className="h-6 w-6" />
                                        </Button>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                      <span className="text-[10px] text-gray-700">{t('noImage')}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* 2. Galería de Imágenes (Ahora debajo de la principal) */}
                              {((pub.optimized_content.additionalOptimizedImages && pub.optimized_content.additionalOptimizedImages.length > 0) || (pub.product_data.additionalImages && pub.product_data.additionalImages.length > 0)) && (
                                <div className="space-y-3 pt-2 border-t border-white/5">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-[10px] text-white uppercase font-bold tracking-wider">{t('additionalImagesResult')}</Label>
                                  </div>

                                  <div className="grid grid-cols-4 gap-2">
                                    {(pub.optimized_content.additionalOptimizedImages || pub.product_data.additionalImages)?.map((img, idx) => (
                                      <div key={idx} className="group relative aspect-square rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden">
                                        <img src={img} className="h-full w-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-white hover:text-zinc-300"
                                            onClick={() => {
                                              const link = document.createElement('a');
                                              link.href = img;
                                              link.download = `optimized-extra-${idx}-${pub.id}.png`;
                                              link.click();
                                            }}
                                          >
                                            <Download className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 3. Precio Sugerido */}
                              <div className="p-4 rounded-lg bg-white/5 border border-white/10 shadow-sm mt-4">
                                <div className="flex items-center justify-between mb-1">
                                  <Label className="text-[10px] text-white uppercase font-bold tracking-wider text-xs">{t('suggestedPrice')}</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-3xl font-semibold text-white tracking-tight">
                                    {format(
                                      convert(Number(pub.optimized_content.suggestedPrice || 0), currency, selectedCurrencies[pub.id] || currency),
                                      selectedCurrencies[pub.id] || currency
                                    )}
                                  </span>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 bg-white/5 text-white font-medium hover:bg-white/10 border border-white/10 px-2.5 py-1 text-[10px] gap-1.5 rounded-md transition-all outline-none ring-0 focus-visible:ring-0"
                                      >
                                        {selectedCurrencies[pub.id] || currency}
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

                              {/* 4. Título */}
                              <div className="space-y-2 pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                  <Label className="text-[10px] text-white uppercase font-bold">{t('optimizedTitle')}</Label>
                                  <div className="flex items-center gap-2">
                                    {isPro && pub.optimized_content.optimizationState && (
                                      <Badge variant="outline" className="text-[10px] py-0 px-2 border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                                        {pub.optimized_content.optimizationState}
                                      </Badge>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-white hover:bg-white/10"
                                      onClick={() => handleCopy(pub.optimized_content.title || '', pub.id + '-title')}
                                    >
                                      {copyStatus[pub.id + '-title'] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-white text-lg font-bold leading-tight">{pub.optimized_content.title}</p>
                              </div>

                              {/* 5. Descripción */}
                              <div className="space-y-2 pt-4 border-t border-white/5 pb-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-[10px] text-white uppercase font-bold">{t('strategicDescription')}</Label>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-white hover:bg-white/10"
                                    onClick={() => handleCopy(pub.optimized_content.description || '', pub.id + '-desc')}
                                  >
                                    {copyStatus[pub.id + '-desc'] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                  </Button>
                                </div>
                                <div className="text-gray-400 text-xs leading-relaxed max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                  {formatText(pub.optimized_content.description || '')}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap pt-4">
                                <p className="text-[10px] text-white uppercase font-bold">
                                  {t('aiModelUsed')}
                                </p>
                                {pub.optimized_content.modelUsed && (
                                  <a
                                    href="https://www.llama.com/docs/model-cards-and-prompt-formats/llama3_3/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] 
                                               border border-white/20 bg-white/5 text-white 
                                               hover:bg-white/10 transition-all font-mono"
                                  >
                                    {pub.optimized_content.modelUsed}
                                    <span className="text-[8px] opacity-50">↗</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="h-[250px] border border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-center p-6 bg-white/[0.01]">
                              <p className="text-gray-500 text-sm">{t('selectPlatformPrompt')}</p>
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
            <DialogTitle>{t('newPublicationDialog')}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-gray-300">{t('nameYourPublication')}</Label>
              <Input
                id="name"
                placeholder={t('namePlaceholder')}
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
              {tc('cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={!newPubName.trim()} className="bg-white text-black hover:bg-gray-200">
              {tc('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
