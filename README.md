# Suona con Gigi - Frontend

Frontend Angular della piattaforma **Suona con Gigi**, una community musicale pensata per connettere musicisti, gestire eventi live, profili personali, forum e area amministrativa.

L'applicazione consuma le API REST del backend Suona con Gigi, usa autenticazione JWT e offre un'esperienza single page con rotte protette per utenti autenticati e amministratori.

## Stack

- Angular 21
- TypeScript 5.9
- RxJS
- Angular Router
- Angular HttpClient
- Angular Signals
- Angular Animations
- CSS
- HugeRTE Angular
- Node.js 24+
- npm

## Funzionalita principali

- Home pubblica con hero visuale
- Registrazione e login utente
- Verifica email tramite token
- Persistenza sessione in `localStorage`
- Interceptor HTTP per aggiungere automaticamente il token JWT
- Interceptor per gestione errori e stato di caricamento
- Rotte protette con `authGuard`
- Rotte amministrative protette con `adminGuard`
- Lista eventi con ricerca
- Dettaglio evento, iscrizione e like
- Creazione eventi
- Modifica e moderazione eventi per admin
- Profilo utente e profilo musicale
- Forum con categorie, thread, dettaglio discussione e post
- Ricerca nel forum
- Dashboard admin
- Gestione template email di verifica

## Requisiti

- Node.js `>=24.0.0`
- npm
- Backend Suona con Gigi in esecuzione

In sviluppo il frontend si aspetta il backend a:

```text
http://localhost:8080/suonacongigi/api
```

## Configurazione ambiente

Configurazione sviluppo:

```ts
// src/environments/environment.development.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/suonacongigi/api'
};
```

Configurazione produzione:

```ts
// src/environments/environment.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.suonacongigi.com/api'
};
```

Prima del deploy aggiorna `apiUrl` con l'URL reale del backend.

## Installazione

Clona il repository, entra nella cartella del frontend e installa le dipendenze:

```bash
npm install
```

## Avvio locale

Avvia il server di sviluppo Angular:

```bash
npm start
```

L'applicazione sara disponibile di default a:

```text
http://localhost:4200
```

Per un'esperienza completa avvia anche il backend sulla porta `8080`.

## Build

Build di produzione:

```bash
npm run build
```

L'output viene generato in:

```text
dist/suonacongigi
```

Build in watch mode per sviluppo:

```bash
npm run watch
```

## Script disponibili

| Comando | Descrizione |
| --- | --- |
| `npm start` | Avvia Angular dev server |
| `npm run build` | Genera la build di produzione |
| `npm run watch` | Esegue build in watch mode con configurazione development |
| `npm run ng` | Espone Angular CLI |

## Rotte principali

| Rotta | Accesso | Descrizione |
| --- | --- | --- |
| `/` | Pubblico | Home page |
| `/login` | Pubblico | Login utente |
| `/register` | Pubblico | Registrazione utente |
| `/verify` | Pubblico | Verifica email tramite token |
| `/events` | Utente autenticato | Lista eventi |
| `/events/new` | Utente autenticato | Creazione evento |
| `/events/:id` | Utente autenticato | Dettaglio evento |
| `/profile` | Utente autenticato | Profilo personale |
| `/forum` | Utente autenticato | Lista discussioni forum |
| `/forum/threads/:id` | Utente autenticato | Dettaglio thread |
| `/admin` | Admin | Dashboard amministratore |
| `/admin/events/:id/edit` | Admin | Modifica evento |
| `/admin/email` | Admin | Gestione template email |

Le rotte non riconosciute vengono reindirizzate alla home.

## Integrazione con il backend

I servizi HTTP estendono un `BaseService` comune che costruisce gli URL a partire da `environment.apiUrl` e spacchetta le risposte del backend.

Esempio:

```text
environment.apiUrl + /events
```

diventa:

```text
http://localhost:8080/suonacongigi/api/events
```

Il backend deve restituire risposte nel formato previsto dal modello `ApiResponse`.

## Autenticazione

Il login salva la sessione nella chiave:

```text
sg_session
```

La sessione contiene token JWT, utente e ruolo. L'`authInterceptor` aggiunge automaticamente:

```http
Authorization: Bearer <token>
```

a ogni richiesta autenticata.

## Struttura progetto

```text
src/app
|-- core
|   |-- directives    # Direttive condivise
|   |-- guards        # authGuard e adminGuard
|   |-- interceptors  # JWT, errori e loading
|   |-- models        # Interfacce e tipi TypeScript
|   `-- services      # Servizi HTTP e stato applicativo
|-- features
|   |-- admin         # Dashboard admin e template email
|   |-- auth          # Login, registrazione e verifica email
|   |-- events        # Lista, dettaglio e form eventi
|   |-- forum         # Lista thread e dettaglio discussione
|   |-- home          # Home pubblica
|   `-- profile       # Profilo utente
`-- shared            # Componenti condivisi
```

Asset pubblici:

```text
public/
|-- favicon.ico
`-- images/hero_suonacongigi.jpg
```

## Note per il deploy

Prima di pubblicare:

- aggiornare `src/environments/environment.ts` con l'URL backend corretto
- verificare che il backend consenta il dominio frontend nella configurazione CORS
- eseguire `npm run build`
- pubblicare il contenuto generato in `dist/suonacongigi/browser`
- configurare il server hosting con fallback verso `index.html` per supportare Angular Router

