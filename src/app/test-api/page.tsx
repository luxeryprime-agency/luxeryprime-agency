"use client";

import { useState } from 'react';

export default function TestAPIPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const API_URL = '/api/gas';

  const addResult = (testName: string, success: boolean, data: any, error?: string) => {
    const result = {
      test: testName,
      success: success,
      data: data,
      error: error,
      timestamp: new Date().toLocaleString()
    };
    setResults(prev => [...prev, result]);
  };

  const makeRequest = async (endpoint: string, method: string = 'GET', data?: any) => {
    try {
      const url = `${API_URL}${endpoint}`;
      console.log(`🔍 ${method} ${url}`);
      
      const options: RequestInit = {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (data) {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(url, options);
      const responseData = await response.json();
      
      return {
        success: true,
        data: responseData
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  };

  const testHealthCheck = async () => {
    setLoading(true);
    const result = await makeRequest('?action=health');
    addResult('Health Check', result.success, result.data, result.error);
    setLoading(false);
  };

  const testGetAgencies = async () => {
    setLoading(true);
    const result = await makeRequest('?action=getAgencies');
    addResult('Get Agencies', result.success, result.data, result.error);
    setLoading(false);
  };

  const testGetStreamers = async () => {
    setLoading(true);
    const result = await makeRequest('?action=getStreamers');
    addResult('Get Streamers', result.success, result.data, result.error);
    setLoading(false);
  };

  const testGetCommissions = async () => {
    setLoading(true);
    const result = await makeRequest('?action=getCommissions');
    addResult('Get Commissions', result.success, result.data, result.error);
    setLoading(false);
  };

  const testUpdateStreamer = async () => {
    setLoading(true);
    const updateData = {
      streamerId: 'STR001',
      data: {
        name: 'Juan Pérez Actualizado',
        level: 2,
        commission: 0.20
      }
    };
    
    const result = await makeRequest('?action=updateStreamer', 'POST', updateData);
    addResult('Update Streamer', result.success, result.data, result.error);
    setLoading(false);
  };

  const runAllTests = async () => {
    setResults([]);
    setLoading(true);
    
    const tests = [
      { name: 'Health Check', fn: testHealthCheck },
      { name: 'Get Agencies', fn: testGetAgencies },
      { name: 'Get Streamers', fn: testGetStreamers },
      { name: 'Get Commissions', fn: testGetCommissions },
      { name: 'Update Streamer', fn: testUpdateStreamer }
    ];
    
    for (const test of tests) {
      await test.fn();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa de 1 segundo
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  const successful = results.filter(r => r.success).length;
  const total = results.length;
  const percentage = total > 0 ? ((successful / total) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">🧪 Prueba de API Híbrida</h1>
          <p className="text-xl mb-2">Luxery Prime Agency - Sistema de Gestión de Streamers</p>
          <p className="text-lg opacity-90">Google Apps Script + Firestore + Next.js</p>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">🚀 Pruebas de la API</h2>
          <p className="text-gray-600 mb-6">Haz clic en los botones para probar cada endpoint de la API:</p>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={testHealthCheck}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              🏥 Health Check
            </button>
            <button 
              onClick={testGetAgencies}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              🏢 Get Agencies
            </button>
            <button 
              onClick={testGetStreamers}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              👥 Get Streamers
            </button>
            <button 
              onClick={testGetCommissions}
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              💰 Get Commissions
            </button>
            <button 
              onClick={testUpdateStreamer}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              ✏️ Update Streamer
            </button>
            <button 
              onClick={runAllTests}
              disabled={loading}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              🔄 Ejecutar Todas las Pruebas
            </button>
            <button 
              onClick={clearResults}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              🗑️ Limpiar Resultados
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">📊 Resultados de las Pruebas</h2>
          {results.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay resultados aún. Ejecuta algunas pruebas para ver los resultados.</p>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  result.success 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-red-50 border-red-500'
                }`}>
                  <h3 className="text-lg font-semibold mb-2">
                    {result.success ? '✅' : '❌'} {result.test}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Timestamp:</strong> {result.timestamp}
                  </p>
                  {result.success ? (
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-red-600">
                      <strong>Error:</strong> {result.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {results.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">📈 Resumen de Pruebas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{total}</p>
                <p className="text-gray-600">Total de pruebas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{successful}</p>
                <p className="text-gray-600">Exitosas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{total - successful}</p>
                <p className="text-gray-600">Fallidas</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{percentage}%</p>
              <p className="text-gray-600">Porcentaje de éxito</p>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {results.map((r, index) => (
                <span key={index} className={`px-3 py-1 rounded-full text-sm ${
                  r.success 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {r.success ? '✅' : '❌'} {r.test}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium">Ejecutando pruebas...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
