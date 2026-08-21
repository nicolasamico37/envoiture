/*
===============================================================================
 EnVoiture
 Schéma de base de données
 Version : 1.0
 PostgreSQL / Supabase
===============================================================================
*/

------------------------------------------------------------
-- Extensions
------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

------------------------------------------------------------
-- Fonctions
------------------------------------------------------------

-- (à venir)

------------------------------------------------------------
-- Types ENUM
------------------------------------------------------------

CREATE TYPE utilisateur_role AS ENUM (
    'UTILISATEUR',
    'ADMINISTRATEUR'
);

CREATE TYPE utilisateur_statut AS ENUM (
    'ACTIF',
    'DESACTIVE',
    'ARCHIVE'
);

CREATE TYPE vehicule_statut AS ENUM (
    'ACTIF',
    'ARCHIVE'
);

CREATE TYPE trajet_statut AS ENUM (
    'OUVERT',
    'COMPLET',
    'ANNULE',
    'TERMINE',
    'ARCHIVE'
);

CREATE TYPE participation_statut AS ENUM (
    'EN_ATTENTE',
    'ACCEPTEE',
    'REFUSEE',
    'ANNULEE'
);

CREATE TYPE match_statut AS ENUM (
    'PROPOSE',
    'ACCEPTE',
    'REFUSE',
    'EXPIRE'
);

CREATE TYPE notification_type AS ENUM (
    'MATCH',
    'MESSAGE',
    'PARTICIPATION',
    'TRAJET',
    'SYSTEME'
);

CREATE TYPE notification_statut AS ENUM (
    'NON_LUE',
    'LUE',
    'ARCHIVEE'
);

CREATE TYPE signalement_statut AS ENUM (
    'OUVERT',
    'EN_COURS',
    'CLOTURE'
);

------------------------------------------------------------
-- Tables
------------------------------------------------------------

-- À venir...