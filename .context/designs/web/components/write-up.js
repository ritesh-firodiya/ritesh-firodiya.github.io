BABUL_SHELL.define("write-up", `
<template><div class="glass p-4"><h2 class="font-bold">{heading}</h2><ul class="mt-1.5 grid gap-1.5 text-sm text-ink-2"><slot></slot></ul></div></template>
<template variant="text"><div class="glass p-4"><h2 class="font-bold">{heading}</h2><p class="mt-1.5 text-sm text-ink-2"><slot></slot></p></div></template>
`);
