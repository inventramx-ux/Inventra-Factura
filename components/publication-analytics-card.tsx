"use client"

import React, { useMemo } from "react"
import { Publication } from "@/lib/publications"
import { analyzePublication, getScoreColor } from "@/lib/publication-score"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, Trophy, Lightbulb } from "lucide-react"
import { useTranslations } from "next-intl"

// ---------------------------------------------------------------------------
// Score ring — CSS conic-gradient, no extra chart library
// ---------------------------------------------------------------------------
interface ScoreRingProps {
  score: number
  size?: number
}

function ScoreRing({ score, size = 80 }: ScoreRingProps) {
  const color = getScoreColor(score)
  const pct = (score / 100) * 360

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `conic-gradient(${color} 0deg ${pct}deg, rgba(255,255,255,0.06) ${pct}deg 360deg)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {/* Inner circle */}
      <div
        style={{
          width: size - 14,
          height: size - 14,
          borderRadius: "50%",
          background: "#0f172a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color, fontSize: size * 0.28, fontWeight: 700, lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: size * 0.14, marginTop: 1 }}>
          /100
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Platform badge colours
// ---------------------------------------------------------------------------
const PLATFORM_COLORS: Record<string, string> = {
  "MercadoLibre": "#ffe900",
  "Amazon":       "#ff9900",
  "Facebook Marketplace": "#1877f2",
  "Shopify":      "#96bf48",
  "eBay":         "#e53238",
}

function PlatformChip({ name, rank }: { name: string; rank: number }) {
  const color = PLATFORM_COLORS[name] ?? "#60a5fa"
  const medals = ["🥇", "🥈", "🥉"]
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm">{medals[rank] ?? "•"}</span>
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{ background: color + "22", color, border: `1px solid ${color}44` }}
      >
        {name}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main card
// ---------------------------------------------------------------------------
interface PublicationAnalyticsCardProps {
  publication: Publication
}

export function PublicationAnalyticsCard({ publication }: PublicationAnalyticsCardProps) {
  const t = useTranslations("analytics")

  const analysis = useMemo(() => analyzePublication(publication), [publication])
  const scoreColor = getScoreColor(analysis.score)

  const scoreLabel =
    analysis.score >= 71
      ? "✓"
      : analysis.score >= 41
      ? "~"
      : "!"

  return (
    <Card className="bg-white/5 border-white/10 hover:bg-white/[0.07] transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 text-sm font-bold"
              style={{ background: `${scoreColor}20`, color: scoreColor }}
            >
              {scoreLabel}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{publication.name}</p>
              {publication.platform && (
                <Badge className="mt-0.5 text-[10px] bg-white/10 border-white/10 text-gray-300">
                  {publication.platform}
                </Badge>
              )}
            </div>
          </div>
          <ScoreRing score={analysis.score} size={72} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Best platforms */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-medium text-gray-300">{t("bestPlatforms")}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {analysis.bestPlatforms.map((p, i) => (
              <PlatformChip key={p} name={p} rank={i} />
            ))}
          </div>
        </div>

        {/* Suggestions */}
        {analysis.suggestionKeys.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Lightbulb className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs font-medium text-gray-300">{t("suggestions")}</span>
            </div>
            <ul className="space-y-1.5">
              {analysis.suggestionKeys.slice(0, 4).map((key) => (
                <li key={key} className="flex items-start gap-1.5">
                  <AlertCircle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-gray-400 leading-snug">{t(key as any)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.suggestionKeys.length === 0 && (
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400">Listing fully optimized</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Section wrapper — grid of cards + Pro gate
// ---------------------------------------------------------------------------
interface PublicationAnalyticsSectionProps {
  publications: Publication[]
  isPro: boolean
}

export function PublicationAnalyticsSection({ publications, isPro }: PublicationAnalyticsSectionProps) {
  const t = useTranslations("analytics")

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold text-white">{t("pubAnalytics")}</h2>
        <p className="text-sm text-gray-400 mt-0.5">{t("pubAnalyticsSubtitle")}</p>
      </div>

      {/* Pro gate */}
      <div className="relative">
        {!isPro && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
              <Trophy className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-blue-400 font-semibold mb-1">{t("proSectionPubs")}</h3>
            <p className="text-blue-400/80 text-sm mb-4 max-w-xs">{t("proSectionPubsDesc")}</p>
            <a
              href="/dashboard/upgrade"
              className="px-4 py-1.5 rounded-lg bg-blue-400 hover:bg-blue-500 text-black text-xs font-bold transition-colors"
            >
              {t("upgradeNow")}
            </a>
          </div>
        )}

        <div className={!isPro ? "blur-[3px] pointer-events-none select-none" : ""}>
          {publications.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">{t("noPubs")}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {publications.map((pub) => (
                <PublicationAnalyticsCard key={pub.id} publication={pub} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
