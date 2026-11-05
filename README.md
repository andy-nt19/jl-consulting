# J&L Consulting : site vitrine

Site statique en HTML, CSS et JavaScript, sans dépendance ni étape de compilation.

| Fichier | Rôle |
| --- | --- |
| `index.html` | Site public |
| `styles.css` | Styles, mobile-first |
| `app.js` | Fiches pays, formulaires WhatsApp, Mobile Money, témoignages et vidéos |
| `admin.html` | Espace d'administration (`/admin.html`, non lié depuis le site) |
| `data/content.json` | Témoignages et vidéos publiés depuis l'admin. Vide au départ : ces deux sections restent masquées tant qu'il n'y a rien à afficher |
| `assets/` | Logo, photos des destinations (`destinations/`) et personnages illustrés (`personnes/`) |

## Déployer sur GitHub Pages

1. Créez un dépôt **public** sur GitHub, par exemple `jl-consulting`. Sur un compte gratuit, GitHub Pages exige un dépôt public.
2. Envoyez les fichiers à la racine du dépôt, en conservant les dossiers `data` et `assets` :

   ```powershell
   git init -b main
   git add .
   git commit -m "Site J&L Consulting"
   git remote add origin https://github.com/VOTRE-COMPTE/jl-consulting.git
   git push -u origin main
   ```

   Sans Git : sur la page du dépôt, utilisez **Add file > Upload files** et glissez-y tous les fichiers ainsi que les dossiers `data` et `assets`.
3. Dans le dépôt : **Settings > Pages**. Sous **Build and deployment**, choisissez **Deploy from a branch**, puis la branche `main` et le dossier `/ (root)`. Enregistrez.
4. Après une à deux minutes, le site est en ligne sur `https://VOTRE-COMPTE.github.io/jl-consulting/`.

Pour un nom de domaine personnalisé, renseignez **Custom domain** sur la même page et cochez **Enforce HTTPS**.

## Configurer l'espace admin

À faire une fois par appareil (téléphone ou ordinateur du propriétaire).

**1. Créer le jeton GitHub**

1. Ouvrez <https://github.com/settings/personal-access-tokens/new>.
2. Donnez-lui un nom et une date d'expiration (un an au maximum conseillé).
3. Sous **Repository access**, choisissez **Only select repositories**, puis ce dépôt uniquement.
4. Sous **Permissions > Repository permissions**, réglez **Contents** sur **Read and write**.
5. Générez le jeton et copiez-le. GitHub ne l'affiche qu'une fois.

**2. Configurer la page**

1. Ouvrez `https://VOTRE-COMPTE.github.io/jl-consulting/admin.html`.
2. Saisissez le dépôt (`VOTRE-COMPTE/jl-consulting`), le jeton et un mot de passe d'au moins 10 caractères.

Ensuite, seul le mot de passe est demandé sur cet appareil. Chaque témoignage ou vidéo publié crée un commit sur `data/content.json`, et le site se met à jour en quelques minutes.

## Sécurité de l'admin

GitHub Pages n'exécute aucun code côté serveur : un mot de passe seul, vérifié dans le navigateur, ne protégerait rien. La protection repose donc sur le jeton GitHub.

- Le jeton ne figure jamais dans le code ni dans le dépôt. Sans jeton valide, `admin.html` ne permet aucune modification du site, même ouverte par un inconnu.
- Le jeton est chiffré sur l'appareil (AES-GCM, clé dérivée du mot de passe par PBKDF2). Il n'est déchiffré qu'en mémoire et se reverrouille après 15 minutes d'inactivité.
- **Mot de passe oublié** : utilisez le lien de la page de connexion, puis saisissez un jeton valide.
- **Appareil perdu ou jeton compromis** : révoquez le jeton sur <https://github.com/settings/personal-access-tokens>. Tout accès cesse immédiatement.
- **Jeton expiré** : créez-en un nouveau et reconfigurez l'appareil.

N'utilisez pas l'admin sur un ordinateur partagé.

## Personnaliser

- **Numéro Airtel Money** : aucun numéro n'a été fourni, le site affiche donc « Numéro sur demande ». Renseignez `AIRTEL` en haut de `app.js`, par exemple `AIRTEL: '+242 05 000 00 00'`.
- **Numéro WhatsApp** : modifiez `WHATSAPP` dans `app.js`, puis remplacez `242069640167` et `+242 06 964 01 67` dans `index.html`.
- **Numéro MTN** : remplacez `+242 06 896 84 58` dans `index.html`.
- **Fiches pays** : le contenu se trouve dans `index.html`, section `id="pays"`. Relisez-le régulièrement, car les procédures consulaires évoluent.
- **Ajouter une destination** : le site en compte 7 (France, Italie, Espagne, Canada, Brésil, Albanie, Chine). Dans `index.html`, dupliquez puis adaptez la ligne du tableau d'accueil (`data-tab`), l'onglet (`role="tab"`), la fiche (`id="fiche-…"`) et l'`<option>` de la liste « Destination » du formulaire. Mettez aussi à jour la numérotation des fiches (« 01 — 07 ») et, dans `admin.html`, la liste `pays-liste`.

## Tester en local

Le chargement de `data/content.json` nécessite un serveur local. Dans VS Code, installez l'extension **Live Server**, faites un clic droit sur `index.html`, puis choisissez **Open with Live Server**. Si Python est installé, lancez plutôt `python -m http.server 8000` et ouvrez <http://localhost:8000>.

## Images

- **Photos des destinations** : elles proviennent de Wikimedia Commons, sous licences CC0, CC BY ou CC BY-SA. Le nom de l'auteur, le lien vers la source et la licence figurent sur chaque photo : **ne retirez pas ces mentions**, les licences CC BY et CC BY-SA les exigent. Les copies recadrées restent sous la licence d'origine.
- **Ajouter ou changer une photo** : fournissez un fichier WebP de 480 × 300 et un de 800 × 500 dans `assets/destinations/`, puis dupliquez une ligne `class="slide"` de la fiche concernée dans `index.html`.
- **Personnages** : ce sont des illustrations SVG créées pour ce site, dans `assets/personnes/`. Ils ne représentent pas de vraies personnes.
- **Logo** : `assets/logo-96.webp`, `assets/logo-192.webp` et `assets/favicon-64.png`.

## Performance

Le site ne charge ni police ni script externes, et ses images sont servies par le site lui-même. Une photo pèse environ 19 Ko sur mobile et 48 Ko sur grand écran. Seules les photos de la fiche ouverte sont téléchargées, et seulement quand la section approche de l'écran. Le défilement automatique s'arrête quand l'option d'économie de données ou de réduction des animations est active. Les miniatures YouTube ne sont chargées qu'à l'approche de la section vidéos, et le lecteur YouTube seulement au clic.
