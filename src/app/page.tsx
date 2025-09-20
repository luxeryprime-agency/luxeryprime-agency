'use client'

import { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import config from '@/config'

export default function Home() {
  const [firebaseStatus, setFirebaseStatus] = useState<'loading' | 'connected' | 'error'>('loading')

  useEffect(() => {
    try {
      // Inicializar Firebase
      const app = initializeApp({
        apiKey: config.firebase.apiKey,
        authDomain: config.firebase.authDomain,
        projectId: config.firebase.projectId,
        storageBucket: config.firebase.storageBucket,
        messagingSenderId: config.firebase.messagingSenderId,
        appId: config.firebase.appId,
      })

      // Inicializar Firestore
      const db = getFirestore(app)
      
      setFirebaseStatus('connected')
      console.log('✅ Firebase conectado correctamente')
    } catch (error) {
      console.error('❌ Error conectando Firebase:', error)
      setFirebaseStatus('error')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Luxery Prime Agency
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema de gestión para agencia de streamers
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Estado del Sistema
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Firebase:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  firebaseStatus === 'connected' 
                    ? 'bg-green-100 text-green-800' 
                    : firebaseStatus === 'loading'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {firebaseStatus === 'connected' && '✅ Conectado'}
                  {firebaseStatus === 'loading' && '⏳ Conectando...'}
                  {firebaseStatus === 'error' && '❌ Error'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Next.js:</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  ✅ Funcionando
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">TypeScript:</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  ✅ Configurado
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>Workspace configurado exitosamente</p>
            <p>Firebase Project: {config.firebase.projectId}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
