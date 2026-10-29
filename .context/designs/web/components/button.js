BABUL_SHELL.define("button", `
<template><a class="btn btn-primary"><i data-if="icon" data-lucide="{icon}" class="h-4 w-4"></i> <slot></slot> <i data-if="icon-end" data-lucide="{icon-end}" class="h-4 w-4"></i></a></template>
<template variant="quiet"><a class="btn btn-quiet"><i data-if="icon" data-lucide="{icon}" class="h-4 w-4"></i> <slot></slot> <i data-if="icon-end" data-lucide="{icon-end}" class="h-4 w-4"></i></a></template>
<template variant="quiet" state="disabled"><button type="button" class="btn btn-quiet" disabled><i data-if="icon" data-lucide="{icon}" class="h-4 w-4"></i> <slot></slot></button></template>
`);
