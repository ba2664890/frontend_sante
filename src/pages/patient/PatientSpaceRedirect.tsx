import React, { useEffect } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner.tsx';
import { patientSpaceService } from '../../services/patientSpaceService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';

const PatientSpaceRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery(
    ['patient-space-resolve', user?.id],
    () => patientSpaceService.resolve(),
    { enabled: !!user }
  );

  useEffect(() => {
    if (data?.path) {
      navigate(data.path, { replace: true });
    }
    if (isError) {
      navigate('/patient/no-record', { replace: true });
    }
  }, [data, isError, navigate]);

  if (isLoading || !user) {
    return <LoadingSpinner fullPage size="xl" message="Ouverture de votre espace dedie..." />;
  }

  return <LoadingSpinner fullPage size="xl" message="Redirection en cours..." />;
};

export default PatientSpaceRedirect;
