const badwords = require("french-badwords-list");

const liste = Array.isArray(badwords)
  ? badwords
  : badwords.array || badwords.default || [];

function contientUnTermeInterdit(texte) {
  const texteNormalise = texte.toLowerCase();

  return liste.some((mot) => {
    return texteNormalise.includes(mot.toLowerCase());
  });
}

const tests = [
  "Bonjour, je travaille au Technicentre Nantes.",
  "Je fais régulièrement le trajet depuis Trignac.",
  "Ceci est une phrase normale.",
  "MERDE",
  "MerDe",
];

tests.forEach((texte) => {
  console.log(
    contientUnTermeInterdit(texte) ? "❌ BLOQUÉ" : "✅ ACCEPTÉ",
    "→",
    texte
  );
});