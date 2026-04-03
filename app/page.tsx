'use client';
import React from "react";
import { FaTiktok } from "react-icons/fa";
import { cn } from "@/lib/utils";



import { useEffect, useState, useRef } from 'react';

import { useRouter } from 'next/navigation';

import Link from 'next/link';

import { ArrowRight, Check, Brain, HeartHandshakeIcon, Menu, X, Instagram, Crown, Users, Plus, BriefcaseBusiness, Image, LayoutDashboard, Settings, Mail, Bell, MessageSquare, ChevronDown, CreditCard, ShoppingBag, Sparkles, TrendingUp, BarChart3, FileText, Layout, ChevronRight } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';
import { animate } from 'framer-motion';
import { useCurrency } from "@/app/contexts/CurrencyContext";




const features = [

  {

    title: 'Optimizador de publicaciones IA',

    description: 'Optimiza tus publicaciones con IA. Tomando en cuenta palabras clave, descripciones, títulos, etc.',

  },



  {

    title: 'Analíticas de publicaciones',

    description: 'Obtén analíticas valiosos de tus publicaciones y mejora tus ventas.',

  },




];



const plans = [

  {

    name: 'Gratuito',

    price: '$0',

    period: '/mes',

    description: 'Perfecto para empezar',

    features: [

      'Hasta 3 publicaciones por mes',




      'Analíticas limitadas',
      'Soporte por email',


    ],

    cta: 'Comenzar gratis',

    highlighted: true,

  },

  {

    name: 'Pro',

    price: '$199',

    period: '/mes',

    description: 'Para negocios serios',

    features: [

      'Publicaciones ilimitadas',







      'Analíticas de publicaciones ilimitadas',
      'Soporte prioritario',
    ],

    cta: 'Comenzar ahora',

    highlighted: false,

  },

];



const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const offset = 80;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const targetPosition = elementRect - bodyRect - offset;

    animate(window.scrollY, targetPosition, {
      type: "tween",
      duration: 0.5,
      ease: [0.65, 0, 0.35, 1], // easeInOutQuart
      onUpdate: (latest) => window.scrollTo(0, latest),
    });
  }
};

export default function Home() {
  const { isLoaded } = useAuth();
  const { proPrice, currency } = useCurrency();

  return (

    <div className="min-h-screen relative">



      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-lg border-b border-white/20">
        <InlineNavbar />
      </nav>







      <section className="pt-32 md:pt-40 pb-12 md:pb-20 relative z-10 overflow-x-clip">
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-[800px] -z-10",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#202020_1px,transparent_1px),linear-gradient(to_bottom,#202020_1px,transparent_1px)]",
            "[mask-image:radial-gradient(circle_at_50%_350px,transparent,black_75%),linear-gradient(to_bottom,black_40%,transparent_100%)]",
            "[mask-composite:intersect]",
          )}
        />

        <div className="max-w-4xl mx-auto px-4">

          <div className="">


            <div className="relative">

              <h1 className="text-center text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 leading-[1.15] tracking-tight 
