'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "¿Cómo funciona Inventra Factura?",
    answer: "Inventra Factura es un sistema completo que te permite crear facturas profesionales, gestionar clientes, registrar pagos y generar reportes en tiempo real. Puedes empezar gratis y actualizar cuando tu negocio crezca."
  },
  {
    question: "¿Qué incluye el plan gratuito?",
    answer: "El plan gratuito incluye hasta 10 facturas por mes, gestión de hasta 5 clientes, plantillas básicas y soporte por email. Es perfecto para negocios pequeños o para empezar."
  },
  {
    question: "¿Puedo personalizar mis facturas?",
    answer: "Sí, en el plan Pro puedes personalizar tus facturas con tu logo, colores, términos de pago específicos y mucho más. Las plantillas son completamente adaptables a tu marca."
  },
  {
    question: "¿Mis datos están seguros?",
    answer: "Absolutamente. Todos tus datos están protegidos y respaldados en la nube de forma segura. Utilizamos encriptación de nivel empresarial para proteger tu información."
  },
  {
    question: "¿Cómo puedo cancelar mi suscripción?",
    answer: "Puedes cancelar tu suscripción en cualquier momento desde tu cuenta. No hay penalizaciones ni compromisos. Tu acceso continuará hasta el final del período facturado."
  },
  {
    question: "¿Ofrecen soporte técnico?",
    answer: "Sí, ofrecemos soporte por email para todos los usuarios. Los usuarios del plan Pro reciben soporte prioritario con tiempos de respuesta más rápidos."
  },
  {
    question: "¿Puedo exportar mis datos?",
    answer: "Sí, puedes exportar todas tus facturas, datos de clientes y reportes en formato CSV o PDF en cualquier momento. Tus datos siempre te pertenecen."
  },
  {
    question: "¿Aceptan pagos en México?",
    answer: "Sí, aceptamos pagos de todo el mundo incluyendo México. Procesamos pagos de forma segura a través de plataformas internacionales confiables."
  },
  {
    question: "¿Cuánto tiempo toma crear una factura?",
    answer: "Con Inventra Factura puedes crear una factura profesional en menos de 2 minutos. Nuestro sistema está diseñado para ser intuitivo y rápido."
  },
  {
    question: "¿Puedo enviar facturas por email?",
    answer: "Sí, puedes enviar facturas directamente por email desde la plataforma. También puedes descargarlas en PDF y compartirlas por cualquier medio."
  },
  {
    question: "¿Tienen aplicación móvil?",
    answer: "Actualmente nuestra plataforma es web y funciona perfectamente en cualquier dispositivo móvil desde el navegador. Estamos desarrollando una app móvil nativa."
  },
  {
    question: "¿Cómo funcionan los recordatorios de pago?",
    answer: "En el plan Pro, puedes configurar recordatorios automáticos que se envían a tus clientes cuando una factura está por vencer o ya vencida. Puedes personalizar los mensajes y la frecuencia."
  }
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{text: string, isBot: boolean}>>([
    { text: "¡Hola! Soy el asistente de Inventra Factura. ¿En qué puedo ayudarte hoy?", isBot: true }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = { text: inputValue, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot thinking and response
    setTimeout(() => {
      const response = findBestAnswer(inputValue);
      setMessages(prev => [...prev, { text: response, isBot: true }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const findBestAnswer = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    // Simple keyword matching
    for (const faq of faqs) {
      const keywords = faq.question.toLowerCase().split(' ');
      const matchCount = keywords.filter(keyword => 
        keyword.length > 3 && lowerQuestion.includes(keyword)
      ).length;
      
      if (matchCount >= 2) {
        return faq.answer;
      }
    }

    // Default responses for common topics
    if (lowerQuestion.includes('precio') || lowerQuestion.includes('costo') || lowerQuestion.includes('plan')) {
      return "Tenemos dos planes: Gratuito (hasta 10 facturas/mes) y Pro ($199/mes con facturas ilimitadas). Puedes empezar gratis sin tarjeta de crédito.";
    }
    
    if (lowerQuestion.includes('prueba') || lowerQuestion.includes('gratis')) {
      return "Sí, puedes empezar gratis con nuestro plan gratuito. No necesitas tarjeta de crédito para registrarte y puedes cancelar cuando quieras.";
    }
    
    if (lowerQuestion.includes('hola') || lowerQuestion.includes('buenos')) {
      return "¡Hola! ¿En qué puedo ayudarte sobre Inventra Factura? Puedo informarte sobre planes, características, seguridad o cualquier otra duda.";
    }

    return "Entiendo tu pregunta. Para obtener una respuesta más específica, te recomiendo contactar a nuestro equipo de soporte o explorar nuestras características en la página principal. ¿Hay algo específico sobre facturación que te gustaría conocer?";
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'bg-[#080808] hover:bg-[#1a1a1a] border border-white/20' : 'bg-[#080808] hover:bg-[#1a1a1a] border border-white/20'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-[#080808] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-white/20">
          {/* Header */}
          <div className="bg-[#080808] p-4 text-white border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Asistente Inventra</h3>
                <p className="text-xs opacity-90">Preguntas frecuentes</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                {message.isBot && (
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.isBot
                      ? 'bg-[#1a1a1a] text-white border border-white/10'
                      : 'bg-[#080808] text-white border border-white/20'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
                {!message.isBot && (
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-[#1a1a1a] p-3 rounded-2xl border border-white/10">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          <div className="p-3 bg-[#080808] border-t border-white/20">
            <p className="text-xs text-gray-400 mb-2">Preguntas rápidas:</p>
            <div className="flex flex-wrap gap-2">
              {faqs.slice(0, 4).map((faq, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(faq.question)}
                  className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-gray-300 transition-colors border border-white/10"
                >
                  {faq.question.length > 25 ? faq.question.substring(0, 25) + '...' : faq.question}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 bg-[#080808] border-t border-white/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-white/20 rounded-full focus:outline-none focus:border-white/40 text-white placeholder-gray-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="p-2 bg-white text-black rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
