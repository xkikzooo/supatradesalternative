-- Política para _prisma_migrations
ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;

-- Solo permitir acceso a usuarios autenticados para ver las migraciones
CREATE POLICY "Allow authenticated users to view migrations"
    ON public._prisma_migrations
    FOR SELECT
    TO authenticated
    USING (true);

-- Permitir todas las operaciones desde la conexión de servicio
CREATE POLICY "Allow service role full access to migrations"
    ON public._prisma_migrations
    FOR ALL
    TO service_role
    USING (true); 