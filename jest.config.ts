import { createDefaultPreset } from "ts-jest/presets"
import type { Config } from "@jest/types"

const tsJestTransformCfg = createDefaultPreset().transform

const config: Config.InitialOptions = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  globals: {
    "ts-jest": {
      tsconfig: "./server/tsconfig.json",
    },
  },
}

export default config