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

export function SettingsForm() {
  const { data: session } = useSession();

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-300">Perfil</CardTitle>
          <CardDescription className="text-gray-400">
            Actualiza tu información personal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">Nombre</Label>
            <Input 
              id="name" 
              placeholder="Tu nombre" 
              defaultValue={session?.user?.name || ''}
              className="bg-gray-900/50 border-gray-800 text-gray-300" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input 
              id="email" 
              type="email" 
              defaultValue={session?.user?.email || ''}
              disabled
              className="bg-gray-900/50 border-gray-800 text-gray-300 opacity-50" 
            />
          </div>
          <Button className="bg-blue-500 hover:bg-blue-600">
            Guardar Cambios
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-300">Seguridad</CardTitle>
          <CardDescription className="text-gray-400">
            Actualiza tu contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-gray-300">Contraseña Actual</Label>
            <Input id="current-password" type="password" className="bg-gray-900/50 border-gray-800 text-gray-300" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-gray-300">Nueva Contraseña</Label>
            <Input id="new-password" type="password" className="bg-gray-900/50 border-gray-800 text-gray-300" />
          </div>
          <Button className="bg-blue-500 hover:bg-blue-600">
            Cambiar Contraseña
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 