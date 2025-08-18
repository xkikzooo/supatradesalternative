-- Configuración inicial
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Crear tipos ENUM
CREATE TYPE public."TradeBias" AS ENUM (
    'BULLISH',
    'BEARISH',
    'NEUTRAL'
);

CREATE TYPE public."TradeDirection" AS ENUM (
    'LONG',
    'SHORT'
);

CREATE TYPE public."TradeResult" AS ENUM (
    'WIN',
    'LOSS',
    'BREAKEVEN'
);

-- Crear tablas
CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    PRIMARY KEY (id)
);

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    password text,
    PRIMARY KEY (id)
);

CREATE TABLE public."Trade" (
    id text NOT NULL,
    "userId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    bias public."TradeBias",
    "biasExplanation" text,
    direction public."TradeDirection" NOT NULL,
    images text[],
    pnl double precision NOT NULL,
    psychology text,
    result public."TradeResult" NOT NULL,
    "tradingPairId" text NOT NULL,
    "accountId" text NOT NULL,
    "riskAmount" double precision,
    PRIMARY KEY (id)
);

CREATE TABLE public."TradingAccount" (
    id text NOT NULL,
    name text NOT NULL,
    balance double precision NOT NULL,
    "initialBalance" double precision NOT NULL,
    broker text NOT NULL,
    type text NOT NULL,
    currency text NOT NULL,
    "riskPerTrade" text,
    status text NOT NULL DEFAULT 'En espera',
    "minisQuantity" integer NOT NULL DEFAULT 1,
    "daysRemaining" integer NOT NULL DEFAULT 30,
    "currentPercentage" double precision DEFAULT 0,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE public."TradingPair" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);

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

-- Agregar restricciones de clave foránea
ALTER TABLE public."Trade" 
    ADD CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE,
    ADD CONSTRAINT "Trade_tradingPairId_fkey" FOREIGN KEY ("tradingPairId") REFERENCES public."TradingPair"(id) ON DELETE RESTRICT,
    ADD CONSTRAINT "Trade_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES public."TradingAccount"(id) ON DELETE CASCADE;

ALTER TABLE public."TradingAccount"
    ADD CONSTRAINT "TradingAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;

ALTER TABLE public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;

ALTER TABLE public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE; 