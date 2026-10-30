/* A design set's one link to its shell. The set holds this file, pointed at the
 * published shell, so a page opens from disk. `canon ui` serves it pointed at its
 * own shell, and a site that publishes sets writes it pointed at the one it hosts. */
(function () {
  var SHELL = "https://unpkg.com/@freetesh/canon@0/shell/";
  var me = document.currentScript, view = me.getAttribute("data-view");
  document.write('<script src="' + SHELL + 'boot.js" data-root="' + me.src.replace(/shell\.js(\?.*)?$/, "") + '"' +
    (view ? ' data-view="' + view + '"' : "") + "></" + "script>");
})();
