BABUL_SHELL.define("card", `
<template><a class="glass overflow-hidden">
  <slot name="picture"></slot>
  <div class="p-4"><div class="flex items-center justify-between gap-2"><h3 class="text-body font-bold">{name}</h3><slot name="state"></slot></div><p class="mt-1 text-sm text-ink-2">{tagline}</p></div>
</a></template>
`);
