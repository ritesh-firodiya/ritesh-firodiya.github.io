BABUL_SHELL.define("funnel-stage", `
<template><li class="funnel-head"><p class="funnel-n {wait?text-warn}">{n}</p><div><p class="text-xs font-semibold text-ink">{label}</p><p class="text-2xs text-ink-3">{what}</p><p data-if="share" class="mt-1 font-mono text-2xs {slow?text-warn:text-ink-3}">{share}</p></div></li></template>
`);
