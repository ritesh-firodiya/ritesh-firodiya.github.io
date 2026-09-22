// Shared chrome for Chitragupt mobile wireframes
// Loaded by each variant; injects status bar, top bar, tab bar, and demo nav.
// Conventions:
//   data-chrome-top  = "level1" | "level2"  (level1 = avatar/notif, level2 = back/title/action)
//   data-chrome-tab  = "inbox" | "tax" | "home" | "expense" | "portfolio" | "none"
//   data-chrome-title = page title
//   data-chrome-rel  = depth — "" if in /app/, "../" if in /app/inbox|tax|expense|portfolio|settings/
//   data-chrome-routes = pipe-separated label|href pairs for the super-header

(function () {
  const root = document.querySelector("[data-chrome]");
  if (!root) return;

  const rel = root.dataset.chromeRel || "";
  const title = root.dataset.chromeTitle || "Chitragupt";
  const tab = root.dataset.chromeTab || "home";
  const topType = root.dataset.chromeTop || "level1";
  const indexRel = rel + "../index.html";

  // Super-header
  const routes = (root.dataset.chromeRoutes || "")
    .split(";")
    .filter(Boolean)
    .map((p) => {
      const [label, href, active] = p.split("|");
      return { label, href, active: active === "1" };
    });
  const sectionLabel = root.dataset.chromeSection || "";
  const superHeader = `
    <div class="border-b border-dashed border-zinc-800 bg-zinc-900/30 px-5 py-2">
      <div class="mx-auto flex max-w-4xl flex-wrap items-center gap-1.5 text-[11px]">
        <span class="mr-1 text-[10px] uppercase tracking-widest text-zinc-500">Mobile · ${sectionLabel} ›</span>
        ${routes
          .map((r) =>
            r.active
              ? `<a href="${r.href}" class="rounded border border-emerald-500/50 bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-200">${r.label}</a>`
              : `<a href="${r.href}" class="rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-zinc-300">${r.label}</a>`
          )
          .join("")}
        <a href="${indexRel}" class="ml-auto rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-zinc-300">← All</a>
      </div>
    </div>`;

  // Status bar
  const statusBar = `
    <div class="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] text-zinc-300">
      <span class="mono">9:41</span>
      <div class="flex items-center gap-1.5">
        <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor"><rect x="0" y="6" width="2" height="4"/><rect x="3.5" y="4" width="2" height="6"/><rect x="7" y="2" width="2" height="8"/><rect x="10.5" y="0" width="2" height="10"/></svg>
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 4a8 8 0 0 1 12 0M3 6a5 5 0 0 1 8 0M6 8.5l1 1 1-1"/></svg>
        <svg width="22" height="11" viewBox="0 0 22 11" fill="none" stroke="currentColor" stroke-width="1"><rect x="0.5" y="0.5" width="18" height="10" rx="2"/><rect x="19.5" y="3.5" width="2" height="4" rx="0.5" fill="currentColor"/><rect x="2" y="2" width="13" height="7" rx="1" fill="currentColor"/></svg>
      </div>
    </div>`;

  // Top bar
  const initials = root.dataset.chromeInitials || "AS";
  const initialsTint = root.dataset.chromeInitialsTint || "zinc";
  const initialsCls =
    {
      zinc: "border-zinc-800 bg-zinc-900 text-zinc-200",
      emerald: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200",
      blue: "border-blue-500/40 bg-blue-500/15 text-blue-200",
      purple: "border-purple-500/40 bg-purple-500/15 text-purple-200",
    }[initialsTint] || "border-zinc-800 bg-zinc-900 text-zinc-200";
  const backHref = root.dataset.chromeBack || "#";
  const rightAction = root.dataset.chromeRightAction || "";
  const notifBadge =
    root.dataset.chromeNotifBadge !== "0" &&
    root.dataset.chromeNotifBadge !== undefined
      ? root.dataset.chromeNotifBadge
      : "";

  // data-chrome-chat-badge="N" shows chat-bubble icon with unread count next to bell
  // Set it on any screen where the user has an active CA engagement
  const chatBadge =
    root.dataset.chromeChatBadge !== undefined &&
    root.dataset.chromeChatBadge !== "0"
      ? root.dataset.chromeChatBadge
      : "";

  const chatBtn = chatBadge
    ? `<a href="${rel}tax/tax-with-ca-chat.html" aria-label="CA chat" class="relative inline-flex h-10 w-10 items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="absolute top-1 right-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-amber-500 px-1 text-[8px] font-semibold text-zinc-950">${chatBadge}</span>
      </a>`
    : "";

  const notifBtn = `
    <a href="${rel}notifications.html" aria-label="Notifications" class="relative inline-flex h-10 w-10 items-center justify-center">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      ${notifBadge ? `<span class="absolute top-1 right-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[8px] font-semibold text-zinc-950">${notifBadge}</span>` : ""}
    </a>`;

  const topBar =
    topType === "level2"
      ? `<div class="flex h-12 items-center justify-between px-3">
         <a href="${backHref}" aria-label="Back" class="inline-flex h-10 w-10 items-center justify-center text-zinc-400"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></a>
         <h1 class="text-sm font-semibold">${title}</h1>
         <div class="w-10 text-right">${rightAction}</div>
       </div>`
      : `<div class="flex h-12 items-center justify-between px-3">
         <a href="${rel}drawer-open.html" aria-label="Menu" class="inline-flex h-10 w-10 items-center justify-center">
           <span class="inline-flex h-9 w-9 items-center justify-center rounded-full border ${initialsCls} text-[11px] font-semibold">${initials}</span>
         </a>
         <h1 class="text-base font-semibold">${title}</h1>
         <div class="flex items-center">${chatBtn}${notifBtn}</div>
       </div>`;

  // Tab bar
  const tabs = [
    {
      key: "inbox",
      href: rel + "inbox/inbox.html",
      label: "Inbox",
      icon: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    },
    {
      key: "tax",
      href: rel + "tax/tax-review.html",
      label: "Tax",
      icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/>',
    },
    {
      key: "home",
      href: rel + "dashboard.html",
      label: "Home",
      icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    },
    {
      key: "expense",
      href: rel + "expense/expense-locked.html",
      label: "Expense",
      icon: '<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 6v2m0 8v2"/>',
    },
    {
      key: "portfolio",
      href: rel + "portfolio/portfolio-locked.html",
      label: "Portfolio",
      icon: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    },
  ];

  const tabBar = `
    <nav class="tabbar border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div class="flex items-end">
        ${tabs
          .map((t) => {
            const active = t.key === tab;
            if (t.key === "home") {
              return `<a href="${t.href}" class="flex flex-1 flex-col items-center pb-1.5">
              <span class="-mt-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/40 ring-4 ring-zinc-950">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">${t.icon}</svg>
              </span>
              <span class="mt-1 text-[10px] font-semibold ${active ? "text-emerald-300" : "text-emerald-300"}">${t.label}</span>
            </a>`;
            }
            return `<a href="${t.href}" class="flex flex-1 flex-col items-center gap-0.5 py-2.5 ${active ? "text-emerald-300" : "text-zinc-500"}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${t.icon}</svg>
            <span class="text-[10px] font-medium">${t.label}</span>
          </a>`;
          })
          .join("")}
      </div>
      <div class="flex items-center justify-center pb-2 pt-1"><div class="h-1 w-32 rounded-full bg-zinc-700"></div></div>
    </nav>`;

  // Inject
  const superSlot = document.querySelector('[data-chrome-slot="super"]');
  if (superSlot) superSlot.outerHTML = superHeader;
  const statusSlot = document.querySelector('[data-chrome-slot="status"]');
  if (statusSlot) statusSlot.outerHTML = statusBar;
  const topSlot = document.querySelector('[data-chrome-slot="top"]');
  if (topSlot) topSlot.outerHTML = topBar;
  const tabSlot = document.querySelector('[data-chrome-slot="tab"]');
  if (tabSlot && tab !== "none") tabSlot.outerHTML = tabBar;
})();
