'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testSupabaseConnection } from '@/lib/supabase';
import { createUserProfile, getUserProfile } from '@/lib/database';

export default function SupabaseDebug() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Not tested');
  const [testResults, setTestResults] = useState<any[]>([]);

  const testConnection = async () => {
    setConnectionStatus('Testing...');
    try {
      const isConnected = await testSupabaseConnection();
      setConnectionStatus(isConnected ? 'Connected ✅' : 'Failed ❌');
    } catch (error) {
      setConnectionStatus(`Error: ${error}`);
    }
  };

  const testCreateUser = async () => {
    try {
      const testUser = {
        id: 'test-user-' + Date.now(),
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'customer' as const
      };

      console.log('Testing user creation with:', testUser);
      const result = await createUserProfile(testUser);
      setTestResults(prev => [...prev, { action: 'Create User', result, success: true }]);
    } catch (error) {
      console.error('Test create user error:', error);
      setTestResults(prev => [...prev, { action: 'Create User', error: error instanceof Error ? error.message : String(error), success: false }]);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Supabase Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button onClick={testConnection} size="sm">Test Connection</Button>
            <span>Status: {connectionStatus}</span>
          </div>
        </div>

        <div>
          <Button onClick={testCreateUser} size="sm">Test User Creation</Button>
        </div>

        {testResults.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <div className="space-y-2">
              {testResults.map((test, index) => (
                <div key={index} className={`p-2 rounded text-xs ${test.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="font-medium">{test.action}: {test.success ? '✅' : '❌'}</div>
                  <pre className="mt-1 overflow-auto">
                    {JSON.stringify(test.result || test.error, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}