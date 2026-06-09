import BrandPanel from "./BrandPanel";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(180deg, #FFF2DF 0%, #8C6E63 100%)",
      }}
    >
      {/* Floating card with neumorphic shadow */}
      <div
        className="flex w-full max-w-3xl min-h-[520px] rounded-2xl overflow-hidden"
        style={{ boxShadow: "var(--shadow-neumorphic)" }}
      >
        {/* Left — brand panel */}
        <div className="w-1/2">
          <BrandPanel />
        </div>

        {/* Right — login form */}
        <div className="w-1/2">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
