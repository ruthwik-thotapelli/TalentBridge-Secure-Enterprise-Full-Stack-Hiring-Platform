import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OAuthSuccess() {
  const { search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(search);

    const token = params.get("token");
    const name = params.get("name");
    const email = params.get("email");
    const provider = params.get("provider");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // ✅ Save token
    localStorage.setItem("token", token);

    // ✅ Save user (basic info)
    const user = {
      name: name || "",
      email: email || "",
      provider: provider || "oauth",
    };

    localStorage.setItem("currentUser", JSON.stringify(user));

    // ✅ Redirect to dashboard
    navigate("/dashboard", { replace: true });
  }, [navigate, search]);

  return null;
}
