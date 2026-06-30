import BrandPanel from "./BrandPanel";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "radial-gradient(ellipse at center, #1a0e08 0%, #0d0700 100%)",
      }}
    >
      {/* Floating card */}
      <div
        className="flex flex-col md:flex-row w-full max-w-4xl min-h-[520px] rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 25px 60px -12px rgba(0,0,0,0.7)" }}
      >
        {/* Left — brand panel */}
        <div className="w-full md:w-[45%]">
          <BrandPanel />
        </div>

        {/* Right — login form */}
        <div className="w-full md:w-[55%]">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
