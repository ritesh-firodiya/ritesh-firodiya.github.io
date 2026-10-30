/* A design set's one link to its shell, which lives in canon. `canon ui` serves
 * the installed canon's; anywhere else this loads the published one. */
(function () {
  var SHELL = "https://cdn.jsdelivr.net/npm/@freetesh/canon@0.20.0/shell/";
  var me = document.currentScript, view = me.getAttribute("data-view");
  document.write('<script src="' + SHELL + 'boot.js" data-root="' + me.src.replace(/shell\.js(\?.*)?$/, "") + '"' +
    (view ? ' data-view="' + view + '"' : "") + "></" + "script>");
})();
