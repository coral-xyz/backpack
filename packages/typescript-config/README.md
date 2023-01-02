## Base configuration

> You can disable the TypeScript setup in Expo CLI with the environment variable `EXPO_NO_TYPESCRIPT_SETUP=1`

A project's **tsconfig.json** should extend the `expo/tsconfig.base` by default. This sets the following default [compiler options][tsc-compileroptions] (which can be overwritten in your project's **tsconfig.json**):

- `"allowJs"`: `true`
  - Allow JavaScript files to be compiled. If you project requires more strictness, you can disable this.
- `"esModuleInterop"`: `true`
  - Improve Babel ecosystem compatibility. This also sets `allowSyntheticDefaultImports` to `true`, allowing default imports from modules with no default export.
- [`"jsx"`][tsc-jsx]: `"react-native"`
  - Preserve JSX, and converts the `jsx` extension to `js`. This is optimized for bundlers that transform the JSX internally (like Metro).
- `"lib"`: `["DOM", "ESNext"]`
  - Allow using the latest [ECMAScript proposed features and libraries](https://github.com/tc39/proposals).
- [`"moduleResolution"`][tsc-moduleresolution]: `"node"`
  - Emulate how Metro and webpack resolve modules.
- `"noEmit"`: `true`
  - Only use the TypeScript compiler (TSC) to check the code. The Metro bundler is responsible for compiling TypeScript to JavaScript.
- `"resolveJsonModule"`: `true`
  - Enables importing **.json** files. Metro's default behavior is to allow importing json files as JS objects.
- `"skipLibCheck"`: `true`
  - Skip type checking of all declaration files (`*.d.ts`).
- `"target"`: `"ESNext"`
  - Compile to the latest version of ECMAScript.
