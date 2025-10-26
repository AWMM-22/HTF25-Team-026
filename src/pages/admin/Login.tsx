import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect directly to BMC dashboard
    navigate('/admin/dashboard');
  }, [navigate]);

  return null;
}
