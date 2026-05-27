import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import prettier from "eslint-config-prettier"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "warn",
      "react-hooks/incompatible-library": "off",
      "@typescript-eslint/no-unused-vars": ["warn", {
        "varsIgnorePattern": "^_",
        "argsIgnorePattern": "^_",
        "destructuredArrayIgnorePattern": "^_",
      }],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/types/database.types.ts",
  ]),
])

export default eslintConfig