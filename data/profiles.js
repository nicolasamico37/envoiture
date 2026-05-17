export const profiles = [
  {
    id: 1,

    name: "Nicolas",

    city: "La Riche (37520)",

    destination:
      "Technicentre Nantes",

    role:
      "Technicien de maintenance",

    bio:
      "Travaille au Technicentre de Nantes. Recherche des trajets réguliers et fiables pour les prises de service du matin.",

    avatar: "N",

    days: [
      "Lun",
      "Mar",
      "Mer",
      "Jeu",
      "Ven",
    ],

    horaires: {
      Lun: {
        priseService: "07:15",
        departMaison: "06:20",
        retour: "16:00",
      },

      Mar: {
        priseService: "07:15",
        departMaison: "06:20",
        retour: "16:00",
      },

      Mer: {
        priseService: "07:15",
        departMaison: "06:20",
        retour: "16:00",
      },

      Jeu: {
        priseService: "07:15",
        departMaison: "06:20",
        retour: "16:00",
      },

      Ven: {
        priseService: "04:32",
        departMaison: "03:40",
        retour: "12:00",
      },
    },

    pointsRencontre: [
      "Gare de Tours",
      "Parking relais Tours Centre",
    ],

    conducteur: true,
  },

  {
    id: 2,

    name: "Camille",

    city: "Trignac",

    destination:
      "Technicentre Nantes",

    role:
      "Agent logistique",

    bio:
      "Disponible tous les matins en semaine pour du covoiturage.",

    avatar: "C",

    days: [
      "Lun",
      "Mar",
      "Jeu",
      "Ven",
    ],

    horaires: {
      Lun: {
        priseService: "06:00",
        departMaison: "05:05",
        retour: "15:00",
      },

      Mar: {
        priseService: "06:00",
        departMaison: "05:05",
        retour: "15:00",
      },

      Jeu: {
        priseService: "06:00",
        departMaison: "05:05",
        retour: "15:00",
      },

      Ven: {
        priseService: "06:00",
        departMaison: "05:05",
        retour: "15:00",
      },
    },

    pointsRencontre: [
      "Gare de Saint-Nazaire",
      "Parking Océanis",
    ],

    conducteur: true,
  },

  {
    id: 3,

    name: "Thomas",

    city: "Saint-Nazaire",

    destination: "Nantes",

    role:
      "Conducteur de ligne",

    bio:
      "Effectue régulièrement les trajets matin et soir.",

    avatar: "T",

    days: [
      "Lun",
      "Mer",
      "Ven",
    ],

    horaires: {
      Lun: {
        priseService: "05:45",
        departMaison: "04:50",
        retour: "13:30",
      },

      Mer: {
        priseService: "05:45",
        departMaison: "04:50",
        retour: "13:30",
      },

      Ven: {
        priseService: "05:45",
        departMaison: "04:50",
        retour: "13:30",
      },
    },

    pointsRencontre: [
      "Gare SNCF de Savenay",
      "Parking relais Nantes Nord",
    ],

    conducteur: false,
  },
];