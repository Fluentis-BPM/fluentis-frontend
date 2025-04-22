
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { theme } from "@/lib/theme";

export function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div
                className={`w-8 h-8 rounded-full bg-[${theme.colors.primary}] flex items-center justify-center text-white font-bold mr-2`}
              >
                A
              </div>
              <span className="text-xl font-bold text-white">ASOFARMA BPM</span>
            </div>
            <p className="text-sm mb-6">
              Sistema de Gestión de Procesos de Negocio diseñado específicamente para ASOFARMA Centro América & Caribe.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#FF006F]">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#FF006F]">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#FF006F]">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#FF006F]">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-[#FF006F] transition-colors">Inicio</Link></li>
              <li><Link to="#features" className="text-gray-400 hover:text-[#FF006F] transition-colors">Características</Link></li>
              <li><Link to="#feedback" className="text-gray-400 hover:text-[#FF006F] transition-colors">Feedback</Link></li>
              <li><Link to="#faq" className="text-gray-400 hover:text-[#FF006F] transition-colors">Preguntas Frecuentes</Link></li>
              <li><a href="https://login.microsoftonline.com/common/oauth2/authorize?resource=https://asofarma-bpm.com" className="text-gray-400 hover:text-[#FF006F] transition-colors">Acceder al Sistema</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Recursos</h3>
            <ul className="space-y-2">
              <li><Link to="/documentacion" className="text-gray-400 hover:text-[#FF006F] transition-colors">Documentación</Link></li>
              <li><Link to="/guias" className="text-gray-400 hover:text-[#FF006F] transition-colors">Guías de Usuario</Link></li>
              <li><Link to="/tutoriales" className="text-gray-400 hover:text-[#FF006F] transition-colors">Tutoriales</Link></li>
              <li><Link to="/soporte" className="text-gray-400 hover:text-[#FF006F] transition-colors">Soporte Técnico</Link></li>
              <li><Link to="/politicas" className="text-gray-400 hover:text-[#FF006F] transition-colors">Políticas Internas</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contacto</h3>
            <Accordion type="single" collapsible className="w-full space-y-2 text-sm">
              {[
                {
                  pais: "Guatemala",
                  direccion: "13 calle 3-40, zona 10, Edificio Atlantis, Oficinas 401 Guatemala",
                  telefono: "(502) 2327-4800",
                },
                {
                  pais: "Honduras",
                  direccion: "Boulv. Los Próceres, Novacentro Torre 1, piso 9 local 108B, Tegucigalpa\nJardines del Valle, Blvd Las Torres, Casa #611, San Pedro Sula",
                  telefono: "(504) 2236-0000",
                },
                {
                  pais: "El Salvador",
                  direccion: "73 avenida norte N. 232, Col. Escalón, San Salvador",
                  telefono: "(503) 2121-4900",
                },
                {
                  pais: "Nicaragua",
                  direccion: "Ofiplaza El Retiro, Edificio #2, Piso #2, Suite #224",
                  telefono: "(505) 2298-5090",
                },
                {
                  pais: "Costa Rica",
                  direccion: "Sabana Norte, Torre la Sabana, piso 7, San José",
                  telefono: "(506) 2296-9025",
                },
                {
                  pais: "Panamá",
                  direccion: "Blvd Costa del Este, Plaza del Este, Torre A, piso 12, oficina 12A-3, Ciudad de Panamá",
                  telefono: "(507) 275-6200",
                },
                {
                  pais: "República Dominicana",
                  direccion: "C/ Andrés Julio Aybar No. 206, Edif. Málaga III, Local 401, Ens. Piantini, Santo Domingo",
                  telefono: "(809) 566-3876",
                },
              ].map(({ pais, direccion, telefono }, i) => (
                <AccordionItem key={i} value={pais}>
                  <AccordionTrigger className="text-white">{pais}</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-1 whitespace-pre-line">{direccion}</p>
                    <p>
                      <Mail className={`inline h-4 w-4 text-[${theme.colors.primary}] mr-1`} />
                      contactenos@asofarma-ca.com
                    </p>
                    <p>
                      <Phone className={`inline h-4 w-4 text-[${theme.colors.primary}] mr-1`} />
                      {telefono}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">
            © {new Date().getFullYear()} ASOFARMA Centro América & Caribe. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/politicas" className="text-sm text-gray-400 hover:text-[#FF006F]">
              Políticas Internas
            </Link>
            <Link to="/ayuda" className="text-sm text-gray-400 hover:text-[#FF006F]">
              Ayuda
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
