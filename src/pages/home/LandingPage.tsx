
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  ArrowRight,
  ChevronDown,
  Workflow,
  FileCheck,
  Bell,
  Shield,
  BarChart2,
  Users,
  Calendar,
  MessageSquare,
} from "lucide-react"
import { ScrollReveal } from "@/components/home/scroll-reveal"
import { FeatureCard } from "@/components/home/feature-card"
import { FaqItem } from "@/components/home/faq-item"
import { LandingFooter } from "@/components/home/footer"
import { useAuth } from "@/hooks/auth/useAuth"

export default function LandingPage() {
  const { handleLogin } = useAuth()
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section
        className={`relative bg-gradient-to-br bg-gradient-primary  pt-16 pb-20 md:pt-20 md:pb-32 overflow-hidden`}
      >
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]" />
        <div className={`absolute inset-0 bg-gradient-to-t bg-gradient-primary-transparent`} />

        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              <div
                className={`w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary font-bold mr-3`}
              >
                <img src="/img/isologo-asofarma.png" alt="ASOFARMA Logo" className="rounded-full" />
              </div>
              <span className="text-2xl font-bold text-white">ASOFARMA Centro América & Caribe</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-block rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur-xl">
                <span className="text-white font-medium">Sistema BPM Interno</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                Optimiza nuestros procesos farmacéuticos
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-md">
                Sistema de Gestión de Procesos de Negocio diseñado específicamente para ASOFARMA Centro América &
                Caribe.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className={`bg-white text-tertiary hover:bg-white/90`}
                  onClick={handleLogin}
                >
                  Acceder al Sistema
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-white border-white bg-white/10 hover:bg-white/20"
                >
                  Conocer más <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div
                className={`absolute -right-20 -top-20 w-64 h-64 bg-secondary/30 rounded-full blur-3xl`}
              />
              <div
                className={`absolute -left-10 -bottom-10 w-64 h-64 bg-tertiary/30 rounded-full blur-3xl`}
              />
              <div className="relative bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-xl">
                <img src="https://thispersondoesnotexist.com/" alt="Dashboard BPM" className="rounded-lg shadow-lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
          <Button variant="ghost" size="icon" className="text-white animate-bounce">
            <ChevronDown className="h-6 w-6" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className={`section-padding-y bg-gray-50`} id="features">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Características Principales</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Nuestro sistema BPM está diseñado específicamente para optimizar los procesos internos de ASOFARMA
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ScrollReveal>
              <FeatureCard
                icon={<Workflow className={`h-10 w-10 text-primary`} />}
                title="Flujos de Trabajo Personalizados"
                description="Flujos de aprobación adaptados a cada departamento o tipo de solicitud de ASOFARMA"
              />
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <FeatureCard
                icon={<Bell className={`h-10 w-10 text-secondary`} />}
                title="Notificaciones Automáticas"
                description="Sistema de alertas y notificaciones para mantener informados a todos los colaboradores"
              />
            </ScrollReveal>
            <ScrollReveal delay={400}>
              <FeatureCard
                icon={<FileCheck className={`h-10 w-10 text-tertiary`} />}
                title="Gestión de Solicitudes"
                description="Seguimiento completo de solicitudes desde su creación hasta su finalización"
              />
            </ScrollReveal>
            <ScrollReveal>
              <FeatureCard
                icon={<Shield className={`h-10 w-10 text-primary`} />}
                title="Control de Acceso"
                description="Sistema jerárquico de permisos basado en roles para mayor seguridad"
              />
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <FeatureCard
                icon={<BarChart2 className={`h-10 w-10 text-secondary`} />}
                title="Métricas y KPIs"
                description="Análisis detallado del rendimiento de los procesos y tiempos de respuesta"
              />
            </ScrollReveal>
            <ScrollReveal delay={400}>
              <FeatureCard
                icon={<Users className={`h-10 w-10 text-tertiary`} />}
                title="Colaboración en Equipo"
                description="Herramientas para facilitar la comunicación y colaboración entre departamentos"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className={`section-padding-y bg-white`} id="benefits">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">Simplifica nuestros procesos farmacéuticos</h2>
                <p className="text-lg text-gray-600">
                  Nuestro sistema BPM está diseñado para optimizar cada etapa del proceso farmacéutico en ASOFARMA,
                  desde la solicitud inicial hasta la aprobación final.
                </p>
                <ul className="space-y-4">
                  {[
                    "Creación de flujos de aprobación personalizados",
                    "Seguimiento en tiempo real de solicitudes",
                    "Notificaciones automáticas en cada etapa",
                    "Registro completo para auditorías",
                    "Análisis de eficiencia y cuellos de botella",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className={`h-6 w-6 text-primary mr-2 flex-shrink-0`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`bg-primary button-hover-effect`}
                  onClick={handleLogin}
                >
                  Acceder al Sistema
                </Button>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="relative">
                <div
                  className={`absolute -z-10 -right-6 -top-6 w-64 h-64 bg-primary/10 rounded-full blur-xl`}
                />
                <div
                  className={`absolute -z-10 -left-6 -bottom-6 w-64 h-64 bg-tertiary/10 rounded-full blur-xl`}
                />
                <div className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
                  <img src="https://thispersondoesnotexist.com/" alt="Proceso BPM" className="w-full h-auto" />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section
        className={`section-padding-y bg-gradient-to-br bg-gradient-light`}
        id="feedback"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <ScrollReveal>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ayúdanos a mejorar</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Tu opinión es fundamental para el desarrollo de nuestro sistema BPM. Estamos construyendo esta
                  herramienta para ti y queremos asegurarnos de que satisfaga tus necesidades.
                </p>
              </ScrollReveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ScrollReveal>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
                  <div
                    className={`rounded-full bg-primary/10 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center`}
                  >
                    <MessageSquare className={`h-8 w-8 text-primary`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Comparte tus ideas</h3>
                  <p className="text-gray-600 mb-4">
                    Envía sugerencias sobre funcionalidades que te gustaría ver implementadas en el sistema.
                  </p>
                  <Button
                    variant="outline"
                    className={`w-full border-primary text-primary`}
                  >
                    Enviar sugerencia
                  </Button>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={400}>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
                  <div
                    className={`rounded-full bg-tertiary/10 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center`}
                  >
                    <Calendar className={`h-8 w-8 text-tertiary`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Capacitación</h3>
                  <p className="text-gray-600 mb-4">
                    Participa en nuestras sesiones de capacitación para aprender a utilizar el sistema BPM.
                  </p>
                  <Button
                    variant="outline"
                    className={`w-full border-tertiary text-tertiary`}
                  >
                    Ver calendario
                  </Button>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`section-padding-y bg-gray-50`} id="faq">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Preguntas Frecuentes</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Resolvemos tus dudas sobre nuestro sistema BPM interno
              </p>
            </ScrollReveal>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <ScrollReveal>
              <FaqItem
                question="¿Cómo accedo al sistema BPM?"
                answer="lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
              />
            </ScrollReveal>
            <ScrollReveal>
              <FaqItem
                question="¿Qué roles existen en el sistema?"
                answer="lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
              />
            </ScrollReveal>
            <ScrollReveal>
              <FaqItem
                question="¿Cómo puedo crear una nueva solicitud?"
                answer="lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
              />
            </ScrollReveal>
            <ScrollReveal>
              <FaqItem
                question="¿Dónde puedo recibir capacitación sobre el sistema?"
                answer="lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
              />
            </ScrollReveal>
            <ScrollReveal>
              <FaqItem
                question="¿El sistema está integrado con otros sistemas de ASOFARMA?"
                answer="lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className={`section-padding-y bg-gradient-to-br bg-gradient-primary  text-white`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Comienza a optimizar tus procesos hoy mismo</h2>
              <p className="text-xl mb-8 text-white/80">
                Únete a tus colegas de ASOFARMA Centro América & Caribe que ya están aprovechando nuestro sistema BPM
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className={`bg-white text-primary hover:bg-white/90`}
                  onClick={handleLogin}
                >
                  Acceder al Sistema
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-white border-white bg-white/10 hover:bg-white/20"
                >
                  Ver Guía de Usuario
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}