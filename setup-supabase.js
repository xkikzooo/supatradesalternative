// Script para configurar Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Verificar que las variables de entorno existan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY deben estar definidos en .env');
  process.exit(1);
}

console.log('🔄 Conectando a Supabase...');

// Cliente normal para operaciones de usuario
const supabase = createClient(supabaseUrl, supabaseKey);

async function createInitialData() {
  console.log('🔄 Creando datos iniciales...');
  
  try {
    // Lista de pares comunes de trading para insertar
    const tradingPairs = [
      { name: 'EUR/USD' },
      { name: 'GBP/USD' },
      { name: 'USD/JPY' },
      { name: 'BTC/USD' },
      { name: 'ETH/USD' }
    ];
    
    console.log('🔄 Creando pares de trading...');
    
    // Insertar cada par de trading
    for (const pair of tradingPairs) {
      try {
        // Verificar si ya existe
        const { data: existingPairs } = await supabase
          .from('TradingPair')
          .select('id')
          .eq('name', pair.name)
          .limit(1);
        
        if (existingPairs && existingPairs.length > 0) {
          console.log(`  - Par ${pair.name} ya existe, omitiendo`);
          continue;
        }
        
        // Crear nuevo par
        const { error } = await supabase
          .from('TradingPair')
          .insert({
            id: crypto.randomUUID(),
            name: pair.name,
            updatedAt: new Date().toISOString()
          });
        
        if (error) {
          console.warn(`  - Error al crear par ${pair.name}: ${error.message}`);
        } else {
          console.log(`  - Par ${pair.name} creado correctamente`);
        }
      } catch (error) {
        console.warn(`  - Error al procesar par ${pair.name}: ${error.message}`);
      }
    }
    
    console.log('✅ Datos iniciales creados correctamente');
  } catch (error) {
    console.error('❌ Error al crear datos iniciales:', error);
    throw error;
  }
}

async function main() {
  try {
    // Verificar conexión
    console.log('✅ Verificando conexión a Supabase...');
    
    try {
      // Intentar hacer una llamada simple para verificar la conexión
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      console.log('✅ Conexión a Supabase establecida correctamente');
    } catch (error) {
      console.error('❌ Error de conexión a Supabase:', error);
      throw new Error('No se pudo conectar a Supabase. Verifica las credenciales.');
    }
    
    // Mensajes informativos sobre la configuración manual requerida
    console.log('\n📋 PASOS PARA CONFIGURACIÓN MANUAL:');
    console.log('1️⃣  ESQUEMA: Importa schema.sql en la sección SQL de tu proyecto Supabase');
    console.log('2️⃣  ALMACENAMIENTO: Crea un bucket "images" público desde la interfaz');
    console.log('3️⃣  RLS: Configura las políticas de seguridad para tus tablas\n');
    
    // Ejecutar solo la creación de datos iniciales
    await createInitialData();
    
    console.log('\n✅ Script completado. Verifica que:');
    console.log('- Las tablas estén creadas correctamente en tu proyecto Supabase');
    console.log('- Hayas creado un bucket de almacenamiento "images" desde la interfaz');
    console.log('- Las políticas de RLS estén configuradas adecuadamente');
  } catch (error) {
    console.error('❌ Error en la configuración:', error);
    process.exit(1);
  }
}

// Ejecutar el script
main(); 