bg-gradient-to-b from-white via-white to-gray-400
bg-clip-text text-transparent pb-2 mt-10">
                Crea publicaciones en segundos, no horas con IA
              </h1>



              <p className="text-center text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-8 md:mb-10">
                Crea publicaciones optimizadas para e-commerce con IA en segundos.

              </p>

              <div className="flex justify-center items-center gap-3 mb-10" style={{ animationDelay: '0.2s' }}>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`/avatar${i}.png`}
                      alt={`User ${i}`}
                      className="h-9 w-9 md:h-10 md:w-10 rounded-full border-2 border-white object-cover shadow-lg"
                    />
                  ))}
                </div>
                <p className="text-white font-semibold text-lg md:text-1xl tracking-tight ml-2">
                  Únete a <span className="text-white">+100 usuarios</span>
                </p>
              </div>

              <div className="flex flex-col  items-center justify-center ">

                {!isLoaded ? (
                  <div className="w-full sm:w-auto justify-center bg-gradient-to-b from-white via-white to-gray-400 text-black font-medium py-2.5 px-6 rounded-full inline-flex items-center gap-2 h-16">
                    <img src="lpmini.png" alt="" className="w-8 h-8 brightness-0" />  Comienza ahora - Es gratis
                  </div>
                ) : (
                  <>
                    <SignedIn>
                      <Link href="/dashboard" className="w-full sm:w-auto justify-center bg-gradient-to-b from-white via-white to-gray-400 text-black font-medium py-2.5 px-6 rounded-full inline-flex items-center gap-2 cursor-pointer h-16 ">

                        <img src="lpmini.png" alt="" className="w-8 h-8 brightness-0" />  Comienza ahora - Es gratis

                      </Link>
                    </SignedIn>
                    <SignedOut>

                      <SignUpButton>
                        <Link href="/dashboard" className="w-full sm:w-auto justify-center bg-gradient-to-b from-white via-white to-gray-400 text-black font-medium py-2.5 px-6 rounded-full inline-flex items-center gap-2 cursor-pointer h-16 ">

                          <img src="lpmini.png" alt="" className="w-8 h-8 brightness-0" />  Comienza ahora - Es gratis

                        </Link>

                      </SignUpButton>

                    </SignedOut>
                  </>
                )}

                <Link
                  href="#features"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('features');
                  }}
                  className=""
                >


                </Link>

              </div>
              <div className='relative mt-8'>
                <div className="absolute inset-0 bg-black/40 blur-3xl -z-10 scale-[2.5] pointer-events-none" />
                <div className='text-white/30 flex items-center justify-center gap-2 font-semibold tracking-wider'>
                  <CreditCard size={14} />
                  <p> NO SE REQUIERE TARJETA DE CRÉDITO </p>
                </div>
              </div>
            </div>
            {/* Dashboard Preview Section */}
            <DashboardPreview />

          </div>

        </div>

      </section>

      {/* Logos Section */}
      <section className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-500 mb-8 uppercase tracking-widest">
            Usado por vendedores en empresas como
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 md:gap-x-20 lg:gap-x-24">
            {/* Mercado Libre - Local SVG */}
            <img
              src="/logos/mercadolibre.png"
              alt="Mercado Libre"
              className="h-7 md:h-8 lg:h-9 w-auto opacity-70 hover:opacity-100 transition-all duration-300"
              style={{ filter: 'brightness(0) invert(1)' }}
            />

            {/* Facebook Marketplace */}
            <img
              src="https://cdn.simpleicons.org/facebook/white"
              alt="Facebook Marketplace"
              className="h-7 md:h-8 lg:h-9 w-auto opacity-70 hover:opacity-100 transition-all duration-300"
            />

            {/* eBay */}
            <img
              src="https://cdn.simpleicons.org/ebay/white"
              alt="eBay"
              className="h-8 md:h-9 lg:h-10 w-auto opacity-70 hover:opacity-100 transition-all duration-300"
            />

            {/* Shopify */}
            <img
              src="https://cdn.simpleicons.org/shopify/white"
              alt="Shopify"
              className="h-8 md:h-9 lg:h-10 w-auto opacity-70 hover:opacity-100 transition-all duration-300"
            />

            {/* Amazon */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
              alt="Amazon"
              className="h-6 md:h-7 lg:h-8 w-auto opacity-70 hover:opacity-100 transition-all duration-300"
              style={{ filter: 'brightness(0) invert(1)', marginTop: '6px' }}
            />

            {/* Etsy - Local wordmark SVG */}
            <img
              src="/logos/etsy.png"
              alt="Etsy"
              className="h-7 md:h-8 lg:h-9 w-auto opacity-70 hover:opacity-100 transition-all duration-300"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>
        </div>
      </section>

      <section id="premium-features" className="py-24 px-4 border-t border-white/10 relative overflow-hidden bg-black/20">
        <div className="max-w-7xl mx-auto">
          {/* Header with Title and Button */}
          <div className="flex flex-col md:flex-row items-start items-start md:items-center justify-between gap-6 mb-16 px-4">
            <div className="max-w-2xl text-left">
              <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6 tracking-tight">
                Crea publicaciones con IA
              </h2>
              <p className="text-gray-400 text-lg">
                Optimiza y crea publicaciones para e-commerce con IA              </p>
            </div>
            <div className="flex items-center">
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="bg-white text-black font-bold py-3.5 px-8 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
                >
                  <img src="/img.png" alt="" width={20} height={20} />
                  Probar ahora
                  <ChevronRight size={20} strokeWidth={3} />
                </Link>
              </SignedIn>

              <SignedOut>
                <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
                  <button className="bg-white text-black font-bold py-3.5 px-8 rounded-lg hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2">
                    <img src="/img.png" alt="" width={20} height={20} />
                    Probar ahora
                    <ChevronRight size={20} strokeWidth={3} />
                  </button>
                </SignUpButton>
              </SignedOut>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
            {/* Card 1: Optimización de publicaciones */}
            <div className="relative rounded-3xl bg-white/[0.03] border border-white/10 p-8 flex flex-col h-full overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -z-10" />

              {/* Preview Area: Clean listing preview */}
              <div className="relative bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden p-5 aspect-square font-sans flex flex-col">
                <div className="flex flex-col flex-1 gap-4">
                  {/* Header */}
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">VISTA PREVIA OPTIMIZADA</h4>

                  {/* Image Container */}
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-white/10 bg-zinc-900">
                    <img
                      src="/larp.jpg"
                      alt="Larp"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Title Block */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">TÍTULO OPTIMIZADO</h5>
                    <h3 className="text-sm font-bold text-white leading-snug">
                      Bugatti Salvage — Oportunidad única de adquirir un automóvil icónico.
                    </h3>
                  </div>

                  {/* Price Block */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 mt-auto">
                    <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">PRECIO SUGERIDO POR IA</h5>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-2xl font-bold text-white tracking-tight">MX$85,000.00</span>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs font-medium text-zinc-400">
                        MXN <ChevronDown size={14} className="opacity-50" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full w-10 h-10 flex shrink-0 justify-center items-center text-center bg-white/10 text-white">
                    <p className="font-bold">1</p>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Optimización de publicaciones</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Optimiza el título y descripción de tus publicaciones con IA y mejora el posicionamiento de tus productos.
                </p>
              </div>
            </div>

            {/* Card 2: Optimización de Imágenes */}
            <div className="relative rounded-3xl bg-white/[0.03] border border-white/10 p-8 flex flex-col h-full overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -z-10" />

              {/* Replica UI Mockup */}
              <div className="relative bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden p-5 aspect-square font-sans flex flex-col">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">OPTIMIZACIÓN DE IMÁGENES</h4>

                {/* Toolbar Tabs */}
                <div className="flex bg-black p-1 rounded-xl border border-white/5 shadow-inner w-full mb-5 gap-0.5">
                  {[
                    { label: 'FONDO', active: true },
                    { label: 'RESOLUCIÓN' },
                    { label: 'COLOR' },
                    { label: 'NITIDEZ' },
                  ].map((tab, i) => (
                    <div key={i} className={`flex-1 text-center px-2 py-2 rounded-lg ${tab.active ? 'bg-white text-black' : 'text-zinc-500'}`}>
                      <span className="text-[9px] font-black uppercase tracking-wider">{tab.label}</span>
                    </div>
                  ))}
                </div>

                {/* Content Area */}
                <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] space-y-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h5 className="text-sm font-bold text-white">Fondo</h5>
                      <p className="text-[10px] text-zinc-500 font-medium">Elimina el fondo y elige un color sólido.</p>
                    </div>
                    <div className="px-3 py-1.5 bg-white/10 border border-white/10 rounded-md text-[10px] text-zinc-300 font-bold shrink-0">
                      Seleccionar
                    </div>
                  </div>

                  {/* Mock Image Grid */}
                  <div className="flex gap-3">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                      <img src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=200&h=200" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
                        <div className="bg-white rounded-full p-1 shadow-lg">
                          <Check className="h-3 w-3 text-black stroke-[3]" />
                        </div>
                      </div>
                    </div>
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/5 opacity-40">
                      <img src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=200&h=200" className="h-full w-full object-cover" />
                    </div>
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/5 opacity-20">
                      <img src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=200&h=200" className="h-full w-full object-cover" />
                    </div>
                  </div>

                  {/* Color options */}
                  <div className="space-y-2 mt-auto">
                    <h6 className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">FONDO RESULTANTE</h6>
                    <div className="flex gap-2">
                      <div className="h-7 w-7 rounded-lg bg-white border-2 border-white shadow-sm" />
                      <div className="h-7 w-7 rounded-lg bg-black border border-white/10" />
                      <div className="h-7 w-7 rounded-lg bg-zinc-500 border border-white/5" />
                      <div className="h-7 w-7 rounded-lg border border-dashed border-white/20 flex items-center justify-center">
                        <Plus size={10} className="text-zinc-500" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              <div className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full w-10 h-10 flex shrink-0 justify-center items-center text-center bg-white/10 text-white">
                    <p className="font-bold">2</p>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Optimización de Imágenes</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Transforma tus fotos en imágenes de estudio. Elimina fondos, aumenta resolución y mejora colores con IA quirúrgica.
                </p>
              </div>
            </div>

            {/* Card 3: Analíticas avanzadas */}
            <div className="relative rounded-3xl bg-white/[0.03] border border-white/10 p-8 flex flex-col h-full overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -z-10" />

              {/* Preview Area: Stats/Chart */}
              <div className="relative bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden p-5 aspect-square font-sans flex flex-col">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                    <p className="text-[8px] text-zinc-500 font-bold mb-1 uppercase tracking-wider">Publicaciones</p>
                    <p className="text-xl font-bold text-white">24</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                    <p className="text-[8px] text-zinc-500 font-bold mb-1 uppercase tracking-wider">Con IA</p>
                    <p className="text-xl font-bold text-white">18</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                    <p className="text-[8px] text-zinc-500 font-bold mb-1 uppercase tracking-wider">Éxito</p>
                    <p className="text-xl font-bold text-white">94%</p>
                  </div>
                </div>

                {/* Activity Chart Area */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 relative flex-1 flex flex-col">
                  <h4 className="text-[12px] font-bold text-white mb-6">Actividad de Publicación</h4>

                  <div className="relative flex-1 w-full flex items-end pr-2">
                    {/* Y-Axis Labels */}
                    <div className="flex flex-col justify-between text-[9px] text-zinc-600 h-full pr-3 pb-1">
                      <span>30</span>
                      <span>20</span>
                      <span>10</span>
                      <span>0</span>
                    </div>

                    {/* Chart Area */}
                    <div className="flex-1 h-full relative border-l border-b border-white/5">
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Area Fill */}
                        <path
                          d="M 0 95 C 10 92, 20 88, 30 85 C 40 80, 50 70, 60 55 C 70 40, 80 25, 90 15 C 95 8, 98 5, 100 2 L 100 100 L 0 100 Z"
                          fill="url(#chartGradient)"
                        />
                        {/* The Line */}
                        <path
                          d="M 0 95 C 10 92, 20 88, 30 85 C 40 80, 50 70, 60 55 C 70 40, 80 25, 90 15 C 95 8, 98 5, 100 2"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                        />
                        {/* Dot at end */}
                        <circle cx="100" cy="2" r="3" fill="#3b82f6" />
                      </svg>
                    </div>
                  </div>

                  {/* X-Axis Labels */}
                  <div className="flex justify-between ml-[28px] mt-3 text-[9px] text-zinc-600 uppercase tracking-wider">
                    <span>Ene</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Abr</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full w-10 h-10 flex shrink-0 justify-center items-center text-center bg-white/10 text-white">
                    <p className="font-bold">3</p>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Analíticas avanzadas</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Obtén analíticas sobre tus publicaciones y mejora el posicionamiento de tus productos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}

      <section id="features" className="py-20 px-4 border-t border-white/10">

        <div className="max-w-4xl mx-auto">

          <div className="mb-16">

            <h2 className="text-3xl font-medium text-white mb-4">

              Todo lo que necesitas para optimizar tus publicaciones

            </h2>

            <p className="text-gray-400">

              Herramientas potentes para optimizar tus publicaciones de forma eficiente.

            </p>

          </div>




          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">

            {features.map((feature, index) => (

              <div key={index} className="group p-4 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">

                <h3 className="text-white font-medium mb-2">{feature.title}</h3>

                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>

              </div>

            ))}

          </div>

        </div>

      </section>



      {/* Pricing Section */}

      <section id="pricing" className="py-20 px-4 border-t border-white/10">

        <div className="max-w-5xl mx-auto">

          <div className="mb-16 text-center">

            <h2 className="text-3xl font-medium text-white mb-4">

              Planes simples y transparentes

            </h2>

            <p className="text-gray-400">

              Comienza gratis y actualiza cuando tu negocio crezca.

            </p>

          </div>



          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">

            {plans.map((plan, index) => (

              <div

                key={index}

                className={`flex flex-col p-6 md:p-8 rounded-2xl border transition-all ${plan.highlighted ? 'border-white/30 bg-white/5 ring-1 ring-white/10 scale-100 md:scale-105' : 'border-white/10 bg-black/40'}`}

              >

                <div className="mb-6">

                  <h3 className="text-white font-semibold text-xl mb-1">{plan.name}</h3>

                  <span className="text-4xl font-bold text-white">
                    {plan.name === 'Pro' ? proPrice : `${plan.price} ${currency}`}
                  </span>

                  <span className="text-gray-500 text-sm">{plan.period}</span>

                  <p className="text-gray-400 text-sm mt-3">{plan.description}</p>

                </div>



                <ul className="space-y-4 mb-8 flex-1">

                  {plan.features.map((feature, i) => (

                    <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">

                      <Check size={16} className="text-white mt-0.5 flex-shrink-0" />

                      <span>{feature}</span>

                    </li>

                  ))}

                </ul>



                <SignedIn>
                  <Link
                    href={plan.highlighted ? '/dashboard' : '/checkout'}
                    className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all shadow-lg ${plan.highlighted
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                  >
                    {plan.cta}
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
                    <button
                      className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all shadow-lg ${plan.highlighted
                        ? 'bg-white text-black hover:bg-gray-100'
                        : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    >
                      {plan.cta}
                    </button>
                  </SignUpButton>
                </SignedOut>

              </div>

            ))}

          </div>

        </div>

      </section>



      {/* FAQ Section */}
      <section className="py-24 px-4 border-t border-white/10" id="faq">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-white mb-6">
            Preguntas Frecuentes
          </h2>
          <p className="text-gray-400 mb-12">Preguntas, reclamos, inquietudes gestionadas por nuestros usuarios</p>

          <div className="border-t border-white/10">
            {[
              {
                "q": "¿Qué es Inventra?",
                "a": "Inventra es una herramienta impulsada por inteligencia artificial que te ayuda a crear publicaciones optimizadas para e-commerce en segundos, ahorrándote horas de trabajo."
              },
              {
                "q": "¿Para quién es Inventra?",
                "a": "Inventra está diseñado para vendedores de e-commerce que necesitan crear publicaciones rápidas, claras y optimizadas para plataformas como Mercado Libre, Facebook Marketplace y más."
              },
              {
                "q": "¿Cómo funciona?",
                "a": "Solo ingresas la información básica de tu producto y nuestra IA genera automáticamente una publicación optimizada según la plataforma donde quieras vender."
              },
              {
                "q": "¿Puedo usarlo aunque no tenga e-commerce?",
                "a": "Sí. No necesitas tener un e-commerce propio. Inventra funciona para cualquier persona que necesite crear publicaciones para vender productos en plataformas online."
              },
              {
                "q": "¿Qué nos diferencia de la competencia?",
                "a": "Inventra está específicamente diseñado para crear publicaciones de e-commerce. Utiliza formatos optimizados, estructuras de venta probadas y datos actualizados de las plataformas para generar publicaciones listas para publicar."
              },
              {
                "q": "¿Qué tipos de planes tiene Inventra?",
                "a": "Inventra está específicamente diseñado para crear publicaciones de e-commerce. Utiliza formatos optimizados, estructuras de venta probadas y datos actualizados de las plataformas para generar publicaciones listas para publicar."
              }
              ,
              {
                "q": "¿Están hechos para México?",
                "a": "Sí, aunque servimos a clientes globales, Inventra está diseñado con especial atención a las plataformas populares en México y Latinoamérica."
              }
            ].map((faq, index) => (
              <FAQItem key={index} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>



      {/* Inlined Footer (previously in app/components/Footer.tsx) */}

      <footer className="border-t border-white/10 py-12">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">

              <img

                src="/inventralogo.png"

                alt="Inventra Factura"

                width={120}

                height={28}

                className="h-6 w-auto opacity-80"

              />

              <p className="text-gray-500 text-sm">

                &copy; {new Date().getFullYear()} Inventra.

              </p>

            </div>

          </div>

        </div>

      </footer>





    </div>

  );

}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/10 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-white font-medium pr-8">{question}</span>
        <ChevronDown
          className={`size-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-gray-400 text-sm leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}



function DashboardPreview() {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        // Obtenemos el ancho del contenedor padre (max-w-4xl aprox 896px)
        const parentWidth = containerRef.current.offsetWidth || window.innerWidth;
        // El chasis completo tiene un ancho de referencia de 1040px (1000px dash + padding/borders)
        const referenceWidth = 1040;
        const newScale = Math.min(1, parentWidth / referenceWidth);
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div ref={containerRef} className="mt-16 md:mt-24 relative w-full max-w-[1040px] mx-auto aspect-[1040/560]">
      {/* Brillo de fondo mejorado - Escala con el contenedor */}
      <div
        className="absolute -inset-10 bg-gradient-to-r from-blue-600/10 via-transparent to-purple-600/10 blur-[100px] -z-10 opacity-60"
        style={{ transform: `scale(${scale})` }}
      />

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 origin-top"
        style={{
          width: '1040px',
          transform: `scale(${scale})`
        }}
      >
        {/* Marco exterior grueso (Chasis) */}
        <div
          className="relative rounded-[2.5rem] border-[10px] border-[#1a1a1a] p-0.5 bg-[#0a0a0a] shadow-[0_0_60px_rgba(0,0,0,0.9)] pointer-events-none select-none origin-bottom opacity-100"
          style={{
            perspective: '2000px',
            transform: 'rotateX(6deg)',
          }}
        >
          {/* Borde interior fino (Efecto cristal/luz) */}
          <div className="relative rounded-[1.8rem] border border-white/5 bg-[#070707] overflow-hidden">
            {/* Reflejo de luz superior */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none z-20" />

            {/* El Dashboard real (Interno) */}
            <div className="flex h-[500px] w-[1000px] bg-[#070707] text-gray-300 font-sans shrink-0">
              {/* Mock Sidebar */}
              <div className="w-52 border-r border-white/5 bg-[#0a0a0a] flex flex-col shrink-0">
                <div className="p-4 border-b border-white/5 flex justify-center">
                  <img src="/inventralogo.png" alt="Logo" className="h-6 w-auto opacity-90" />
                </div>

                <div className="flex-1 py-4 px-3 space-y-6">
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2 flex items-center gap-2">
                      General
                    </div>
                    <div className="space-y-1">
                      {[
                        { icon: LayoutDashboard, label: 'Dashboard', active: true },
                        { icon: ShoppingBag, label: 'Publicaciones', active: false },
                        { icon: Settings, label: 'Configuración', active: false },
                      ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${item.active ? 'text-white bg-white/10 font-medium' : 'text-gray-400'}`}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">Soporte</div>
                    <div className="px-3 py-2 flex items-start gap-3 bg-white/5 rounded-lg border border-white/5">
                      <Mail className="size-4 mt-1" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white">Contacto</div>
                        <div className="text-[9px] text-blue-400 truncate">inventramx@gmail.com</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-white/5 flex items-center gap-3">
                  <div className="size-8 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white">U</div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-white truncate">Usuario</div>
                    <div className="text-[10px] text-gray-500 truncate">pro@inventra.mx</div>
                  </div>
                </div>
              </div>

              {/* Mock Main Content */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#070707]">
                {/* Header */}
                <header className="h-14 border-b border-white/5 flex items-center px-6 bg-[#0a0a0a]">
                  <Menu className="size-4 text-gray-500 mr-4" />
                  <div className="flex-1" />
                  <div className="flex items-center gap-4 text-gray-500">
                    <Bell className="size-4" />
                    <div className="size-6 rounded-full border border-white/10" />
                  </div>
                </header>

                {/* Page Content */}
                <div className="p-6 space-y-8 overflow-y-auto no-scrollbar">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Bienvenido, Usuario </h2>
                    <p className="text-xs text-gray-500 mt-1">Aquí tienes un resumen de tu actividad.</p>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'Publicaciones', value: '48', sub: 'Total creadas', icon: ShoppingBag, color: 'text-blue-400' },
                      { label: 'Optimizaciones', value: '32', sub: 'Generadas con IA', icon: Sparkles, color: 'text-emerald-400' },
                      { label: 'Eficiencia', value: '86%', sub: 'Tasa de éxito', icon: TrendingUp, color: 'text-indigo-400' },
                      { label: 'Plan', value: 'Pro', sub: 'Acceso completo', icon: Crown, color: 'text-amber-400' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-[#0a0a0a] border border-white/5 p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-tight">{stat.label}</span>
                          <stat.icon className={`size-4 ${stat.color} opacity-80`} />
                        </div>
                        <div className="text-xl font-bold text-white">{stat.value}</div>
                        <div className="text-[10px] text-gray-500 mt-1">{stat.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <div className="px-4 py-1.5 bg-white text-black text-xs font-semibold rounded-lg flex items-center gap-2">
                      <Plus className="size-3" /> Nueva Publicación
                    </div>
                    <div className="px-4 py-1.5 border border-white/10 text-white text-xs font-semibold rounded-lg flex items-center gap-2">
                      <Sparkles className="size-3" /> Ver Analíticas
                    </div>
                  </div>

                  {/* Table */}
                  <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center">
                      <div className="text-xs font-bold text-white">Publicaciones Recientes</div>
                      <div className="text-[10px] text-blue-400 font-medium">Ver todas →</div>
                    </div>
                    <div className="p-0 overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-white/[0.02] text-gray-500 border-b border-white/5">
                          <tr>
                            <th className="px-4 py-3 font-medium uppercase tracking-tighter">Producto</th>
                            <th className="px-4 py-3 font-medium uppercase tracking-tighter">Plataforma</th>
                            <th className="px-4 py-3 font-medium uppercase tracking-tighter text-center">Estado</th>
                            <th className="px-4 py-3 font-medium uppercase tracking-tighter text-right">Fecha</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {[
                            { name: 'iPhone 15 Pro Max', platform: 'Mercado Libre', date: 'Hoy', status: 'Optimizado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                            { name: 'MacBook Air M2', platform: 'Amazon', date: 'Ayer', status: 'Borrador', color: 'bg-blue-400/10 text-blue-400 border-blue-400/20' },
                            { name: 'Sony WH-1000XM5', platform: 'Etsy', date: '12 Mar', status: 'Optimizado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                          ].map((pub, i) => (
                            <tr key={i}>
                              <td className="px-4 py-3 text-white font-medium">{pub.name}</td>
                              <td className="px-4 py-3 text-gray-400">{pub.platform}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-medium ${pub.color}`}>
                                  {pub.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right text-gray-500">{pub.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



// Inline Navbar component implementation

function InlineNavbar() {
  const { isLoaded } = useAuth();
  const { proPrice } = useCurrency();
  const [isMenuOpen, setIsMenuOpen] = useState(false);



  return (

    <div>
      <div className="">   <Link
        href="/checkout"
        className='flex items-center justify-center bg-black  text-white border-b border-white/10 w-full h-14  group'
      >
        <p className="text-sm font-medium flex items-center gap-2 ">
          <img src="/lpmini.png" alt="Logo" className="w-6 h-auto" />
          <span>Aprovecha Inventra al máximo y adquiere <span className="text-white font-bold">Inventra Pro</span> por solo {proPrice}</span>
          <ArrowRight className="w-4 h-4 " />
        </p>
      </Link></div>
      <SignedIn>

      </SignedIn>
      <SignedOut>

      </SignedOut>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/inventralogo.png"
                alt="Inventra Factura"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="text-white font-semibold hidden sm:inline"></span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('features');
              }}
              className="text-slate-300 hover:text-white transition-colors"
            >
              Características
            </Link>
            <Link
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('pricing');
              }}
              className="text-slate-300 hover:text-white transition-colors"
            >
              Planes
            </Link>
            <Link
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('faq');
              }}
              className="text-slate-300 hover:text-white transition-colors"
            >
              FAQ
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4 min-w-[200px] justify-end">
            {!isLoaded ? (
              <div className="flex items-center gap-4">
                <a className="text-slate-300 px-2">Iniciar Sesión</a>
                <a className="bg-white text-black font-medium py-2 px-6 rounded-lg text-sm ml-2">Registrarse</a>
              </div>
            ) : (
              <>
                <SignedOut>
                  <SignInButton>
                    <a className="text-slate-300 hover:text-white cursor-pointer px-2">Iniciar Sesión</a>
                  </SignInButton>
                  <SignUpButton>
                    <a className="bg-white text-black font-medium py-2 px-6 rounded-lg text-sm cursor-pointer ml-2">Registrarse</a>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard" className="bg-white text-black font-medium py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                    Dashboard
                  </Link>
                  <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-9 h-9' } }} />
                </SignedIn>
              </>
            )}
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <div className="flex flex-col gap-4">
              <Link
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  scrollToSection('features');
                }}
                className="text-slate-300 hover:text-white transition-colors"
              >
                Características
              </Link>
              <Link
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  scrollToSection('pricing');
                }}
                className="text-slate-300 hover:text-white transition-colors"
              >
                Planes
              </Link>
              {!isLoaded ? (
                <div className="h-10 w-full bg-white/5 animate-pulse rounded-lg" />
              ) : (
                <>
                  <SignedOut>
                    <SignInButton>
                      <a className="text-slate-300 hover:text-white cursor-pointer py-2">Iniciar Sesión</a>
                    </SignInButton>
                    <SignUpButton>
                      <a className="bg-white text-black font-medium py-2 px-6 rounded-lg text-sm text-center cursor-pointer">Registrarse</a>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="bg-white text-black font-medium py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors text-sm text-center">
                      Dashboard
                    </Link>
                    <div className="flex items-center gap-2">
                      <UserButton afterSignOutUrl="/" />
                      <span className="text-slate-400 text-sm">Cuenta</span>
                    </div>
                  </SignedIn>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

  );

}