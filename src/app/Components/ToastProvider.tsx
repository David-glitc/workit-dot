'use client'

import React, { createContext, useContext, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

type ToastContextType = {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; isVisible: boolean }>({
    message: '',
    isVisible: false,
  })

  const showToast = (message: string) => {
    setToast({ message, isVisible: true })
    setTimeout(() => setToast({ message: '', isVisible: false }), 3000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {toast.isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed z-[1000] top-10 right-4 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-lg border border-pink-200 dark:border-pink-800"
          >
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-pink-500 dark:text-pink-400" />
              <span className="text-gray-800 dark:text-gray-200">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  )
}
