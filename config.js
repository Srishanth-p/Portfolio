// ============================================================
//  PORTFOLIO CONFIGURATION — edit this file to personalise
// ============================================================

const CONFIG = {
  // ── Identity ──────────────────────────────────────────────
  name:       "Patil Srishanth",
  role:       "Student @ PESU · AI/ML",
  tagline:    "I train models, chase gradients, and occasionally ask GPT to explain my own code back to me.",

  // Shown in the About section — separate from the hero tagline
  aboutText:  "Hey — I'm Srishanth. I'm studying AI & Machine Learning at PES University and \
I genuinely find it fun to dig into data, coax meaning out of messy datasets, and build \
systems that actually understand language (not just pattern-match it). \
My sweet spot is somewhere between Data Science, NLP, and \"wait, why did the model say that?\".\n\n\
I'm actively looking for internship and full-time opportunities where I can contribute \
to real ML pipelines, analytics work, or NLP research. I pick things up fast, \
I don't vanish after standup, and I'll probably over-engineer the visualisation layer \
— but in a good way.",

  // ── Social links ─────────────────────────────────────────
  github:     "https://github.com/Srishanth-p",
  linkedin:   "https://www.linkedin.com/in/srishanth-patil-07a280300/",
  resume:     "./Resume2.pdf",          // path to your PDF, or a direct URL
  email:      "srishanthp007@gmail.com",

  // ── GitHub API ────────────────────────────────────────────
  // Replace with your actual GitHub username (used for API calls)
  githubUsername: "Srishanth-p",

  // Maximum number of repos to display (sorted by stars)
  repoLimit: 3,

  // Repos to always show first, regardless of star count.
  featuredRepos: [
    "demographic_bias_analysis",
    "Multi-model-RAG-Formula-1",
    "sentient-social",
  ],

  // Repos to completely hide from the grid (forks, boilerplate, etc.)
  hiddenRepos: [
    "Portfolio",
    "Let-s_date_discover_history",
    "docksmith",
    "PES2UG23AM070_CC_LAB2",
  ],

  // ── Skills ───────────────────────────────────────────────
  skills: [
    "Python", "Pandas", "NumPy", "Scikit-learn",
    "TensorFlow", "NLP", "SQL", "Matplotlib",
    "Jupyter", "Git",
  ],

  // ── Repo description overrides ───────────────────────────
  // Keyed by exact repo name. Used when GitHub description is blank.
  repoDescriptions: {
    "demographic_bias_analysis": "Investigates demographic bias in machine learning models — compares performance across age, gender, and ethnicity groups using fairness metrics and visualisations.",
    "Portfolio": "Personal developer portfolio built with vanilla HTML, CSS, and JavaScript. Dynamically pulls GitHub repos via the API and supports light/dark theming.",
    "Let-s_date_discover_history": "An interactive history-discovery app that lets users explore significant historical events by date, with rich contextual summaries and a timeline view.",
  },

  // ── Certifications ───────────────────────────────────────
  certifications: [
    {
      title:  "Intro to Machine Learning",
      issuer: "Kaggle",
      date:   "November 2025",
      file:   "./Kaggle Cert 1.png",   // image — opens in lightbox
      type:   "image",
    },
    {
      title:  "Python for Data Science",
      issuer: "NPTEL / Course Certificate",
      date:   "2025",
      file:   "./Python for Data Science.pdf",
      type:   "pdf",
    },
  ],
};
