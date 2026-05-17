function timeToMinutes(time) {
  const [hours, minutes] =
    time.split(":").map(Number);

  return hours * 60 + minutes;
}

export default function calculateCompatibility(
  currentUser,
  otherUser
) {
  let score = 0;

  if (
    currentUser.destination ===
    otherUser.destination
  ) {
    score += 30;
  }

  const commonDays =
    currentUser.days.filter(
      (day) =>
        otherUser.days.includes(day)
    );

  score += commonDays.length * 8;

  if (
    currentUser.conducteur !==
    otherUser.conducteur
  ) {
    score += 15;
  }

  if (
    currentUser.city ===
    otherUser.city
  ) {
    score += 15;
  }

  let compatibleSchedules = 0;

  commonDays.forEach((day) => {
    const currentSchedule =
      currentUser.horaires[day];

    const otherSchedule =
      otherUser.horaires[day];

    if (
      !currentSchedule ||
      !otherSchedule
    ) {
      return;
    }

    const currentStart =
      timeToMinutes(
        currentSchedule.priseService
      );

    const otherStart =
      timeToMinutes(
        otherSchedule.priseService
      );

    const difference =
      Math.abs(
        currentStart -
          otherStart
      );

    if (difference <= 30) {
      compatibleSchedules += 1;
    }
  });

  score += compatibleSchedules * 8;

  if (score > 100) {
    score = 100;
  }

  return score;
}