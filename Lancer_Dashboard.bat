@echo off
title Lancer X-Free Dashboard
echo ==========================================================
echo        Lancement de l'application X-Free Dashboard
echo ==========================================================
echo.
echo Pourquoi cette fenetre ?
echo Les navigateurs (Chrome, Opera, etc.) interdisent l'ouverture
echo directe de fichiers HTML contenant des modules Javascript 
echo via le protocole "file://" pour des raisons de securite.
echo.
echo De plus, l'installation au format PWA exige imperativement
echo de passer par une adresse securisee ou locale (localhost).
echo.
echo Nous demarrons un mini-serveur ultra-leger...
echo.
echo [1/2] Lancement du navigateur sur http://localhost:8080 ...
start "" "http://localhost:8080"
echo.
echo [2/2] Demarrage du serveur local (laissez cette fenetre ouverte pendant l'usage)
echo.
npx -y http-server ./Ready.To.Use -p 8080 -c-1
pause
