'use client';

import { motion } from 'framer-motion';

/**
 * Client-side animated dashboard content.
 */
export default function DashboardContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {/* Overview Widget Slot */}
      <div className="h-40 rounded-xl border border-border bg-card p-6 flex flex-col justify-center text-muted-foreground shadow-sm">
        Overview Widget Placeholder
      </div>
      
      {/* Recent Tasks Widget Slot */}
      <div className="h-40 rounded-xl border border-border bg-card p-6 flex flex-col justify-center text-muted-foreground shadow-sm lg:col-span-2">
        Recent Tasks Placeholder
      </div>
      
      {/* Productivity Chart Slot */}
      <div className="h-64 rounded-xl border border-border bg-card p-6 flex flex-col justify-center text-muted-foreground shadow-sm md:col-span-2 lg:col-span-3">
        Productivity Chart Placeholder
      </div>
    </motion.div>
  );
}
