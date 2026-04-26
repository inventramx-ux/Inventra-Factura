import { Publication } from './publications'

export interface PublicationAnalysis {
  score: number
  bestPlatforms: string[]
  suggestionKeys: string[]
}

// ---------------------------------------------------------------------------
// Platform fitness — returns ordered array of platform names for this pub
// ---------------------------------------------------------------------------
const PLATFORM_POOL = [
  'MercadoLibre',
  'Amazon',
  'Facebook Marketplace',
  'Shopify',
  'eBay',
]

function rankPlatforms(pub: Publication): string[] {
  const scores: Record<string, number> = {
    MercadoLibre: 50,
    Amazon: 40,
    'Facebook Marketplace': 35,
    Shopify: 30,
    eBay: 28,
  }

  const { product_data } = pub
  const category = (product_data.category || '').toLowerCase()
  const hasImage = !!product_data.imageUrl
  const hasAdditionalImages = (product_data.additionalImages?.length ?? 0) >= 2
  const hasMsi = !!product_data.msi
  const hasBgRemoved = !!product_data.imageOptimization?.removeBackgroundIndices?.length
  const hasPrice = !!product_data.price

  // Electronics → Amazon boost
  if (/electr|tech|comput|celul|phone|gaming/.test(category)) {
    scores['Amazon'] += 20
    scores['MercadoLibre'] += 10
    scores['eBay'] += 15
  }

  // Clothing → MercadoLibre + Facebook
  if (/ropa|cloth|hoodie|camis|zapat|shoe|jacket|sudad/.test(category)) {
    scores['MercadoLibre'] += 15
    scores['Facebook Marketplace'] += 18
  }

  // Home / furniture
  if (/hogar|home|mueble|furni|decor/.test(category)) {
    scores['Facebook Marketplace'] += 20
    scores['MercadoLibre'] += 10
  }

  // MSI heavily prefers MercadoLibre (Mexico feature)
  if (hasMsi) scores['MercadoLibre'] += 25

  // Background removed → Amazon loves clean images
  if (hasBgRemoved) scores['Amazon'] += 10

  // No image is a heavy penalty everywhere
  if (!hasImage) {
    Object.keys(scores).forEach(k => { scores[k] -= 20 })
  }

  // Additional images boost Amazon & MercadoLibre
  if (hasAdditionalImages) {
    scores['Amazon'] += 8
    scores['MercadoLibre'] += 8
  }

  // Price available → slight boost everywhere
  if (hasPrice) {
    Object.keys(scores).forEach(k => { scores[k] += 5 })
  }

  // If the publication already has a platform set, bump it to top
  if (pub.platform) {
    const name = pub.platform
    if (scores[name] !== undefined) {
      scores[name] += 30
    } else {
      // Unknown platform — keep it, add it as first recommendation
      return [name, ...PLATFORM_POOL.filter(p => p !== name).sort((a, b) => scores[b] - scores[a]).slice(0, 2)]
    }
  }

  return PLATFORM_POOL.sort((a, b) => scores[b] - scores[a]).slice(0, 3)
}

// ---------------------------------------------------------------------------
// Scoring — weighted heuristics, result 0-100
// ---------------------------------------------------------------------------
export function analyzePublication(pub: Publication): PublicationAnalysis {
  const { product_data, optimized_content } = pub
  let score = 0
  const suggestionKeys: string[] = []

  // +30 — has AI-optimized content
  if (optimized_content?.title && optimized_content?.description) {
    score += 30
  } else {
    suggestionKeys.push('suggNoOptimized')
  }

  // +15 — has main image
  if (product_data.imageUrl) {
    score += 15
  } else {
    suggestionKeys.push('suggNoImage')
  }

  // +10 — has ≥2 additional images
  if ((product_data.additionalImages?.length ?? 0) >= 2) {
    score += 10
  } else {
    suggestionKeys.push('suggNoAdditionalImages')
  }

  // +10 — price provided
  if (product_data.price) {
    score += 10
  } else {
    suggestionKeys.push('suggNoPrice')
  }

  // +7 — platform specified
  if (pub.platform) {
    score += 7
  } else {
    suggestionKeys.push('suggNoPlatform')
  }

  // +8 — brand/model
  if (product_data.brand || product_data.model) {
    score += 8
  } else {
    suggestionKeys.push('suggNoBrand')
  }

  // +7 — category
  if (product_data.category) {
    score += 7
  } else {
    suggestionKeys.push('suggNoCategory')
  }

  // +5 — condition
  if (product_data.condition) score += 5

  // +4 — warranty
  if (product_data.warranty) score += 4

  // +4 — stock
  if (product_data.stock) score += 4

  const finalScore = Math.min(100, Math.max(0, score))

  return {
    score: finalScore,
    bestPlatforms: rankPlatforms(pub),
    suggestionKeys,
  }
}

// ---------------------------------------------------------------------------
// Score color tier helper
// ---------------------------------------------------------------------------
export function getScoreColor(score: number): string {
  if (score >= 71) return '#10b981' // emerald-400
  if (score >= 41) return '#f59e0b' // amber-400
  return '#f87171'                  // red-400
}
