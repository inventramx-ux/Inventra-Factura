'use client';
import React from "react";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { FaTiktok } from "react-icons/fa";


import { useEffect, useState, useRef } from 'react';

import { useRouter } from 'next/navigation';

import Link from 'next/link';

import { ArrowRight, Check, Brain, HeartHandshakeIcon, Menu, X, Instagram, Crown, Users, Plus, BriefcaseBusiness, LayoutDashboard, Settings, Mail, Bell, MessageSquare, ChevronDown, CreditCard, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react';

import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';
import { animate } from 'framer-motion';




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

  return (

    <div className="min-h-screen relative">
      <BackgroundRippleEffect />
      


      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-lg border-b border-white/20">
        <InlineNavbar />
      </nav>





      <section className="pt-32 md:pt-40 pb-12 md:pb-20 px-4 relative z-10">

        <div className="max-w-4xl mx-auto">

          <div className="animate-fade-in-up">



            <h1 className="text-center text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 leading-[1.15] tracking-tight 
bg-gradient-to-b from-white via-white to-gray-400
bg-clip-text text-transparent pb-2 mt-10">
              Crea publicaciones en segundos, no horas con IA
            </h1>



            <p className="text-center text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-8 md:mb-10">
              Crea publicaciones optimizadas para e-commerce con IA en segundos.

            </p>

            <div className="flex justify-center items-center gap-3 mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
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

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">

              <SignedIn>
                <Link href="/dashboard" className="w-full sm:w-auto justify-center bg-gradient-to-b from-white via-white to-gray-400 text-black font-medium py-2.5 px-6 rounded-full hover:bg-gray-200 transition-colors inline-flex items-center gap-2 cursor-pointer h-16 ">

                  <img src="lpmini.png" alt="" className="w-8 h-8 brightness-0" />  Comienza ahora - Es gratis

                </Link>

              </SignedIn>

              <SignedOut>

                <SignUpButton>

                  <a className="w-full sm:w-auto justify-center bg-gradient-to-b from-white via-white to-gray-400 text-black font-medium py-2.5 px-6 rounded-full hover:bg-gray-200 transition-colors inline-flex items-center gap-2 cursor-pointer h-16 ">

                    <img src="lpmini.png" alt="" className="w-8 h-8 brightness-0" />  Comienza ahora - Es gratis

                  </a>

                </SignUpButton>

              </SignedOut>

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
            <div className='text-white/30 flex items-center justify-center gap-2 mt-8 font-semibold tracking-wider'>
              <CreditCard size={14} />
              <p> NO SE REQUIERE TARJETA DE CRÉDITO </p>
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

                  <div className="flex items-baseline gap-1">

                    <span className="text-4xl font-bold text-white">{plan.price}</span>

                    <span className="text-gray-500 text-sm">{plan.period}</span>

                  </div>

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
                  <Link
                    href="/sign-up"
                    className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all shadow-lg ${plan.highlighted
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                  >
                    {plan.cta}
                  </Link>
                </SignedOut>

              </div>

            ))}

          </div>

        </div>

      </section>



      {/* FAQ Section */}
      <section className="py-24 px-4 border-t border-white/10" id="faq">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-white mb-12">
            Preguntas Frecuentes
          </h2>

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
              <a href="https://www.instagram.com/inventramx/"><Instagram size={24} className="text-white" /></a>
              <a href="https://www.tiktok.com/@inventra50"><FaTiktok size={24} className="text-white" />
              </a>
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
    <div ref={containerRef} className="mt-16 md:mt-24 relative w-full flex justify-center">
      {/* Brillo de fondo mejorado - Escala con el contenedor */}
      <div
        className="absolute -inset-10 bg-gradient-to-r from-blue-600/10 via-transparent to-purple-600/10 blur-[100px] -z-10 opacity-60"
        style={{ transform: `scale(${scale})` }}
      />

      <div
        className="relative origin-top transition-transform duration-200"
        style={{
          width: '1040px',
          height: `${560 * scale}px`, // Altura base + margen chasis
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);



  return (

    <div>
      <SignedIn>
        <Link
          href="/checkout"
          className='flex items-center justify-center bg-black  text-white border-b border-white/10 w-full h-14  group'
        >
          <p className="text-sm font-medium flex items-center gap-2 ">
            <img src="/lpmini.png" alt="Logo" className="w-6 h-auto" />
            <span>Aprovecha Inventra al máximo y adquiere <span className="text-white font-bold">Inventra Pro</span> por solo $199 MXN</span>
            <ArrowRight className="w-4 h-4 " />
          </p>
        </Link>
      </SignedIn>
      <SignedOut>
        <Link
          href="/sign-up"
          className='flex items-center justify-center bg-black  text-white border-b border-white/10 w-full h-14  group'
        >
          <p className="text-sm font-medium flex items-center gap-2 ">
            <img src="/lpmini.png" alt="Logo" className="w-6 h-auto" />
            <span>Aprovecha Inventra al máximo y adquiere <span className="text-white font-bold">Inventra Pro</span> por solo $199 MXN</span>
            <ArrowRight className="w-4 h-4 " />
          </p>
        </Link>
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
              <div className="h-9 w-40 bg-white/5 animate-pulse rounded-lg" />
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