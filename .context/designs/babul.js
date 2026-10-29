(window.BABUL ||= {}).product = {
  "format": 1,
  "name": "Ritesh Firodiya",
  "description": "The portfolio site: who Ritesh is, every product he builds, the résumé, and the support and legal pages app users and store reviewers open.",
  "startedFrom": "blank",
  "start": "home/home",
  "logo": "assets/icon.svg",
  "art": [],
  "sizes": [
    "web"
  ],
  "perSize": false,
  "frames": {
    "web": {
      "w": 1440,
      "h": 900
    }
  },
  "themes": [
    "dark",
    "light"
  ],
  "stack": [
    "nextjs",
    "react",
    "tailwind",
    "lucide",
    "github-pages"
  ],
  "roles": [],
  "missing": [
    {
      "what": "A product's own design set",
      "why": "served as that set's own index.html at /products/<slug>/designs/ — it is the product's document, not a screen of this site"
    },
    {
      "what": "Forwards for /work, /process, /about, /contact, /hire, /products and /work/<slug>",
      "why": "meta-refresh files with no visible layout"
    }
  ]
};
