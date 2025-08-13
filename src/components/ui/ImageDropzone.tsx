'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageIcon, Loader2, Clipboard } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Máximo número de imágenes permitidas
const MAX_IMAGES = 4;

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
  const [dropzoneRef, setDropzoneRef] = useState<HTMLDivElement | null>(null);
  
  // Calcular cuántas imágenes más se pueden agregar
  const remainingSlots = MAX_IMAGES - (images.length + existingImages.length);
  const isMaxImagesReached = remainingSlots <= 0;

  const processFile = useCallback(async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
    });
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    // Verificar si hay espacio para más imágenes
    if (isMaxImagesReached) {
      showToast(`Límite de ${MAX_IMAGES} imágenes alcanzado`, 'error');
      return;
    }
    
    // Limitar la cantidad de archivos a procesar según el espacio disponible
    const filesToProcess = acceptedFiles.slice(0, remainingSlots);
    
    // Mostrar advertencia si se descartaron archivos
    if (filesToProcess.length < acceptedFiles.length) {
      showToast(`Solo se procesarán ${filesToProcess.length} de ${acceptedFiles.length} imágenes debido al límite de ${MAX_IMAGES} imágenes`, 'warning');
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of filesToProcess) {
        const dataUrl = await processFile(file);
        uploadedUrls.push(dataUrl);
      }

      if (uploadedUrls.length > 0) {
        onAddImages(uploadedUrls);
      }
    } catch (error) {
      console.error('Error al subir las imágenes:', error);
      showToast('Error al subir las imágenes', 'error');
    } finally {
      setIsUploading(false);
    }
  }, [onAddImages, processFile, isMaxImagesReached, remainingSlots]);

  // Manejar pegado de imágenes
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!dropzoneRef || isUploading) return;
      
      // Verificar si hay espacio para más imágenes
      if (isMaxImagesReached) {
        showToast(`Límite de ${MAX_IMAGES} imágenes alcanzado`, 'error');
        return;
      }
      
      const items = e.clipboardData?.items;
      if (!items) return;
      
      const imageItems = Array.from(items).filter(item => 
        item.type.startsWith('image/')
      );
      
      if (imageItems.length === 0) return;
      
      // Limitar la cantidad de imágenes a procesar según el espacio disponible
      const itemsToProcess = imageItems.slice(0, remainingSlots);
      
      e.preventDefault();
      setIsUploading(true);
      
      try {
        const uploadedUrls: string[] = [];
        
        for (const item of itemsToProcess) {
          const file = item.getAsFile();
          if (file) {
            const dataUrl = await processFile(file);
            uploadedUrls.push(dataUrl);
          }
        }
        
        if (uploadedUrls.length > 0) {
          showToast(`${uploadedUrls.length > 1 ? 'Imágenes pegadas' : 'Imagen pegada'} correctamente`, 'success');
          onAddImages(uploadedUrls);
        }
      } catch (error) {
        console.error('Error al pegar imágenes:', error);
        showToast('Error al pegar imágenes', 'error');
      } finally {
        setIsUploading(false);
      }
    };
    
    // Añadir evento de paste al documento para capturar en cualquier lugar
    document.addEventListener('paste', handlePaste);
    
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [dropzoneRef, isUploading, onAddImages, processFile, isMaxImagesReached, remainingSlots]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: true,
    disabled: isMaxImagesReached || isUploading
  });

  // Obtener props del dropzone con un ref personalizado
  const rootProps = getRootProps({
    ref: (node: HTMLDivElement) => setDropzoneRef(node)
  });

  return (
    <div className="space-y-4">
      <div
        {...rootProps}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          isDragActive ? "border-blue-500 bg-blue-50/10" : "border-gray-300 hover:border-gray-400",
          (isUploading || isMaxImagesReached) && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Subiendo imágenes...</p>
            </div>
          ) : isMaxImagesReached ? (
            <div className="flex flex-col items-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Límite de {MAX_IMAGES} imágenes alcanzado. Elimina alguna para añadir más.
              </p>
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
                  PNG, JPG hasta 10MB (máximo {MAX_IMAGES} imágenes)
                </p>
                <div className="flex items-center justify-center mt-2">
                  <Clipboard className="h-4 w-4 text-gray-400 mr-1" />
                  <p className="text-xs text-gray-500">
                    También puedes pegar una imagen desde el portapapeles (Ctrl+V)
                  </p>
                </div>
                {remainingSlots > 0 && (images.length > 0 || existingImages.length > 0) && (
                  <p className="mt-1 text-xs text-gray-500">
                    Puedes agregar {remainingSlots} imagen{remainingSlots !== 1 ? 'es' : ''} más
                  </p>
                )}
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