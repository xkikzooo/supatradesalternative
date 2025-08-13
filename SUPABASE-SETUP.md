# Configuración de Supabase

Este documento explica cómo migrar a una nueva base de datos de Supabase.

## Paso 1: Obtén las credenciales de tu nueva base de datos

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Una vez creado, ve a Configuración > API 
3. Copia la URL del proyecto y la `anon` key
4. Opcionalmente, copia también la `service_role` key (permite operaciones administrativas)

## Paso 2: Configura las variables de entorno

1. Crea o edita el archivo `.env` en la raíz del proyecto
2. Actualiza las siguientes variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-nuevo-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-nueva-clave-anon
SUPABASE_SERVICE_ROLE_KEY=tu-nueva-clave-service-role
```

## Paso 3: Configura la nueva base de datos

Ejecuta el script de configuración para crear todas las tablas y buckets necesarios:

```bash
npm run setup-supabase
```

Este script realizará las siguientes acciones:
- Verificará la conexión a Supabase
- Creará todos los tipos ENUM necesarios
- Creará todas las tablas requeridas por la aplicación
- Configurará el bucket de almacenamiento para imágenes
- Creará algunos datos iniciales (pares de trading comunes)

## Verificación

Una vez completados los pasos anteriores:

1. Reinicia la aplicación: `npm run dev`
2. Verifica que puedas crear una cuenta y hacer login
3. Verifica que las funcionalidades como la carga de imágenes y la gestión de trades funcionen correctamente

## Solución de problemas

- **Error de conexión**: Verifica que las variables de entorno estén correctamente configuradas
- **Error con el bucket de imágenes**: Si tienes problemas para subir imágenes, asegúrate de que el bucket 'images' existe y tiene las políticas correctas de acceso
- **Error con las RLS**: Configura las políticas de Row Level Security en Supabase si es necesario
- **Problemas con la autenticación**: Verifica la configuración en Supabase > Authentication > Providers

Para cualquier otro problema, consulta la documentación de Supabase o revisa los logs de la aplicación. 