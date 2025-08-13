-- Habilitar RLS en todas las tablas
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Trade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TradingAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TradingPair" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VerificationToken" ENABLE ROW LEVEL SECURITY;

-- Políticas para User
CREATE POLICY "Users can view their own profile"
    ON public."User"
    FOR SELECT
    USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile"
    ON public."User"
    FOR UPDATE
    USING (auth.uid()::text = id);

-- Políticas para Trade
CREATE POLICY "Users can view their own trades"
    ON public."Trade"
    FOR SELECT
    USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create their own trades"
    ON public."Trade"
    FOR INSERT
    WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own trades"
    ON public."Trade"
    FOR UPDATE
    USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete their own trades"
    ON public."Trade"
    FOR DELETE
    USING (auth.uid()::text = "userId");

-- Políticas para TradingAccount
CREATE POLICY "Users can view their own trading accounts"
    ON public."TradingAccount"
    FOR SELECT
    USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create their own trading accounts"
    ON public."TradingAccount"
    FOR INSERT
    WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own trading accounts"
    ON public."TradingAccount"
    FOR UPDATE
    USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete their own trading accounts"
    ON public."TradingAccount"
    FOR DELETE
    USING (auth.uid()::text = "userId");

-- Políticas para TradingPair
CREATE POLICY "Everyone can view trading pairs"
    ON public."TradingPair"
    FOR SELECT
    USING (true);

-- Políticas para autenticación
CREATE POLICY "Users can view their own accounts"
    ON public."Account"
    FOR SELECT
    USING (auth.uid()::text = "userId");

CREATE POLICY "Users can manage their own accounts"
    ON public."Account"
    FOR ALL
    USING (auth.uid()::text = "userId");

CREATE POLICY "Users can view their own sessions"
    ON public."Session"
    FOR SELECT
    USING (auth.uid()::text = "userId");

CREATE POLICY "Users can manage their own sessions"
    ON public."Session"
    FOR ALL
    USING (auth.uid()::text = "userId");

-- Función auxiliar para crear usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public."User" (id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear usuarios automáticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 