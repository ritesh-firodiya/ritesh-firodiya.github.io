/* A component's board: the first variant property across, states down. A state
 * not made gets a marked empty cell, not a gap: the state nobody drew is the
 * one that ships as a grey box.                                              */
(function () {
  var S = window.BABUL_SHELL, M;
  if (!S) return;

  S.onBuild = function () {
    M = window.BABUL_MODEL;
    var id = document.body.dataset.component;
    var c = M.components.filter(function (x) { return x.id === id; })[0];
    var cells = S.canvas.querySelector(".cells");
    if (!c || !cells) return;

    var prop = (c.properties || []).filter(function (p) { return p.kind === "variant"; })[0];
    var key = prop ? prop.name.toLowerCase().replace(/\s+/g, "-") : null;
    var variants = prop ? prop.options : ["default"];
    var states = c.states || [{ name: "default", status: "made" }];
    var drawn = [].slice.call(cells.children);
    var find = function (v, s) {
      return drawn.filter(function (n) {
        var p = n.instanceProps || {};
        return (key ? p[key] === v : true) && p.state === s;
      });
    };

    var wrap = S.el("div", "board-wrap");
    var head = S.el("div", "board-head");
    head.appendChild(S.el("b", null, c.name));
    head.appendChild(S.el("span", null, variants.length + " variants · " + states.length + " states"));
    wrap.appendChild(head);

    var board = S.el("div", "board");
    board.style.gridTemplateColumns = "auto repeat(" + variants.length + ", auto)";
    board.appendChild(S.el("span"));
    variants.forEach(function (v) { board.appendChild(S.el("span", "board-col", v)); });
    states.forEach(function (s) {
      board.appendChild(S.el("span", "board-row", s.name));
      variants.forEach(function (v) {
        var found = find(v, s.name);
        if (found.length) {
          var cell = S.el("div", "board-cell");
          found.forEach(function (n) { cell.appendChild(n); });
          board.appendChild(cell);
          return;
        }
        board.appendChild(S.el("span", "board-cell board-cell--absent", s.status === "made" ? "missing" : s.status));
      });
    });
    wrap.appendChild(board);
    cells.replaceWith(wrap);
  };
})();
