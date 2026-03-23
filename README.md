# NoteVision Pro — Istruzioni Deploy su Vercel

## Struttura del progetto
```
notelabels/
├── api/
│   └── claude.js        ← server proxy (nasconde la API key)
├── public/
│   └── index.html       ← applicazione web
├── package.json
├── vercel.json
└── README.md
```

---

## Come mettere online su Vercel (gratis, 10 minuti)

### Passo 1 — Crea un account GitHub (se non ce l'hai)
1. Vai su **github.com**
2. Clicca **Sign up** e crea un account gratuito

### Passo 2 — Carica il progetto su GitHub
1. Vai su **github.com/new** (crea nuovo repository)
2. Nome: `notelabels` — clicca **Create repository**
3. Clicca **uploading an existing file**
4. Trascina TUTTI i file di questa cartella (mantenendo la struttura)
5. Clicca **Commit changes**

### Passo 3 — Crea account Vercel
1. Vai su **vercel.com**
2. Clicca **Sign up** → scegli **Continue with GitHub**
3. Autorizza Vercel

### Passo 4 — Importa il progetto
1. Su Vercel clicca **Add New Project**
2. Seleziona il repository `notelabels`
3. Clicca **Deploy** (non modificare niente)

### Passo 5 — Aggiungi la API key (IMPORTANTE)
1. Nel progetto Vercel vai su **Settings → Environment Variables**
2. Clicca **Add New**
3. Name: `ANTHROPIC_API_KEY`
4. Value: la tua chiave `sk-ant-api03-...`
5. Clicca **Save**
6. Vai su **Deployments** → clicca **Redeploy**

### Passo 6 — Usa l'app!
Vercel ti darà un indirizzo tipo:
`https://notelabels.vercel.app`

Chiunque apra quell'indirizzo può usare l'app **senza inserire nessuna chiave**.

---

## Costi
- **Vercel hosting**: GRATUITO
- **API Anthropic (Claude Haiku)**: ~€0.002 per analisi
  - Con €5 di credito → circa 2.500 analisi

## Aggiornare l'app
Per modificare l'app in futuro: modifica i file su GitHub
Vercel si aggiorna automaticamente in pochi secondi.

