import React from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminAplicaciones } from '../components/admin/AdminAplicaciones';

export const AdminPage = () => {
  return (
    <ProtectedRoute>
        <AdminAplicaciones/>
    </ProtectedRoute>
  )
}
