import React from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Home } from '../components/Home';

export const HomePage = () => {
  return (
    <ProtectedRoute>
        <Home/>
    </ProtectedRoute>
  )
}
