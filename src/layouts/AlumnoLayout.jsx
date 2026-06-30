import { useState, useEffect } from 'react';
import RoleLayoutShell from './RoleLayoutShell';
import { useAuth } from '../hooks/useAuth';
import ForcePasswordChangeModal from '../components/ui/ForcePasswordChangeModal';

export default function AlumnoLayout({ user }) {
  const { profile } = useAuth();
  const [showForcePasswordModal, setShowForcePasswordModal] = useState(false);

  useEffect(() => {
    // Firebase Auth initializes accounts without a displayName.
    // If the account was created with an auto-generated password AND hasn't set a displayName yet, show the modal.
    if (profile && profile.password && !user?.displayName) {
      setShowForcePasswordModal(true);
    } else {
      setShowForcePasswordModal(false);
    }
  }, [profile, user?.displayName]);

  const menuItems = [
    { path: '/alumno', label: 'Mis Modulos', exact: true },
    { path: '/alumno/notas', label: 'Mis Notas' }
  ];

  return (
    <>
      <RoleLayoutShell
        user={user}
        menuItems={menuItems}
        roleLabel="Alumno"
        brandLabel="Student"
      />
      {showForcePasswordModal && (
        <ForcePasswordChangeModal 
          user={user} 
          profile={profile} 
          onSuccess={() => setShowForcePasswordModal(false)} 
        />
      )}
    </>
  );
}
