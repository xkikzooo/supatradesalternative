'use client';

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, Bell, Palette } from "lucide-react";

export function SettingsForm() {
  const { data: session } = useSession();

  return (
    <div className="grid gap-6">
      {/* Perfil */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300">
        <CardHeader className="flex flex-row items-center gap-3">
          <User className="h-5 w-5 text-blue-400" />
          <div>
            <CardTitle className="text-lg text-white">Perfil</CardTitle>
            <CardDescription className="text-white/70">
              Actualiza tu información personal.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/80">Nombre</Label>
            <Input 
              id="name" 
              placeholder="Tu nombre" 
              defaultValue={session?.user?.name || ''}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">Email</Label>
            <Input 
              id="email" 
              type="email" 
              defaultValue={session?.user?.email || ''}
              disabled
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white/60 opacity-50" 
            />
          </div>
          <Button className="bg-blue-500/80 hover:bg-blue-500 text-white transition-all duration-200">
            Guardar Cambios
          </Button>
        </CardContent>
      </Card>

      {/* Seguridad */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300">
        <CardHeader className="flex flex-row items-center gap-3">
          <Shield className="h-5 w-5 text-emerald-400" />
          <div>
            <CardTitle className="text-lg text-white">Seguridad</CardTitle>
            <CardDescription className="text-white/70">
              Actualiza tu contraseña y configuración de seguridad.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-white/80">Contraseña Actual</Label>
            <Input 
              id="current-password" 
              type="password" 
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-white/80">Nueva Contraseña</Label>
            <Input 
              id="new-password" 
              type="password" 
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200" 
            />
          </div>
          <Button className="bg-emerald-500/80 hover:bg-emerald-500 text-white transition-all duration-200">
            Cambiar Contraseña
          </Button>
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300">
        <CardHeader className="flex flex-row items-center gap-3">
          <Bell className="h-5 w-5 text-amber-400" />
          <div>
            <CardTitle className="text-lg text-white">Notificaciones</CardTitle>
            <CardDescription className="text-white/70">
              Configura tus preferencias de notificaciones.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white/80">Notificaciones por email</Label>
              <p className="text-sm text-white/60">Recibe alertas importantes por correo</p>
            </div>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Activar
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white/80">Notificaciones push</Label>
              <p className="text-sm text-white/60">Alertas en tiempo real</p>
            </div>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Activar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Apariencia */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300">
        <CardHeader className="flex flex-row items-center gap-3">
          <Palette className="h-5 w-5 text-purple-400" />
          <div>
            <CardTitle className="text-lg text-white">Apariencia</CardTitle>
            <CardDescription className="text-white/70">
              Personaliza la apariencia de la aplicación.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white/80">Tema oscuro</Label>
              <p className="text-sm text-white/60">Modo oscuro activado</p>
            </div>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Activar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 