'use client';



import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import Link from 'next/link';

import { ArrowRight, Check, Brain, HeartHandshakeIcon, Menu, X } from 'lucide-react';

import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';




const features = [

  {

    title: 'Facturas Profesionales',

    description: 'Crea facturas hermosas y profesionales en segundos para impresionar a tus clientes.',

  },

  {

    title: 'Gestión de Clientes',

    description: 'Mantén un registro completo de todos tus clientes y sus historiales de compra.',

  },

  {

    title: 'Reportes en Tiempo Real',

    description: 'Accede a reportes detallados de ventas y facturas actualizados constantemente.',

  },

  {

    title: 'Seguimiento de Pagos',

    description: 'Registra qué facturas han sido pagadas y cuáles aún están pendientes.',

  },

  {

    title: 'Datos Verificados',

    description: 'Todos tus datos están protegidos y respaldados en la nube de forma segura.',

  },

  {

    title: 'Plantillas Personalizables',

    description: 'Personaliza tus facturas con tu logo, colores y términos de pago específicos.',

  },

];



const plans = [

  {

    name: 'Gratuito',

    price: '$0',

    period: '/mes',

    description: 'Perfecto para empezar',

    features: [

      'Hasta 10 facturas por mes',

      'Gestión de hasta 5 clientes',

      'Plantillas básicas',

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
      'Plantillas avanzadas',

      'Clientes ilimitados',



      'Soporte prioritario',


    ],

    cta: 'Comenzar ahora',

    highlighted: false,

  },

];



export default function Home() {

  return (

    <div className="min-h-screen">

      {/* Inlined Navbar (previously in app/components/Navbar.tsx) */}

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080808] backdrop-blur-lg border-b border-white/20">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <InlineNavbar />

        </div>

      </nav>





      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4">

        <div className="max-w-4xl mx-auto">

          <div className="animate-fade-in-up">

            <p className="bg-[#080808] px-4 py-2 rounded-full w-fit flex items-center gap-2 border border-white/10 text-sm text-gray-300 mb-8">

              <HeartHandshakeIcon size={14} />

              Usado por mas de 5,000 negocios en todo el mundo

            </p>



            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 leading-tight tracking-tight">

              Crea facturas

              <br />

              profesionales fácilmente

            </h1>



            <p className="text-base md:text-lg text-gray-400 max-w-2xl mb-8 md:mb-10">

              Sistema de facturación moderno para tu negocio.

              <br className="hidden sm:block" />

              Gestiona clientes, facturas y pagos en un solo lugar.

            </p>



            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">

              <SignedIn>

                <Link href="/dashboard" className="w-full sm:w-auto justify-center bg-white text-black font-medium py-2.5 px-6 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2">

                  Ir al Dashboard

                </Link>

              </SignedIn>

              <SignedOut>

                <SignUpButton>

                  <a className="w-full sm:w-auto justify-center bg-white text-black font-medium py-2.5 px-6 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2">

                    Comenzar gratis

                  </a>

                </SignUpButton>

              </SignedOut>

              <Link href="#features" className="w-full sm:w-auto justify-center border border-white/20 text-white font-medium py-2.5 px-6 rounded-lg hover:bg-white/10 transition-colors inline-flex items-center gap-1">

                Más información <ArrowRight size={14} />

              </Link>

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



      {/* CTA Section */}

      <section className="py-20 px-4 border-t border-white/10">

        <div className="max-w-2xl mx-auto text-center">

          <h2 className="text-3xl font-medium text-white mb-4">

            ¿Listo para simplificar tu facturación?

          </h2>

          <p className="text-gray-400 mb-8">

            Únete a miles de negocios que usan Inventra Factura para gestionar sus facturas.

          </p>

          <SignedIn>

            <Link href="/dashboard" className="bg-white text-black font-medium py-2.5 px-6 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2">

              Ir al Dashboard

            </Link>

          </SignedIn>

          <SignedOut>

            <Link href="/sign-up" className="bg-white text-black font-medium py-2.5 px-6 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2">

              Comenzar gratis

            </Link>

          </SignedOut>

          <p className="text-xs text-gray-600 mt-4">No se requiere tarjeta de crédito</p>

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



// Inline Navbar component implementation

function InlineNavbar() {

  const [isMenuOpen, setIsMenuOpen] = useState(false);



  return (

    <div>

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

          <Link href="/#features" className="text-slate-300 hover:text-white transition-colors">

            Características

          </Link>

          <Link href="/#pricing" className="text-slate-300 hover:text-white transition-colors">

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

            <Link href="/#features" className="text-slate-300 hover:text-white transition-colors">

              Características

            </Link>

            <Link href="/#pricing" className="text-slate-300 hover:text-white transition-colors">

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

  );

}