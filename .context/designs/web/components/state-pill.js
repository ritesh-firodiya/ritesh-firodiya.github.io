BABUL_SHELL.define("state-pill", `
<template><span class="state state--live"><slot></slot></span></template>
<template variant="test"><span class="state state--test"><slot></slot></span></template>
<template variant="build"><span class="state state--build"><slot></slot></span></template>
<template variant="draft"><span class="state state--draft"><slot></slot></span></template>
`);
