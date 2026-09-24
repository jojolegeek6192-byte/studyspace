# StudySpace — V1 (Core)

Stack : Next.js 15 (App Router) · TypeScript · Tailwind · Prisma + PostgreSQL (Neon) · NextAuth v5 (credentials/JWT).

## Ce qui est fait en V1

- Authentification réelle (inscription, connexion, sessions JWT, mots de passe hashés avec bcrypt)
- Onboarding en 5 étapes (niveau, matières personnalisables, trimestres/semestres, notifications)
- Base de données complète (Users, Subjects, Grades, Homework, HomeworkTasks, Schedule, Goals, Notifications)
- Notes avec conversion automatique de barème (ex: 8/10 → 16/20), coefficients, moyennes pondérées par matière
- Cahier de texte avec checklist par devoir et barre de progression
- Dashboard avec moyenne générale + tendance, progression des devoirs, prochaine évaluation
- Toutes les routes API vérifient que l'utilisateur ne peut agir que sur ses propres données (jamais de confiance dans les IDs envoyés par le client)

## Pas encore fait (V2/V3 — à la demande)

Emploi du temps, calendrier, statistiques graphiques, objectifs, calculatrice, import IA de l'EDT, assistant IA, recherche globale, badges, mode clair/sombre en bascule (les variables CSS existent déjà, il manque juste le toggle), multilingue.

---

## 🚀 Installation en local

### Étape 1 — Dézippe et installe les dépendances

```bash
cd studyspace
npm install
```

### Étape 2 — Crée une base de données Postgres gratuite sur Neon

1. Va sur https://neon.tech et crée un compte (gratuit)
2. Crée un nouveau projet
3. Copie la "Connection string" (elle ressemble à `postgresql://user:pass@host/db?sslmode=require`)

### Étape 3 — Configure les variables d'environnement

```bash
cp .env.example .env
```

Ouvre `.env` et remplace :
- `DATABASE_URL` par ta connection string Neon
- `AUTH_SECRET` par le résultat de la commande suivante :

```bash
openssl rand -base64 32
```

### Étape 4 — Crée les tables en base

```bash
npx prisma db push
```

✅ **Confirmation attendue** : tu dois voir `Your database is now in sync with your Prisma schema.`

### Étape 5 — Lance le serveur de développement

```bash
npm run dev
```

✅ **Confirmation attendue** : ouvre http://localhost:3000 — tu dois voir la page d'accueil "Toute ta vie scolaire, au même endroit."

Teste le parcours complet : inscription → onboarding → dashboard → ajoute une note → ajoute un devoir.

---

## 🌐 Déploiement sur Vercel

### Étape 1 — Pousse le projet sur GitHub

```bash
cd studyspace
git init
git add .
git commit -m "StudySpace V1"
git branch -M main
git remote add origin https://github.com/jojolegeek6192-byte/studyspace.git
git push -u origin main
```

### Étape 2 — Importe le projet sur Vercel

1. Va sur https://vercel.com/new
2. Sélectionne le repo `studyspace`
3. Avant de déployer, ajoute les variables d'environnement (section "Environment Variables") :
   - `DATABASE_URL` → ta connection string Neon
   - `AUTH_SECRET` → la même valeur générée plus haut
   - `NEXTAUTH_URL` → l'URL Vercel que tu vas obtenir (tu peux la mettre après le premier déploiement puis redéployer)
4. Clique sur "Deploy"

✅ **Confirmation attendue** : le build se termine avec "Build Completed", et l'URL `xxx.vercel.app` affiche la page d'accueil.

Si le build échoue sur une erreur Prisma, vérifie que `DATABASE_URL` est bien renseignée dans Vercel — c'est la cause la plus fréquente.

---

## Prochaines étapes possibles

Dis-moi laquelle tu veux en premier et je l'implémente en vraie fonctionnalité (pas de simulation) :
1. Emploi du temps + calendrier
2. Statistiques (graphiques Recharts)
3. Objectifs + calculatrice de moyenne
4. Mode sombre/clair (toggle) + couleur d'accent personnalisable
5. Assistant IA (nécessite une clé API Anthropic)
