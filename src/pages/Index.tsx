
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { openProjectAPI } from '@/lib/api';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // If authenticated, redirect to dashboard, otherwise to login
    if (openProjectAPI.isAuthenticated()) {
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return null; // No necesitamos renderizar nada ya que redirigimos
}
