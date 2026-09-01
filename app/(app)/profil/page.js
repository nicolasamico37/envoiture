import { NextResponse } from "next/server";

const GEOCODING_URL =
  "https://data.geopf.fr/geocodage/search";

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizePostalCode(value) {
  return String(value ?? "")
    .replace(/\s/g, "")
    .trim();
}

function extractStreetNumber(adresse) {
  const match = String(adresse ?? "")
    .trim()
    .match(/^(\d+[A-Za-z]?)\b/);

  return match
    ? normalizeText(match[1])
    : null;
}

function extractStreetName(adresse) {
  const value = String(adresse ?? "")
    .trim()
    .replace(/^(\d+[A-Za-z]?)\s+/, "");

  return normalizeText(value);
}

function streetMatches(adresse, candidate) {
  const requestedStreet =
    extractStreetName(adresse);

  const candidateStreet =
    normalizeText(candidate?.street);

  const candidateName =
    normalizeText(candidate?.name);

  if (!requestedStreet) {
    return false;
  }

  return (
    requestedStreet === candidateStreet ||
    requestedStreet === candidateName
  );
}

function houseNumberMatches(adresse, candidate) {
  const requestedNumber =
    extractStreetNumber(adresse);

  const candidateNumber =
    normalizeText(candidate?.housenumber);

  if (!requestedNumber) {
    return true;
  }

  return (
    requestedNumber === candidateNumber
  );
}

async function geocodeAddress({
  adresse,
  codePostal,
  ville,
}) {
  const query =
    `${adresse}, ${codePostal} ${ville}`;

  const url =
    `${GEOCODING_URL}?q=${encodeURIComponent(
      query
    )}&limit=10`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(
      "Erreur Géoplateforme :",
      response.status,
      response.statusText
    );

    return {
      success: false,
      status: 502,
      error:
        "Le service de géocodage est momentanément indisponible.",
    };
  }

  const data =
    await response.json();

  const features =
    Array.isArray(data?.features)
      ? data.features
      : [];

  if (features.length === 0) {
    return {
      success: false,
      error:
        "Aucune adresse correspondante n'a été trouvée.",
    };
  }

  const normalizedInputPostal =
    normalizePostalCode(codePostal);

  const normalizedInputCity =
    normalizeText(ville);

  const candidates = features
    .map((feature) => {
      const properties =
        feature?.properties ?? {};

      const coordinates =
        feature?.geometry?.coordinates;

      if (
        !Array.isArray(coordinates) ||
        coordinates.length < 2
      ) {
        return null;
      }

      const longitude =
        Number(coordinates[0]);

      const latitude =
        Number(coordinates[1]);

      if (
        !Number.isFinite(longitude) ||
        !Number.isFinite(latitude)
      ) {
        return null;
      }

      const candidate = {
        label:
          properties.label ?? "",

        score:
          Number(properties.score ?? 0),

        ban_id:
          properties.banId ?? null,

        latitude,
        longitude,

        postcode:
          properties.postcode ?? "",

        city:
          properties.city ?? "",

        citycode:
          properties.citycode ?? "",

        type:
          properties.type ?? "",

        housenumber:
          properties.housenumber ?? "",

        street:
          properties.street ?? "",

        name:
          properties.name ?? "",
      };

      const postalMatches =
        normalizePostalCode(
          candidate.postcode
        ) === normalizedInputPostal;

      const cityMatches =
        normalizeText(
          candidate.city
        ) === normalizedInputCity;

      const streetMatch =
        streetMatches(
          adresse,
          candidate
        );

      const houseNumberMatch =
        houseNumberMatches(
          adresse,
          candidate
        );

      return {
        ...candidate,

        postal_matches:
          postalMatches,

        city_matches:
          cityMatches,

        street_matches:
          streetMatch,

        house_number_matches:
          houseNumberMatch,
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        b.score - a.score
    );

  if (candidates.length === 0) {
    return {
      success: false,
      error:
        "Les résultats de géocodage sont invalides.",
    };
  }

  const exactCandidates =
    candidates.filter(
      (candidate) =>
        candidate.postal_matches &&
        candidate.city_matches &&
        candidate.street_matches &&
        candidate.house_number_matches
    );

  const best =
    exactCandidates.length > 0
      ? exactCandidates[0]
      : null;

  if (!best) {
    return {
      success: false,
      error:
        "L'adresse n'a pas pu être identifiée précisément. Vérifiez le numéro, la rue, le code postal et la ville.",
      candidates,
    };
  }

  /*
   * L'adresse est identifiée précisément.
   * Le score BAN sert uniquement à qualifier
   * la qualité du résultat.
   */

  const confidence =
    best.score >= 0.5
      ? "high"
      : "medium";

  return {
    success: true,
    confidence,

    postal_matches:
      best.postal_matches,

    city_matches:
      best.city_matches,

    result: best,

    candidates,
  };
}

/*
 * --------------------------------------------------
 * GET
 * --------------------------------------------------
 *
 * La page profil appelle /api/geocode en GET.
 */

export async function GET(request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const adresse =
      searchParams
        .get("adresse")
        ?.trim() ?? "";

    const codePostal =
      searchParams
        .get("code_postal")
        ?.trim() ?? "";

    const ville =
      searchParams
        .get("ville")
        ?.trim() ?? "";

    if (
      !adresse ||
      !codePostal ||
      !ville
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "L'adresse, le code postal et la ville sont obligatoires.",
        },
        { status: 400 }
      );
    }

    const result =
      await geocodeAddress({
        adresse,
        codePostal,
        ville,
      });

    return NextResponse.json(
      result,
      {
        status:
          result.status ?? 200,
      }
    );
  } catch (error) {
    console.error(
      "Erreur interne de géocodage :",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Une erreur est survenue lors du géocodage.",
      },
      { status: 500 }
    );
  }
}

/*
 * --------------------------------------------------
 * POST
 * --------------------------------------------------
 *
 * Conservé pour compatibilité avec d'éventuels
 * appels existants.
 */

export async function POST(request) {
  try {
    const body =
      await request.json();

    const adresse =
      body?.adresse?.trim() ?? "";

    const codePostal =
      body?.code_postal?.trim() ?? "";

    const ville =
      body?.ville?.trim() ?? "";

    if (
      !adresse ||
      !codePostal ||
      !ville
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "L'adresse, le code postal et la ville sont obligatoires.",
        },
        { status: 400 }
      );
    }

    const result =
      await geocodeAddress({
        adresse,
        codePostal,
        ville,
      });

    return NextResponse.json(
      result,
      {
        status:
          result.status ?? 200,
      }
    );
  } catch (error) {
    console.error(
      "Erreur interne de géocodage :",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Une erreur est survenue lors du géocodage.",
      },
      { status: 500 }
    );
  }
}
