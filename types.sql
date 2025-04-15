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