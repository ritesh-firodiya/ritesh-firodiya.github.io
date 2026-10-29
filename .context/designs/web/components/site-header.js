BABUL_SHELL.define("site-header", `
<template><header class="site-head">
  <div class="wrap flex items-center gap-3 py-2 md:gap-6">
    <a href="../home/home.html" class="flex shrink-0 items-center gap-2 text-base font-bold" aria-label="Ritesh Firodiya, home">
      <img src="../../../../public/me.webp" alt="" class="h-7 w-7 rounded-full object-cover" />
      <span class="hidden md:inline">Ritesh Firodiya</span>
    </a>
    <nav class="ml-auto flex items-center gap-4 md:gap-6" aria-label="Main">
      <a href="../home/home.html#work" class="nav-link {on=work?nav-link--on}">Work</a>
      <a href="../work/canon.html" class="nav-link {on=canon?nav-link--on}">canon</a>
      <a href="../resume/resume.html" class="nav-link {on=resume?nav-link--on}">Résumé</a>
    </nav>
    <button type="button" class="grid h-9 w-9 shrink-0 place-items-center rounded-pill border border-line text-ink-2" title="Switch theme" aria-label="Switch theme"><i data-lucide="sun-moon" class="h-4 w-4"></i></button>
    <a href="mailto:firodiya.ritesh@gmail.com" class="btn btn-quiet hidden sm:inline-flex" aria-label="Email firodiya.ritesh@gmail.com"><i data-lucide="mail" class="h-4 w-4"></i> Email</a>
  </div>
</header></template>
`);
