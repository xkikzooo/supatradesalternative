--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-04-14 19:56:18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 17524)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it

ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 4872 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';

--
-- TOC entry 874 (class 1247 OID 17610)
-- Name: TradeBias; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TradeBias" AS ENUM (
    'BULLISH',
    'BEARISH',
    'NEUTRAL'
);

ALTER TYPE public."TradeBias" OWNER TO postgres;

--
-- TOC entry 871 (class 1247 OID 17604)
-- Name: TradeDirection; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TradeDirection" AS ENUM (
    'LONG',
    'SHORT'
);

ALTER TYPE public."TradeDirection" OWNER TO postgres;

--
-- TOC entry 877 (class 1247 OID 17618)
-- Name: TradeResult; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TradeResult" AS ENUM (
    'WIN',
    'LOSS',
    'BREAKEVEN'
);

ALTER TYPE public."TradeResult" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 17547)
-- Name: Account; Type: TABLE; Schema: public; Owner: postgres
--

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
    session_state text
);

ALTER TABLE public."Account" OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 17554)
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);

ALTER TABLE public."Session" OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 17574)
-- Name: Trade; Type: TABLE; Schema: public; Owner: postgres
--

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
    "riskAmount" double precision
);

ALTER TABLE public."Trade" OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 18092)
-- Name: TradingAccount; Type: TABLE; Schema: public; Owner: postgres
--

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
    "userId" text NOT NULL
);

ALTER TABLE public."TradingAccount" OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17625)
-- Name: TradingPair; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TradingPair" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

ALTER TABLE public."TradingPair" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 17561)
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    password text
);

ALTER TABLE public."User" OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17569)
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);

ALTER TABLE public."VerificationToken" OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 17525)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);

ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 4685 (class 2606 OID 17553)
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);

--
-- TOC entry 4689 (class 2606 OID 17560)
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);

--
-- TOC entry 4699 (class 2606 OID 17582)
-- Name: Trade Trade_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Trade"
    ADD CONSTRAINT "Trade_pkey" PRIMARY KEY (id);

--
-- TOC entry 4706 (class 2606 OID 18099)
-- Name: TradingAccount TradingAccount_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TradingAccount"
    ADD CONSTRAINT "TradingAccount_pkey" PRIMARY KEY (id);

--
-- TOC entry 4704 (class 2606 OID 17632)
-- Name: TradingPair TradingPair_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TradingPair"
    ADD CONSTRAINT "TradingPair_pkey" PRIMARY KEY (id);

--
-- TOC entry 4694 (class 2606 OID 17568)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);

--
-- TOC entry 4683 (class 2606 OID 17533)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);

--
-- TOC entry 4686 (class 1259 OID 17583)
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");

--
-- TOC entry 4687 (class 1259 OID 18101)
-- Name: Account_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Account_userId_idx" ON public."Account" USING btree ("userId");

--
-- TOC entry 4690 (class 1259 OID 17584)
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");

--
-- TOC entry 4691 (class 1259 OID 18102)
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");

--
-- TOC entry 4697 (class 1259 OID 18105)
-- Name: Trade_accountId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Trade_accountId_idx" ON public."Trade" USING btree ("accountId");

--
-- TOC entry 4700 (class 1259 OID 18104)
-- Name: Trade_tradingPairId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Trade_tradingPairId_idx" ON public."Trade" USING btree ("tradingPairId");

--
-- TOC entry 4701 (class 1259 OID 18103)
-- Name: Trade_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Trade_userId_idx" ON public."Trade" USING btree ("userId");

--
-- TOC entry 4707 (class 1259 OID 18100)
-- Name: TradingAccount_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TradingAccount_userId_idx" ON public."TradingAccount" USING btree ("userId");

--
-- TOC entry 4702 (class 1259 OID 18106)
-- Name: TradingPair_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "TradingPair_name_key" ON public."TradingPair" USING btree (name);

--
-- TOC entry 4692 (class 1259 OID 17585)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);

--
-- TOC entry 4695 (class 1259 OID 17587)
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);

--
-- TOC entry 4696 (class 1259 OID 17586)
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);

--
-- TOC entry 4708 (class 2606 OID 17588)
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- TOC entry 4709 (class 2606 OID 17593)
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- TOC entry 4710 (class 2606 OID 18122)
-- Name: Trade Trade_accountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Trade"
    ADD CONSTRAINT "Trade_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES public."TradingAccount"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- TOC entry 4711 (class 2606 OID 18112)
-- Name: Trade Trade_tradingPairId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Trade"
    ADD CONSTRAINT "Trade_tradingPairId_fkey" FOREIGN KEY ("tradingPairId") REFERENCES public."TradingPair"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- TOC entry 4712 (class 2606 OID 18117)
-- Name: Trade Trade_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Trade"
    ADD CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- TOC entry 4713 (class 2606 OID 18107)
-- Name: TradingAccount TradingAccount_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TradingAccount"
    ADD CONSTRAINT "TradingAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- TOC entry 4873 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;

-- Completed on 2025-04-14 19:56:18

--
-- PostgreSQL database dump complete 