import { calculateDistanceKm } from "@/utils/distance";

/*
 * --------------------------------------------------
 * UTILITAIRES HORAIRES
 * --------------------------------------------------
 */

function timeToMinutes(time) {
  if (!time || typeof time !== "string") {
    return null;
  }

  const [hours, minutes] =
    time.split(":").map(Number);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

/*
 * --------------------------------------------------
 * JOURS COMMUNS
 * --------------------------------------------------
 */

function getCommonDays(user1, user2) {
  const days1 = Array.isArray(user1?.days)
    ? user1.days
    : [];

  const days2 = Array.isArray(user2?.days)
    ? user2.days
    : [];

  return days1.filter((day) =>
    days2.includes(day)
  );
}

/*
 * --------------------------------------------------
 * FENÊTRE DE DÉPART
 * --------------------------------------------------
 *
 * Exemple :
 *
 * départ : 03:45
 * tolérance : 10 min
 *
 * fenêtre :
 * 03:35 → 03:55
 */

function getDepartureWindow(
  departureTime,
  toleranceMinutes
) {
  const departure =
    timeToMinutes(departureTime);

  if (departure === null) {
    return null;
  }

  const numericTolerance =
    Number(toleranceMinutes);

  const tolerance =
    Number.isFinite(numericTolerance)
      ? Math.min(
          Math.max(
            numericTolerance,
            5
          ),
          15
        )
      : 15;

  return {
    start:
      departure - tolerance,

    end:
      departure + tolerance,
  };
}

/*
 * --------------------------------------------------
 * COMPATIBILITÉ DES DÉPARTS
 * --------------------------------------------------
 *
 * Deux utilisateurs sont compatibles si leurs
 * fenêtres de départ se chevauchent.
 */

function getDepartureCompatibility(
  schedule1,
  schedule2,
  tolerance1,
  tolerance2
) {
  if (
    !schedule1 ||
    !schedule2
  ) {
    return null;
  }

  const window1 =
    getDepartureWindow(
      schedule1.departMaison,
      tolerance1
    );

  const window2 =
    getDepartureWindow(
      schedule2.departMaison,
      tolerance2
    );

  if (
    !window1 ||
    !window2
  ) {
    return null;
  }

  const overlapStart =
    Math.max(
      window1.start,
      window2.start
    );

  const overlapEnd =
    Math.min(
      window1.end,
      window2.end
    );

  if (
    overlapStart >
    overlapEnd
  ) {
    return null;
  }

  const departure1 =
    timeToMinutes(
      schedule1.departMaison
    );

  const departure2 =
    timeToMinutes(
      schedule2.departMaison
    );

  /*
   * On cherche l'heure commune la plus équilibrée.
   *
   * On part du milieu des deux horaires habituels,
   * puis on le limite à la zone réellement commune.
   */

  const midpoint =
    (departure1 +
      departure2) /
    2;

  const meetingTime =
    Math.min(
      Math.max(
        midpoint,
        overlapStart
      ),
      overlapEnd
    );

  const shift1 =
    Math.abs(
      meetingTime -
        departure1
    );

  const shift2 =
    Math.abs(
      meetingTime -
        departure2
    );

  return {
    compatible: true,

    window1,
    window2,

    overlapStart,
    overlapEnd,

    meetingTime,

    shift1,
    shift2,
  };
}

/*
 * --------------------------------------------------
 * JOURS COMPATIBLES
 * --------------------------------------------------
 */

function getCompatibleDays(
  user1,
  user2,
  commonDays
) {
  const compatibleDays = [];

  const departureCompatibility = {};

  commonDays.forEach((day) => {
    const schedule1 =
      user1?.horaires?.[day];

    const schedule2 =
      user2?.horaires?.[day];

    const compatibility =
      getDepartureCompatibility(
        schedule1,
        schedule2,
        user1?.tolerance_depart_minutes,
        user2?.tolerance_depart_minutes
      );

    if (!compatibility) {
      return;
    }

    compatibleDays.push(day);

    departureCompatibility[day] =
      compatibility;
  });

  return {
    compatibleDays,
    departureCompatibility,
  };
}

/*
 * --------------------------------------------------
 * SCORE DE PROXIMITÉ DES RÉSIDENCES
 * --------------------------------------------------
 *
 * Maximum : 30 points
 *
 * ≤ 0,5 km : 30
 * ≤ 1 km   : 24
 * ≤ 1,5 km : 18
 * ≤ 2 km   : 12
 * > 2 km   : 0
 *
 * Au-delà de 2 km, le profil est exclu du matching
 * par l'API /api/matching.
 */

function calculateDistanceScore(
  distanceKm
) {
  if (
    distanceKm === null ||
    !Number.isFinite(
      Number(distanceKm)
    )
  ) {
    return 0;
  }

  const distance =
    Number(distanceKm);

  if (distance <= 0.5) {
    return 30;
  }

  if (distance <= 1) {
    return 24;
  }

  if (distance <= 1.5) {
    return 18;
  }

  if (distance <= 2) {
    return 12;
  }

  return 0;
}

/*
 * --------------------------------------------------
 * SCORE FINAL
 * --------------------------------------------------
 */

export function calculateCompatibilityBase(
  currentUser,
  otherUser
) {
  /*
   * ------------------------------------------------
   * JOURS COMMUNS
   * ------------------------------------------------
   */

  const commonDays =
    getCommonDays(
      currentUser,
      otherUser
    );

  if (
    commonDays.length === 0
  ) {
    return {
      score: 0,

      sameDestination: false,
      roleCompatible: false,

      commonDays: [],
      compatibleDays: [],
      departureCompatibility: {},

      siteScore: 0,
      daysScore: 0,
      departureScore: 0,
      roleScore: 0,
    };
  }

  /*
   * ------------------------------------------------
   * MÊME ÉTABLISSEMENT — 20 POINTS
   * ------------------------------------------------
   */

  const sameDestination =
    Boolean(
      currentUser?.destination &&
        otherUser?.destination &&
        currentUser.destination ===
          otherUser.destination
    );

  const siteScore =
    sameDestination
      ? 20
      : 0;

  /*
   * ------------------------------------------------
   * CONDUCTEUR / PASSAGER — 10 POINTS
   * ------------------------------------------------
   */

  const currentCanDrive =
    Boolean(
      currentUser?.conducteur
    );

  const currentCanRide =
    Boolean(
      currentUser?.passager
    );

  const otherCanDrive =
    Boolean(
      otherUser?.conducteur
    );

  const otherCanRide =
    Boolean(
      otherUser?.passager
    );

  const roleCompatible =
    (
      currentCanDrive &&
      otherCanRide
    ) ||
    (
      currentCanRide &&
      otherCanDrive
    );

  const roleScore =
    roleCompatible
      ? 10
      : 0;

  /*
   * ------------------------------------------------
   * FENÊTRES DE DÉPART — 25 POINTS
   * ------------------------------------------------
   */

  const {
    compatibleDays,
    departureCompatibility,
  } =
    getCompatibleDays(
      currentUser,
      otherUser,
      commonDays
    );

  /*
   * Aucun jour avec une fenêtre compatible :
   * aucun match.
   */

  if (
    compatibleDays.length === 0
  ) {
    return {
      score: 0,

      sameDestination,
      roleCompatible,

      commonDays,
      compatibleDays: [],
      departureCompatibility: {},

      siteScore,
      daysScore: 0,
      departureScore: 0,
      roleScore,
    };
  }

  /*
   * ------------------------------------------------
   * JOURS COMMUNS — 15 POINTS
   * ------------------------------------------------
   *
   * 5 jours = 15 points
   * 4 jours = 12 points
   * 3 jours = 9 points
   * etc.
   */

  const daysScore =
    Math.round(
      Math.min(
        commonDays.length * 3,
        15
      )
    );

  /*
   * ------------------------------------------------
   * QUALITÉ DES HORAIRES — 25 POINTS
   * ------------------------------------------------
   *
   * Plus les deux horaires habituels sont proches
   * à l'intérieur des fenêtres acceptées, plus le
   * score est élevé.
   */

  let departureQuality = 0;

  compatibleDays.forEach(
    (day) => {
      const compatibility =
        departureCompatibility[
          day
        ];

      if (!compatibility) {
        return;
      }

      const tolerance1 =
        (
          compatibility.window1.end -
          compatibility.window1.start
        ) / 2;

      const tolerance2 =
        (
          compatibility.window2.end -
          compatibility.window2.start
        ) / 2;

      const maxTolerance =
        Math.max(
          tolerance1,
          tolerance2
        );

      const maxShift =
        Math.max(
          compatibility.shift1,
          compatibility.shift2
        );

      let quality = 1;

      if (
        maxTolerance > 0
      ) {
        quality =
          Math.max(
            0,
            1 -
              maxShift /
                maxTolerance
          );
      }

      departureQuality +=
        quality;
    }
  );

  const averageDepartureQuality =
    departureQuality /
    compatibleDays.length;

  /*
   * Si tous les jours communs sont compatibles,
   * la totalité des 25 points peut être obtenue.
   */

  const compatibleDayRatio =
    compatibleDays.length /
    commonDays.length;

  const departureScore =
    Math.round(
      25 *
        compatibleDayRatio *
        averageDepartureQuality
    );

  /*
   * ------------------------------------------------
   * SCORE DE BASE
   * ------------------------------------------------
   *
   * Le score de base est volontairement limité
   * à 70 points.
   *
   * Les 30 points de proximité sont ajoutés
   * ensuite dans calculateFinalScore().
   */

  const score =
    siteScore +
    daysScore +
    departureScore +
    roleScore;

  return {
    score,

    sameDestination,
    roleCompatible,

    commonDays,
    compatibleDays,
    departureCompatibility,

    siteScore,
    daysScore,
    departureScore,
    roleScore,
  };
}

/*
 * --------------------------------------------------
 * DISTANCE ENTRE LES RÉSIDENCES
 * --------------------------------------------------
 */

export function calculateHomeDistance(
  residence1,
  residence2
) {
  if (
    !residence1 ||
    !residence2
  ) {
    return null;
  }

  if (
    residence1.latitude == null ||
    residence1.longitude == null ||
    residence2.latitude == null ||
    residence2.longitude == null
  ) {
    return null;
  }

  return calculateDistanceKm(
    residence1.latitude,
    residence1.longitude,
    residence2.latitude,
    residence2.longitude
  );
}

/*
 * --------------------------------------------------
 * SCORE FINAL
 * --------------------------------------------------
 *
 * 70 points de compatibilité générale
 * + 30 points de proximité du domicile
 *
 * Maximum : 100
 */

export function calculateFinalScore({
  baseScore = 0,
  homeDistanceKm = null,
}) {
  const distanceScore =
    calculateDistanceScore(
      homeDistanceKm
    );

  const score =
    Math.min(
      Math.max(
        Math.round(
          baseScore +
            distanceScore
        ),
        0
      ),
      100
    );

  return {
    score,
    distanceScore,
  };
}

/*
 * --------------------------------------------------
 * ANCIEN CALCUL DE DÉTOUR
 * --------------------------------------------------
 *
 * Conservé pour ne pas casser d'éventuelles
 * fonctionnalités existantes.
 *
 * Il n'est PAS utilisé par le matching actuel.
 */

export async function calculateDetour(
  driverResidence,
  passengerResidence,
  workplace,
  routeUrl = "/api/route"
) {
  if (
    !driverResidence ||
    !passengerResidence ||
    !workplace
  ) {
    return null;
  }

  const directResponse =
    await fetch(routeUrl, {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        start: {
          latitude:
            driverResidence.latitude,
          longitude:
            driverResidence.longitude,
        },

        end: {
          latitude:
            workplace.latitude,
          longitude:
            workplace.longitude,
        },
      }),
    });

  const directData =
    await directResponse.json();

  if (
    !directResponse.ok ||
    !directData.success
  ) {
    throw new Error(
      directData.error ||
        "Impossible de calculer le trajet direct."
    );
  }

  const carpoolResponse =
    await fetch(routeUrl, {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        start: {
          latitude:
            driverResidence.latitude,
          longitude:
            driverResidence.longitude,
        },

        intermediates: [
          {
            latitude:
              passengerResidence.latitude,
            longitude:
              passengerResidence.longitude,
          },
        ],

        end: {
          latitude:
            workplace.latitude,
          longitude:
            workplace.longitude,
        },
      }),
    });

  const carpoolData =
    await carpoolResponse.json();

  if (
    !carpoolResponse.ok ||
    !carpoolData.success
  ) {
    throw new Error(
      carpoolData.error ||
        "Impossible de calculer le trajet avec passager."
    );
  }

  const distanceDetour =
    carpoolData.distance_km -
    directData.distance_km;

  const durationDetour =
    carpoolData.duration_minutes -
    directData.duration_minutes;

  return {
    directDistanceKm:
      directData.distance_km,

    directDurationMinutes:
      directData.duration_minutes,

    carpoolDistanceKm:
      carpoolData.distance_km,

    carpoolDurationMinutes:
      carpoolData.duration_minutes,

    detourKm:
      Number(
        Math.max(
          0,
          distanceDetour
        ).toFixed(2)
      ),

    detourMinutes:
      Number(
        Math.max(
          0,
          durationDetour
        ).toFixed(1)
      ),
  };
}