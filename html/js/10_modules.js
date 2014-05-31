function require(name) {
  if (name in require.cache)
    return require.cache[name];

  var code = new Function("exports, module", readFile(name));
  var exports = {}, mod = {exports: exports};
  code(exports, mod);

  require.cache[name] = module.exports;
  return module.exports;
}
require.cache = Object.create(null);

function define(depNames, moduleFunction) {
  var deps = [], myMod = define.currentModule;

  depNames.forEach(function(name) {
    if (name in define.cache) {
      var depMod = define.cache[name];
    } else {
      var depMod = {exports: null,
                    loaded: false,
                    onLoad: []};
      define.cache[name] = depMod;
      backgroundReadFile(name, function(code) {
        define.currentModule = depMod;
        new Function("", code)();
      });
    }
    deps.push(depMod);
    if (!depMod.loaded)
      depMod.onLoad.push(whenDepsLoaded);
  });

  function whenDepsLoaded() {
    if (!deps.every(function(m) { return m.loaded; }))
      return;

    var args = deps.map(function(m) { return m.exports; });
    var exports = moduleFunction.apply(null, args);
    if (myMod) {
      myMod.exports = exports;
      myMod.loaded = true;
      myMod.onLoad.every(function(f) { f(); });
    }
  }
  whenDepsLoaded();
}
define.cache = Object.create(null);
