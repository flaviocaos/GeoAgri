'use client'
import { Toaster } from 'sonner'

export default function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#1a2420',
          color: '#d4e8da',
          border: '1px solid #2d9a56',
          fontSize: '13px',
        },
      }}
    />
  )
}