import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-lg",
          }
        }}
      />
      <div className="max-w-md p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <h3 className="font-semibold mb-2">🔒 密码安全要求：</h3>
        <ul className="space-y-1 text-gray-700">
          <li>• 至少 12 个字符</li>
          <li>• 包含大写字母 (A-Z)</li>
          <li>• 包含小写字母 (a-z)</li>
          <li>• 包含数字 (0-9)</li>
          <li>• 包含特殊字符 (!@#$%^&*)</li>
        </ul>
      </div>
    </div>
  );
}
