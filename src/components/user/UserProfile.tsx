import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Briefcase, Building2, Shield, Hash } from 'lucide-react';

export default function UserProfile() {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No hay información del usuario disponible</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Card con Avatar */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {user.nombre?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">{user.nombre}</h1>
              <p className="text-lg text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
            <Badge variant="default" className="text-base px-4 py-2">
              {user.rolNombre}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Información Detallada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="w-4 h-4" />
                <span className="font-medium">ID Usuario</span>
              </div>
              <p className="text-base font-semibold pl-6">{user.idUsuario || 'N/A'}</p>
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="font-medium">Nombre Completo</span>
              </div>
              <p className="text-base font-semibold pl-6">{user.nombre}</p>
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="font-medium">Correo Electrónico</span>
              </div>
              <p className="text-base font-semibold pl-6">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Información Organizacional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Información Organizacional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span className="font-medium">Rol</span>
              </div>
              <div className="pl-6">
                <Badge variant="default" className="text-sm">
                  {user.rolNombre}
                </Badge>
              </div>
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">Departamento</span>
              </div>
              <p className="text-base font-semibold pl-6">{user.departamentoNombre}</p>
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="w-4 h-4" />
                <span className="font-medium">Cargo</span>
              </div>
              <p className="text-base font-semibold pl-6">{user.cargoNombre}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información Adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Información Técnica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">OID (Object ID)</p>
              <p className="text-sm font-mono bg-muted px-3 py-2 rounded">{user.oid}</p>
            </div>
            {user.originalOid && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">OID Original</p>
                <p className="text-sm font-mono bg-muted px-3 py-2 rounded">{user.originalOid}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
