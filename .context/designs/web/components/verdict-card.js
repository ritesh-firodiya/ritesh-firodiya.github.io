BABUL_SHELL.define("verdict-card", `
<template><article class="glass p-4">
  <p class="ask">{ask}</p>
  <p class="mt-4"><span class="verdict verdict--push">PUSH BACK</span></p>
  <ul class="mt-3 grid gap-1.5 text-sm text-ink-2"><slot></slot></ul>
  <p class="mono mt-3 text-2xs text-ink-3">{sources}</p>
</article></template>
`);
