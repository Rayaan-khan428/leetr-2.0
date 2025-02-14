"use client";

import { motion } from "framer-motion";
import { IconPencil } from "@tabler/icons-react";

export default function BlogPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center px-4"
      >
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-accent rounded-full">
            <IconPencil className="w-8 h-8 text-accent-foreground" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          Blog Coming Soon
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
          We're working on creating valuable content to help you ace your technical interviews. Stay tuned!
        </p>

        <div className="inline-flex items-center text-sm text-muted-foreground">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          In Development
        </div>
      </motion.div>
    </div>
  );
} 