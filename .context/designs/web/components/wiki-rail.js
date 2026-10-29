BABUL_SHELL.define("wiki-rail", `
<template><aside class="order-last lg:sticky lg:top-20 lg:order-first lg:self-start">
  <p class="eyebrow">Project</p>
  <div class="card mt-2 flex items-center justify-between gap-3 px-4 py-3">
    <span class="flex items-center gap-3 font-semibold"><img src="../../../../../../products/charades/.context/designs/assets/icon.svg" alt="" class="h-7 w-7 rounded-sm" /> Charades</span>
    <i data-lucide="chevrons-up-down" class="h-4 w-4 text-ink-3"></i>
  </div>
  <p class="eyebrow mt-7">Page types</p>
  <nav class="mt-2 flex flex-col text-base" aria-label="Page types">
    <c-rail-link label="All pages" n="20" current="{on=all?yes:no}"></c-rail-link>
    <c-rail-link label="Concepts" n="2" current="no"></c-rail-link>
    <c-rail-link label="Entities" n="1" current="no"></c-rail-link>
    <c-rail-link label="Surfaces" n="15" current="{on=surfaces?yes:no}"></c-rail-link>
    <c-rail-link label="Decisions" n="2" current="no"></c-rail-link>
  </nav>
  <c-button variant="quiet" href="#" icon="workflow" class="mt-7 w-full">Open the design set</c-button>
</aside></template>
`);
