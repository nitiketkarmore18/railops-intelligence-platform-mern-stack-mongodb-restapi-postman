import { useState } from "react";
import toast from "react-hot-toast";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const loadingToast = toast.loading("Authenticating...");

    setTimeout(() => {
      if (username === "admin" && password === "1234") {
        sessionStorage.setItem("isLoggedIn", "true");

        toast.dismiss(loadingToast);
        toast.success("Login Successful");

        window.location.href = "/";
      } else {
        toast.dismiss(loadingToast);
        toast.error("Invalid Credentials");
      }
    }, 1000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/train.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 w-full max-w-2xl mr-[700px] grid grid-cols-1 md:grid-cols-2 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="hidden md:flex flex-col justify-center p-10 text-white">
          <h1 className="text-5xl font-bold leading-tight mb-4">
            🚆 RailOps Intelligence Platform
          </h1>

          <p className="text-lg text-gray-200">
            Enterprise Rail Wagon Management, Maintenance & Predictive Analytics System          </p>
        </div>

        <div className="bg-gray-950/90 p-10 text-white">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <h2 className="text-3xl font-bold text-center">
                Admin Login 🔐
              </h2>

              <p className="text-gray-400 text-sm text-center mt-2">
                Secure access to railway operations dashboard
              </p>
            </div>

            <input
              className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="password"
              className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-xl font-semibold shadow-lg">
              Login
            </button>

            <p className="text-sm text-gray-400 text-center">
              Use admin / 1234
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;