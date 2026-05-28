#!/bin/bash
# Lancement de l'application X-Free Dashboard sur Mac / Linux

echo "=========================================================="
echo "       Lancement de l'application X-Free Dashboard"
echo "=========================================================="
echo ""
echo "Pourquoi ce script ?"
echo "Les navigateurs (Chrome, Opera, etc.) interdisent l'ouverture"
echo "directe de fichiers HTML contenant des modules Javascript"
echo "via le protocole 'file://' pour des raisons de sécurité (CORS)."
echo ""
echo "De plus, l'installation au format PWA exige impérativement"
echo "de passer par une adresse sécurisée ou locale (localhost)."
echo ""
echo "Nous démarrons un mini-serveur ultra-léger..."
echo ""
echo "[1/2] Lancement du navigateur sur http://localhost:8080 ..."

if command -v xdg-open > /dev/null; then
  xdg-open "http://localhost:8080"
elif command -v open > /dev/null; then
  open "http://localhost:8080"
else
  echo "Veuillez ouvrir votre navigateur et aller sur : http://localhost:8080"
fi

echo ""
echo "[2/2] Démarrage du serveur local (laissez cette fenêtre ouverte pendant l'usage)"
echo ""
npx -y http-server ./Ready.To.Use -p 8080 -c-1
