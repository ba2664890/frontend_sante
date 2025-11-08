import { useEffect } from "react";

const AdminRedirect = () => {
  useEffect(() => {
    window.location.href = "http://localhost:8000/admin/";
  }, []);

  return <div className="text-center mt-20 text-lg">Redirection vers l'admin Django...</div>;
};

export default AdminRedirect;
