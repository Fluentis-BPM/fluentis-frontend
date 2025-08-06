import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CreateUserForm {
  nombre: string;
  rol: string;
  email: string;
  departamento: string;
  cargo: string;
}

export default function CreateUserPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateUserForm>({
    nombre: "",
    rol: "",
    email: "",
    departamento: "",
    cargo: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof CreateUserForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.nombre.trim() || !formData.rol.trim()) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setIsLoading(true);

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aquí iría la llamada real a la API
      // const response = await api.post('/api/usuarios', formData);
      
      toast.success(`Usuario ${formData.nombre} creado exitosamente`);
      
      // Resetear formulario
      setFormData({
        nombre: "",
        rol: "",
        email: "",
        departamento: "",
        cargo: "",
      });
      
      // Redirigir a la lista de usuarios
      navigate("/test/usuarios");
      
    } catch (error) {
      console.error("Error al crear usuario:", error);
      toast.error("Error al crear el usuario. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/test/usuarios")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Usuarios
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Usuario</h1>
          <p className="text-gray-600 mt-2">
            Completa la información para crear un nuevo usuario en el sistema.
          </p>
        </div>

        {/* Formulario */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Información del Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium">
                  Nombre completo *
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  required
                  className="transition-colors focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan.perez@empresa.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="transition-colors focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Rol */}
              <div className="space-y-2">
                <Label htmlFor="rol" className="text-sm font-medium">
                  Rol *
                </Label>
                <Select
                  value={formData.rol}
                  onValueChange={(value) => handleInputChange("rol", value)}
                  required
                >
                  <SelectTrigger className="transition-colors focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="empleado">Empleado</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Departamento */}
              <div className="space-y-2">
                <Label htmlFor="departamento" className="text-sm font-medium">
                  Departamento
                </Label>
                <Select
                  value={formData.departamento}
                  onValueChange={(value) => handleInputChange("departamento", value)}
                >
                  <SelectTrigger className="transition-colors focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Selecciona un departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">Tecnología de la Información</SelectItem>
                    <SelectItem value="rh">Recursos Humanos</SelectItem>
                    <SelectItem value="finanzas">Finanzas</SelectItem>
                    <SelectItem value="ventas">Ventas</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cargo */}
              <div className="space-y-2">
                <Label htmlFor="cargo" className="text-sm font-medium">
                  Cargo
                </Label>
                <Input
                  id="cargo"
                  type="text"
                  placeholder="Ej: Desarrollador Senior"
                  value={formData.cargo}
                  onChange={(e) => handleInputChange("cargo", e.target.value)}
                  className="transition-colors focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/test/usuarios")}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Crear Usuario
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 