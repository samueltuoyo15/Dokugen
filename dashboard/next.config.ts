import type { NextConfig } from "next"
import os from "os"

//const isLinuxArm64 = os.platform() === "linux" && os.arch() === "arm64"

const nextConfig: NextConfig = {
  experimental: {
    //turbo: true,
    disablePostcssPresetEnv: true,
   },
}

export default nextConfig
