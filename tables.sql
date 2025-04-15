-- Crear tablas principales

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    password text,
    CONSTRAINT "User_pkey" PRIMARY KEY (id),
    CONSTRAINT "User_email_key" UNIQUE (email)
);

CREATE TABLE public."TradingPair" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    CONSTRAINT "TradingPair_pkey" PRIMARY KEY (id),
    CONSTRAINT "TradingPair_name_key" UNIQUE (name)
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
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    CONSTRAINT "TradingAccount_pkey" PRIMARY KEY (id),
    CONSTRAINT "TradingAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE
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
    CONSTRAINT "Trade_pkey" PRIMARY KEY (id),
    CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "Trade_tradingPairId_fkey" FOREIGN KEY ("tradingPairId") REFERENCES public."TradingPair"(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "Trade_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES public."TradingAccount"(id) ON UPDATE CASCADE ON DELETE CASCADE
); 