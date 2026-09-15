import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import supabase from '../services/supabaseClient';

const SupabaseTest = () => {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    setTestResult('Testing...');
    
    try {
      console.log('🧪 Starting Supabase test...');
      const startTime = Date.now();
      
      // Test 1: Simple count query
      console.log('📊 Test 1: Count query');
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        throw new Error(`Count query failed: ${countError.message}`);
      }
      
      console.log('✅ Count query success:', count);
      
      // Test 2: Select specific user
      console.log('📊 Test 2: Select specific user');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', 'adcb679c-130d-4604-8c84-484b8a93ff6e')
        .maybeSingle();
      
      if (userError) {
        throw new Error(`User query failed: ${userError.message}`);
      }
      
      console.log('✅ User query success:', userData);
      
      // Test 3: Check auth status
      console.log('📊 Test 3: Auth status');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error(`Auth check failed: ${authError.message}`);
      }
      
      console.log('✅ Auth check success:', user?.id);
      
      const endTime = Date.now();
      const result = `✅ All tests passed in ${endTime - startTime}ms
      
Count: ${count} users
User found: ${userData ? 'Yes' : 'No'}
Auth user: ${user?.id || 'None'}`;
      
      setTestResult(result);
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      setTestResult(`❌ Test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Connection Test</Text>
      
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={runTest}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Run Test'}
        </Text>
      </TouchableOpacity>
      
      {testResult ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{testResult}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    maxHeight: 300,
  },
  resultText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
});

export default SupabaseTest;
