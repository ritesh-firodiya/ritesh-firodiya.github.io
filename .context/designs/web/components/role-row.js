BABUL_SHELL.define("role-row", `
<template><li class="grid gap-x-6 gap-y-1 border-t border-line py-3.5 lg:grid-cols-[11rem_1fr]">
  <p class="mono pt-0.5 text-xs text-ink-3">{dates}</p>
  <div>
    <h2 class="text-body font-bold">{role} <span class="font-semibold text-brand-500">· {company}</span></h2>
    <p class="mt-1 max-w-[90ch] text-base text-ink-2">{summary}</p>
    <div class="mt-2"><p class="flex flex-wrap gap-1.5"><slot></slot></p></div>
  </div>
</li></template>
`);
