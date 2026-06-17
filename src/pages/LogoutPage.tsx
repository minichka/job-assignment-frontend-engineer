import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { logout } from "features/auth/authSlice";
import { useAppDispatch } from "store";

export default function Logout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(logout());
    navigate("/", { replace: true });
  }, [dispatch, navigate]);

  return (
    <div className="container page">
      <p className="text-xs-center">You have been logged out.</p>
    </div>
  );
}
