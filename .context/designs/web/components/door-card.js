BABUL_SHELL.define("door-card", `
<template><div class="card flex flex-col p-4"><i data-lucide="{icon}" class="h-5 w-5 text-brand-500"></i><h2 class="mt-2 text-body font-bold">{heading}</h2><p class="mt-2 text-base text-ink-2"><slot></slot></p><a href="{mail}" class="btn btn-quiet mt-4 self-start">{action}</a></div></template>
`);
