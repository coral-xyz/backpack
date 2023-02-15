module.exports = (path, options) => {
  // Call the defaultResolver, so we leverage its cache, error handling, etc.
  return options.defaultResolver(path, {
    ...options,
    // Use packageFilter to process parsed `package.json` before the resolution (see https://www.npmjs.com/package/resolve#resolveid-opts-cb)
    packageFilter: (pkg) => {
      if (pkg.name.startsWith("@coral-xyz")) {
        // if (!pkg["react-native"] && !pkg["main"]) {
        //   console.warn(pkg.name + " react-native and main are not defined!");
        // }
        const main = pkg["react-native"] || pkg["main"];
        return {
          ...pkg,
          main,
        };
      }

      return pkg;
    },
  });
};
