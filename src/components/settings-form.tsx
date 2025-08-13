'use client';

import { useState } from "react";
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
import { User, Camera, Upload } from "lucide-react";
import { showToast } from "@/lib/toast";
import Image from "next/image";

export function SettingsForm() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(session?.user?.name || '');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch('/api/user/profile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar perfil');
      }

      const result = await response.json();
      
      // Actualizar la sesión con los nuevos datos
      await update({
        ...session,
        user: {
          ...session?.user,
          name: result.name,
          image: result.image,
        },
      });

      showToast('Perfil actualizado correctamente', 'success');
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      showToast(
        error instanceof Error ? error.message : 'Error al actualizar perfil',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      {/* Perfil */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300">
        <CardHeader className="flex flex-row items-center gap-3">
          <User className="h-5 w-5 text-blue-400" />
          <div>
            <CardTitle className="text-lg text-white">Perfil</CardTitle>
            <CardDescription className="text-white/70">
              Actualiza tu información personal y foto de perfil.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Foto de perfil */}
          <div className="space-y-4">
            <Label className="text-white/80">Foto de perfil</Label>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-2xl font-semibold">
                      {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <Camera className="h-4 w-4 text-white" />
                </button>
              </div>
              <div className="flex-1">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Subir nueva foto
                </Button>
                <p className="text-xs text-white/60 mt-2">
                  Formatos: JPG, PNG. Tamaño máximo: 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/80">
              Nombre completo
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/30"
              placeholder="Tu nombre completo"
            />
          </div>

          {/* Email (solo lectura) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              value={session?.user?.email || ''}
              disabled
              className="bg-white/5 border-white/10 text-white/60 cursor-not-allowed"
            />
            <p className="text-xs text-white/50">
              El correo electrónico no se puede modificar.
            </p>
          </div>

          <Button 
            onClick={handleSaveProfile}
            disabled={isLoading}
            className="w-full bg-blue-500/80 hover:bg-blue-500 text-white transition-all duration-200"
          >
            {isLoading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 