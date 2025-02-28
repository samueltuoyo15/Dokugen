import { Button } from "@/components/ui/button";
import { Rocket, Download, Code } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold mb-4">
            Dokugen
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Automatically generate high-quality READMEs for your projects.
          </p>
          <div className="flex justify-center gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="mr-2" />
              Download CLI
            </Button>
            <Button variant="outline" className="text-white border-white">
              <Code className="mr-2" />
              View Docs
            </Button>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16"
        >
          <h2 className="text-4xl font-bold mb-8">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <Rocket className="w-12 h-12 mb-4 text-blue-500" />
              <h3 className="text-xl font-bold mb-2">Modern READMEs</h3>
              <p className="text-gray-300">
                Generate READMEs with emojis, badges, and modern formatting.
              </p>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}