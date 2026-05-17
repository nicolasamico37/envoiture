export function calculateStats(
  trips = []
) {
  const joinedTrips =
    trips.filter(
      (trip) =>
        trip.initialSeats >
        trip.seats
    );

  const tripsShared =
    joinedTrips.length;

  const totalPassengers =
    joinedTrips.reduce(
      (total, trip) =>
        total +
        (trip.initialSeats -
          trip.seats),
      0
    );

  const co2Saved =
    totalPassengers * 8;

  const fuelSaved =
    totalPassengers * 5;

  const colleaguesMet =
    totalPassengers;

  const occupancyRate =
    joinedTrips.length === 0
      ? 0
      : Math.round(
          (totalPassengers /
            joinedTrips.reduce(
              (total, trip) =>
                total +
                trip.initialSeats,
              0
            )) *
            100
        );

  return {
    co2Saved,

    fuelSaved,

    tripsShared,

    colleaguesMet,

    occupancyRate,
  };
}