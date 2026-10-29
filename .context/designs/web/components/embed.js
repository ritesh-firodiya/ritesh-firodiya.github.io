BABUL_SHELL.define("embed", `
<template><div class="embed"><iframe src="{src}" title="{title}" loading="lazy" tabindex="-1"></iframe></div></template>
<template variant="fill"><div class="embed embed--fill"><iframe src="{src}" title="{title}" loading="lazy" tabindex="-1"></iframe></div></template>
<template variant="phone"><div class="embed embed--phone"><iframe src="{src}" title="{title}" loading="lazy" tabindex="-1"></iframe></div></template>
`);
