import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, User, Bell, Lock, Palette, Globe } from 'lucide-react';

export default function ConfigPage() {
  const user = useSelector((state: RootState) => state.auth.user);

  const configSections = [
    {
      title: "Perfil de Usuario",
      description: "Actualiza tu información personal y preferencias",
      icon: <User className="h-6 w-6" />,
      items: [
        "Cambiar información personal",
        "Actualizar foto de perfil",
        "Gestionar preferencias de contacto"
      ]
    },
    {
      title: "Notificaciones",
      description: "Configura cómo y cuándo recibir notificaciones",
      icon: <Bell className="h-6 w-6" />,
      items: [
        "Notificaciones por email",
        "Alertas del sistema",
        "Recordatorios de tareas"
      ]
    },
    {
      title: "Seguridad",
      description: "Gestiona la seguridad de tu cuenta",
      icon: <Lock className="h-6 w-6" />,
      items: [
        "Configuración de autenticación",
        "Historial de sesiones",
        "Permisos de aplicación"
      ]
    },
    {
      title: "Apariencia",
      description: "Personaliza la interfaz según tus preferencias",
      icon: <Palette className="h-6 w-6" />,
      items: [
        "Tema oscuro/claro",
        "Tamaño de fuente",
        "Configuración de layout"
      ]
    },
    {
      title: "Idioma y Región",
      description: "Configura el idioma y formato regional",
      icon: <Globe className="h-6 w-6" />,
      items: [
        "Idioma de la interfaz",
        "Formato de fecha y hora",
        "Configuración regional"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
            <p className="text-muted-foreground">
              Gestiona las configuraciones de tu cuenta y preferencias del sistema
            </p>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Información de la Cuenta</span>
          </CardTitle>
          <CardDescription>
            Usuario actual conectado al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
              {user?.nombre?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user?.nombre || 'Usuario'}</h3>
              <p className="text-muted-foreground">{user?.email || 'No disponible'}</p>
              <p className="text-sm text-primary">{user?.rol || 'Rol no definido'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {configSections.map((section, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-primary">{section.icon}</span>
                <span>{section.title}</span>
              </CardTitle>
              <CardDescription>
                {section.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="sm" className="w-full">
                Configurar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Note */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-2">
            <Settings className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Próximamente</p>
              <p>Las opciones de configuración detalladas estarán disponibles en futuras actualizaciones del sistema.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
