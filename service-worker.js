// Service worker: makes the app available offline after the first full load.
// The list below is every file the app needs. A test checks that no app file is missing.
// When you add or remove a file, update CORE_ASSETS and bump CACHE_NAME.

const CACHE_NAME = 'skillforge-v2';

const CORE_ASSETS = [
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './js/main.js',
  './js/pwa.js',
  './js/router.js',
  './js/routes.js',
  './js/state.js',
  './js/storage.js',
  './js/intent.js',
  './js/logic/academy.js',
  './js/logic/answer-check.js',
  './js/logic/dashboard.js',
  './js/logic/progress.js',
  './js/logic/reports.js',
  './js/logic/review-schedule.js',
  './js/logic/roleplay.js',
  './js/logic/roleplay-progress.js',
  './js/logic/writing-check.js',
  './js/logic/writing-progress.js',
  './js/pages/academy.js',
  './js/pages/coming-soon.js',
  './js/pages/dashboard.js',
  './js/pages/exercise-view.js',
  './js/pages/freelance.js',
  './js/pages/grammar.js',
  './js/pages/lesson-player.js',
  './js/pages/linkedin.js',
  './js/pages/mistakes.js',
  './js/pages/placeholder.js',
  './js/pages/reading.js',
  './js/pages/reports.js',
  './js/pages/roleplay.js',
  './js/pages/settings.js',
  './js/pages/technical.js',
  './js/pages/writing.js',
  './js/ui/check-list.js',
  './js/ui/dom.js',
  './js/ui/download.js',
  './js/ui/page.js',
  './js/ui/theme.js',
  './content/index.js',
  './content/skill-tags.js',
  './content/grammar/index.js',
  './content/grammar/articles.js',
  './content/grammar/capitals-punctuation.js',
  './content/grammar/present-simple.js',
  './content/linkedin/index.js',
  './content/linkedin/asking-help.js',
  './content/linkedin/connection-requests.js',
  './content/linkedin/headline-about.js',
  './content/linkedin/posts-followups.js',
  './content/linkedin/recruiters.js',
  './content/freelance/index.js',
  './content/freelance/after-the-job.js',
  './content/freelance/brief.js',
  './content/freelance/changes.js',
  './content/freelance/contracts.js',
  './content/freelance/deadlines.js',
  './content/freelance/delivery.js',
  './content/freelance/difficult-clients.js',
  './content/freelance/feedback.js',
  './content/freelance/finding-clients.js',
  './content/freelance/first-call.js',
  './content/freelance/payment.js',
  './content/freelance/portfolio.js',
  './content/freelance/pricing.js',
  './content/freelance/progress-updates.js',
  './content/freelance/proposal.js',
  './content/freelance/saying-no.js',
  './content/freelance/time-zones.js',
  './content/freelance/working-with-team.js',
  './content/technical/index.js',
  './content/technical/bug-reports.js',
  './content/technical/commit-messages.js',
  './content/technical/readme-sections.js',
  './content/technical/technical-decisions.js',
  './content/technical/technical-updates.js',
  './content/reading/index.js',
  './content/reading/api-change.js',
  './content/reading/client-brief.js',
  './content/reading/job-post.js',
  './content/reading/meeting-notes.js',
  './content/reading/status-report.js',
  './content/writing/index.js',
  './content/writing/emails.js',
  './content/writing/freelance.js',
  './content/writing/freelance-start.js',
  './content/writing/linkedin.js',
  './content/writing/reading.js',
  './content/writing/technical.js',
  './content/writing/updates-and-help.js',
  './content/roleplay/index.js',
  './content/roleplay/clients-and-jobs.js',
  './content/roleplay/freelance.js',
  './content/roleplay/freelance-start.js',
  './content/roleplay/linkedin.js',
  './content/roleplay/technical.js',
  './content/roleplay/workplace.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Pages: try the network first, so an online visit gets the newest page.
  // With no network, open the cached app shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('./index.html')),
    );
    return;
  }

  // Files: use the cache first (fast and offline), and update it in the background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const fromNetwork = fetch(request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached ?? new Response('Offline and not cached.', { status: 503 }));
      return cached ?? fromNetwork;
    }),
  );
});
