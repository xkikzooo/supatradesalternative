'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ImageDropzoneProps {
  images: string[];
  existingImages: string[];
  onAddImages: (urls: string[]) => void;
  onRemoveImage: (index: number) => void;
  onRemoveExistingImage: (index: number) => void;
}

export function ImageDropzone({
  images,
  existingImages,
  onAddImages,
  onRemoveImage,
  onRemoveExistingImage
}: ImageDropzoneProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      // Aquí iría la lógica de subida de archivos
      // Por ahora solo simulamos la subida
      for (const file of acceptedFiles) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        await new Promise((resolve) => {
          reader.onload = () => {
            uploadedUrls.push(reader.result as string);
            resolve(null);
          };
        });
      }

      if (uploadedUrls.length > 0) {
        onAddImages(uploadedUrls);
      }
    } catch (error) {
      console.error('Error al subir las imágenes:', error);
      toast.error('Error al subir las imágenes');
    } finally {
      setIsUploading(false);
    }
  }, [onAddImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: true
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          isDragActive ? "border-blue-500 bg-blue-50/10" : "border-gray-300 hover:border-gray-400",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Subiendo imágenes...</p>
            </div>
          ) : (
            <>
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-blue-600 hover:text-blue-500">
                    Haz clic para seleccionar
                  </span>{" "}
                  o arrastra y suelta
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, GIF hasta 10MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {(existingImages.length > 0 || images.length > 0) && (
        <div className="grid grid-cols-4 gap-4">
          {existingImages.map((image, index) => (
            <div key={`existing-${index}`} className="relative group aspect-[4/3]">
              <Image
                src={image}
                alt={`Imagen ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => onRemoveExistingImage(index)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {images.map((image, index) => (
            <div key={`new-${index}`} className="relative group aspect-[4/3]">
              <Image
                src={image}
                alt={`Nueva imagen ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => onRemoveImage(index)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export type { ImageDropzoneProps }; 