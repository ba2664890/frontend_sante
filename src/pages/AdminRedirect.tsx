import { useEffect } from "react";

const AdminRedirect = () => {
  useEffect(() => {
    window.location.href = "https://backendsante-production.up.railway.app/admin";
  }, []);

  return <div className="text-center mt-20 text-lg">Redirection vers l'admin Django...</div>;
};

export default AdminRedirect;
