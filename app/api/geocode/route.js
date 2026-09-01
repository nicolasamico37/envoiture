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

export async function POST(request) {
  try {
    const body = await request.json();

    const adresse =
      body?.adresse?.trim() ?? "";

    const codePostal =
      body?.code_postal?.trim() ?? "";

    const ville =
      body?.ville?.trim() ?? "";

    if (!adresse || !codePostal || !ville) {
      return NextResponse.json(
        {
          success: false,
          error:
            "L'adresse, le code postal et la ville sont obligatoires.",
        },
        { status: 400 }
      );
    }

    const query =
      `${adresse}, ${codePostal} ${ville}`;

    const url =
      `${GEOCODING_URL}?q=${encodeURIComponent(query)}&limit=10`;

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

      return NextResponse.json(
        {
          success: false,
          error:
            "Le service de géocodage est momentanément indisponible.",
        },
        { status: 502 }
      );
    }

    const data =
      await response.json();

    const features =
      Array.isArray(data?.features)
        ? data.features
        : [];

    if (features.length === 0) {
      return NextResponse.json({
        success: false,
        error:
          "Aucune adresse correspondante n'a été trouvée.",
      });
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
      return NextResponse.json({
        success: false,
        error:
          "Les résultats de géocodage sont invalides.",
      });
    }

    /*
     * --------------------------------------------------
     * RECHERCHE D'UNE ADRESSE IDENTIFIÉE
     * --------------------------------------------------
     *
     * On ne prend plus automatiquement le premier
     * résultat. Une autre rue ne doit jamais être
     * enregistrée comme si elle correspondait à
     * l'adresse saisie.
     */

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
      return NextResponse.json({
        success: false,
        error:
          "L'adresse n'a pas pu être identifiée précisément. Vérifiez le numéro, la rue, le code postal et la ville.",
        candidates,
      });
    }

    /*
     * --------------------------------------------------
     * NIVEAU DE CONFIANCE
     * --------------------------------------------------
     *
     * L'identité de l'adresse est prioritaire.
     * Le score BAN sert ensuite à qualifier la qualité
     * du résultat, sans exiger artificiellement 0,9.
     */

    let confidence = "medium";

    if (best.score >= 0.5) {
      confidence = "high";
    }

    return NextResponse.json({
      success: true,

      confidence,

      postal_matches:
        best.postal_matches,

      city_matches:
        best.city_matches,

      result: best,

      candidates,
    });
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
