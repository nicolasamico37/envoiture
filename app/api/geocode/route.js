import { NextResponse } from "next/server";

const GEOCODING_URL =
  "https://data.geopf.fr/geocodage/search";

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

    const query = `${adresse}, ${codePostal} ${ville}`;

    const url =
      `${GEOCODING_URL}?q=${encodeURIComponent(query)}&limit=5`;

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

    const data = await response.json();

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

        return {
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

    const best =
      candidates[0];

    const normalizedInputPostal =
      codePostal.replace(/\s/g, "");

    const normalizedResultPostal =
      best.postcode.replace(/\s/g, "");

    const postalMatches =
      normalizedInputPostal ===
      normalizedResultPostal;

    const normalizedInputCity =
      ville
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

    const normalizedResultCity =
      best.city
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

    const cityMatches =
      normalizedInputCity ===
      normalizedResultCity;

    let confidence =
      "low";

    if (
      best.score >= 0.9 &&
      postalMatches &&
      cityMatches
    ) {
      confidence = "high";
    } else if (
      best.score >= 0.7 &&
      postalMatches
    ) {
      confidence = "medium";
    }

    return NextResponse.json({
      success: true,

      confidence,

      postal_matches:
        postalMatches,

      city_matches:
        cityMatches,

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