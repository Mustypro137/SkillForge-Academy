// The list of all pages in the app. This is only data (no DOM, no storage).
// Each route has:
//   id     - short name used by main.js to pick the page file
//   path   - the part after "#/" in the URL
//   label  - text shown in the menu
//   group  - menu heading ("" = no heading)
//   ready  - false means the page is not built yet ("Coming soon")
//   note   - which milestone builds it (shown on the placeholder page)

export const routes = [
  { id: 'dashboard', path: '',         label: 'Dashboard',          group: '',             ready: true,  note: 'Milestone 6' },

  { id: 'grammar',   path: 'grammar',  label: 'Grammar',            group: 'Practice',     ready: true,  note: 'Milestone 4' },
  { id: 'writing',   path: 'writing',  label: 'Writing',            group: 'Practice',     ready: false, note: 'Milestone 8' },
  { id: 'reading',   path: 'reading',  label: 'Reading',            group: 'Practice',     ready: false, note: 'Milestone 13' },

  { id: 'roleplay',  path: 'roleplay', label: 'Roleplay',           group: 'Professional', ready: false, note: 'Milestone 9' },
  { id: 'linkedin',  path: 'linkedin', label: 'LinkedIn',           group: 'Professional', ready: false, note: 'Milestone 10' },
  { id: 'freelance', path: 'freelance',label: 'Freelance',          group: 'Professional', ready: false, note: 'Milestone 11' },
  { id: 'technical', path: 'technical',label: 'Technical English',  group: 'Professional', ready: false, note: 'Milestone 12' },

  { id: 'mistakes',  path: 'mistakes', label: 'Mistake notebook',   group: 'Review',       ready: true,  note: 'Milestone 5' },
  { id: 'reports',   path: 'reports',  label: 'Progress reports',   group: 'Review',       ready: false, note: 'Milestone 14' },

  { id: 'settings',  path: 'settings', label: 'Settings and backup',group: '',             ready: true,  note: 'Milestone 3' },
];
