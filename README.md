# Blogomatik

**Blogomatik** est un configurateur de blog visuel en français. Il permet de personnaliser une page, puis de l’exporter en HTML ou en PDF, directement dans le navigateur.

Le modèle fourni contient des textes et des images de remplacement. Vous pouvez les adapter à votre projet.

## Utilisation

1. Téléchargez le fichier `index.html` depuis la dernière release : [Releases](https://github.com/Malamdg/blogomatik/releases), ou utilisez `out/index.html` après avoir généré le projet, puis ouvrez-le dans un navigateur récent.
2. En mode édition, cliquez sur les textes du blog pour les modifier.
3. Utilisez les commandes des cases et des livres pour importer vos images et modifier les mentions de stock.
4. Réglez la police, la taille du texte et les couleurs dans la partie **Apparence**.
5. Cliquez sur **Enregistrer** pour conserver vos modifications dans ce navigateur, ou exportez votre blog.

Aucune installation ni serveur ne sont nécessaires. Les polices Google sont chargées en ligne ; hors connexion, le navigateur utilise une police de remplacement.

## Exports

### HTML

**Exporter le site HTML** télécharge un fichier modifiable qui contient vos textes, vos réglages et vos images importées. Conservez ce fichier pour retrouver votre travail sur un autre appareil ou après avoir effacé les données du navigateur.

### PDF

Choisissez un format portrait **A1, A2, A3, A4 ou A5**, puis cliquez sur **Exporter en PDF**. Dans la fenêtre d’impression, sélectionnez **Enregistrer au format PDF** et le même format de papier.

Pour préserver le rendu, choisissez une échelle de 100 %, désactivez les en-têtes et pieds de page du navigateur et activez l’impression des arrière-plans. Autorisez les fenêtres pop-up si l’aperçu ne s’ouvre pas.

Le rendu dépend du navigateur et du contenu ajouté : vérifiez l’aperçu avant d’enregistrer le PDF. Les textes peuvent être très petits en A5.

## Données

Les modifications enregistrées restent dans le stockage local du navigateur et ne sont pas synchronisées entre appareils. Si le stockage local est désactivé ou saturé, exportez le fichier HTML pour conserver votre travail.

Les données locales dépendent aussi du chemin du fichier : si vous déplacez le fichier ou passez de l’ancien `index.html` à `out/index.html`, vos données enregistrées ne seront pas nécessairement retrouvées. Avant de changer de chemin, exportez votre blog en HTML et utilisez ce fichier pour conserver votre travail.

## Développement

Le développement nécessite Node.js 20 ou une version plus récente et npm. Depuis la racine du dépôt :

```sh
npm ci
npm run build
npm run watch
npm run lint
```

Le build assemble `src/html/index.html`, `src/css/styles.css` et les modules de `src/js/` dans `out/index.html`. Le script de génération se trouve dans `src/bundler/`. Modifiez les sources plutôt que le fichier généré, puis relancez le build. `npm run watch` reconstruit automatiquement le fichier lorsque les fichiers de ces trois dossiers changent (arrêt avec Ctrl+C). `npm run lint` vérifie le JavaScript des sources avec ESLint. Le fichier final reste autonome et ne nécessite ni Node.js ni serveur pour être utilisé.

## À propos

Blogomatik par MalaM : <https://github.com/Malamdg/blogomatik>
