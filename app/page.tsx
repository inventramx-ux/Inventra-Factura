'use client';



import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import Link from 'next/link';

import { ArrowRight, Check, Brain, HeartHandshakeIcon, Menu, X, Crown, FileText, Users, DollarSign, Plus, LayoutDashboard, Settings, Mail, Bell, MessageSquare, ChevronDown } from 'lucide-react';

import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import { animate } from 'framer-motion';




const features = [

  {

    title: 'Facturas CFDI 4.0',

    description: 'Facturas validadas por el SAT CFDI 4.0, timbradas a través de Facturapi.',

  },



  {

    title: 'Facturación Manual',

    description: 'Ingresa los datos manualmente y genera facturas profesionales en cuestión de segundos.',

  },

  {

    title: 'Gestión de Clientes',

    description: 'Mantén un registro completo de tus clientes y consulta sus historiales de compra detallados.',

  },

  {

    title: 'Analíticas',

    description: 'Visualiza reportes detallados y estadísticas de tus facturas y el comportamiento de tus clientes.',

  },



];



const plans = [

  {

    name: 'Gratuito',

    price: '$0',

    period: '/mes',

    description: 'Perfecto para empezar',

    features: [

      'Hasta 3 facturas por mes',

      'Gestión de hasta 2 clientes',

      'Personalización básica',

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

      'Facturas ilimitadas',
      'Personalización avanzada',

      'Clientes ilimitados',



      'Soporte prioritario',

      'Sin marca de agua',
      'Analíticas de facturación',

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

    <div className="min-h-screen">

      {/* Inlined Navbar (previously in app/components/Navbar.tsx) */}

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080808] backdrop-blur-lg border-b border-white/20">
        <InlineNavbar />
      </nav>





      <section className="pt-32 md:pt-40 pb-12 md:pb-20 px-4">

        <div className="max-w-4xl mx-auto">

          <div className="animate-fade-in-up">

            <p className="bg-[#080808] px-4 py-2 rounded-full w-fit flex items-center gap-2 border border-white/10 text-sm text-gray-300 mb-8">

              <HeartHandshakeIcon size={14} />

              SISTEMA DE FACTURACIÓN PARA E-COMMERCE CDFI 4.0
            </p>



            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 leading-tight tracking-tight">
              Facturación Simple para negocios E-commerce
            </h1>



            <p className="text-base md:text-lg text-gray-400 max-w-2xl mb-8 md:mb-10">
              Lleva tu negocio al siguiente nivel con herramientas de gestión de clientes y analíticas de venta integradas. Emite facturas en formato CFDI 4.0 de manera profesional con un sistema pensado exclusivamente para vendedores digitales.              <br className="hidden sm:block" />


            </p>



            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">

              <SignedIn>

                <Link href="/dashboard" className="w-full sm:w-auto justify-center bg-white text-black font-medium py-2.5 px-6 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2">

                  Ir al Dashboard

                </Link>

              </SignedIn>

              <SignedOut>

                <SignUpButton>

                  <a className="w-full sm:w-auto justify-center bg-white text-black font-medium py-2.5 px-6 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2 cursor-pointer">

                    Comenzar gratis

                  </a>

                </SignUpButton>

              </SignedOut>

              <Link
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('features');
                }}
                className="w-full sm:w-auto justify-center border border-white/20 text-white font-medium py-2.5 px-6 rounded-lg hover:bg-white/10 transition-colors inline-flex items-center gap-1"
              >

                Más información <ArrowRight size={14} />

              </Link>

            </div>

            {/* Dashboard Preview */}
            <div className="mt-16 md:mt-24 relative">
              <div
                className="relative rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-2xl shadow-white/5 pointer-events-none select-none origin-bottom opacity-100"
                style={{
                  perspective: '1200px',
                  transform: 'rotateX(4deg) scale(0.98)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                <DashboardPreview />
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

              Todo lo que necesitas para facturar

            </h2>

            <p className="text-gray-400">

              Herramientas potentes para gestionar tus facturas y clientes de forma eficiente.

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



                <Link

                  href={plan.highlighted ? '/sign-up' : '/checkout'}

                  className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all shadow-lg ${plan.highlighted

                    ? 'bg-white text-black hover:bg-gray-100'

                    : 'bg-white/10 text-white hover:bg-white/20'

                    }`}

                >

                  {plan.cta}

                </Link>

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
                "a": "Inventra es un sistema de facturación diseñado para el mundo del e-commerce, con herramientas sencillas para que puedas facturar tus ventas de forma ordenada y profesional."
              },
              {
                "q": "¿Para quién es Inventra?",
                "a": "Está creado para vendedores de e-commerce y dueños de negocios online que necesitan una plataforma clara y rápida para gestionar sus facturas manualmente."
              },
              {
                "q": "¿Cómo funciona?",
                "a": "Es muy simple: creas tu cuenta, accedes a tu panel de control y comienzas a generar tus facturas en cuestión de minutos con nuestra interfaz intuitiva."
              },
              {
                "q": "¿Puedo usarlo aunque no tenga e-commerce?",
                "a": "¡Claro! Funciona perfectamente como un sistema de facturación tradicional para emitir facturas manualmente siempre que lo necesites, sin importar tu modelo de negocio."
              },
              {
                "q": "¿Qué nos diferencia de otros sistemas de facturación?",
                "a": "Nos enfocamos en la simplicidad. Ofrecemos una herramienta diseñada para el ritmo del vendedor digital: rápida, sin complicaciones técnicas y con un precio muy competitivo."
              },
              {
                "q": "¿Qué tipos de planes tiene Inventra?",
                "a": "Ofrecemos un Plan Gratuito para quienes están comenzando y un Plan Pro por solo $199 MXN para quienes buscan facturación ilimitada y herramientas adicionales."
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

                &copy; {new Date().getFullYear()} Inventra Factura.

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
  return (
    <div className="flex h-[500px] w-full bg-[#070707] text-gray-300 font-sans overflow-hidden">
      {/* Mock Sidebar */}
      <div className="w-56 border-r border-white/5 bg-[#0a0a0a] flex flex-col shrink-0">
        <div className="p-4 border-b border-white/5 flex justify-center">
          <img src="/inventralogo.png" alt="Logo" className="h-6 w-auto opacity-90" />
        </div>

        <div className="flex-1 py-4 px-3 space-y-6">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2 flex items-center gap-2">
              <Crown className="size-3 text-amber-400" />
              General
            </div>
            <div className="space-y-1">
              {[
                { icon: LayoutDashboard, label: 'Dashboard', active: true },
                { icon: FileText, label: 'Facturas', active: false },
                { icon: Users, label: 'Clientes', active: false },
                { icon: Settings, label: 'Configuración', active: false },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${item.active ? 'text-white bg-white/10' : 'text-gray-400'}`}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Facturas', value: '12', sub: 'Ilimitadas Pro', icon: FileText, color: 'text-blue-400' },
              { label: 'Ingresos', value: '$45,280', sub: 'Total facturado', icon: DollarSign, color: 'text-emerald-400' },
              { label: 'Clientes', value: '8', sub: 'Ilimitados Pro', icon: Users, color: 'text-blue-400' },
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
              <Plus className="size-3" /> Nueva Factura
            </div>
            <div className="px-4 py-1.5 border border-white/10 text-white text-xs font-semibold rounded-lg flex items-center gap-2">
              <Users className="size-3" /> Ver Clientes
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <div className="text-xs font-bold text-white">Facturas Recientes</div>
              <div className="text-[10px] text-blue-400 font-medium">Ver todas →</div>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-white/[0.02] text-gray-500 border-b border-white/5">
                  <tr>
                    <th className="px-4 py-3 font-medium uppercase tracking-tighter">Número</th>
                    <th className="px-4 py-3 font-medium uppercase tracking-tighter">Cliente</th>
                    <th className="px-4 py-3 font-medium uppercase tracking-tighter text-right">Monto</th>
                    <th className="px-4 py-3 font-medium uppercase tracking-tighter text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { no: 'INV-2024-001', client: 'Pixel Studio MX', amount: '$12,500.00', status: 'Pagada', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                    { no: 'INV-2024-002', client: 'Consultoría Tech', amount: '$8,200.00', status: 'Enviada', color: 'bg-blue-400/10 text-blue-400 border-blue-400/20' },
                    { no: 'INV-2024-003', client: 'E-commerce Central', amount: '$4,150.00', status: 'Vencida', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
                  ].map((inv, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-white font-medium">{inv.no}</td>
                      <td className="px-4 py-3 text-gray-400">{inv.client}</td>
                      <td className="px-4 py-3 text-white text-right font-mono">{inv.amount}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-medium ${inv.color}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



// Inline Navbar component implementation

function InlineNavbar() {

  const [isMenuOpen, setIsMenuOpen] = useState(false);



  return (

    <div>
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
            <a
              href="https://www.instagram.com/inventramx/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Instagram
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <SignedOut>
              <SignInButton>
                <a className="text-slate-300 hover:text-white">Iniciar Sesión</a>
              </SignInButton>
              <SignUpButton>
                <a className="bg-white text-black font-medium py-2 px-6 rounded-lg text-sm !transition-none !duration-0">Registrarse</a>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="bg-white text-black font-medium py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-9 h-9' } }} />
            </SignedIn>
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
              <SignedOut>
                <SignInButton>
                  <a className="text-slate-300 hover:text-white">Iniciar Sesión</a>
                </SignInButton>
                <SignUpButton>
                  <a className="bg-white text-black font-medium py-2 px-6 rounded-lg text-sm text-center !transition-none !duration-0">Registrarse</a>
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
            </div>
          </div>
        )}
      </div>
    </div>

  );

}