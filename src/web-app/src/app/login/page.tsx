import Login from "@/app/login/Login";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Přihlášení",
};

/**
 * Page for logging in.
 */
export default function LoginPage() {
    return (
        <main className="vh-100 d-flex align-items-center justify-content-center">
            <div
                style={{
                    backgroundColor: "#ecf0f3",
                    borderRadius: "15px",
                    boxShadow: "13px 13px 20px #cbced1, -13px -13px 20px #fff",
                    padding: "40px 30px 30px 30px",
                }}
            >
                <h1 className="text-center">Přihlášení</h1>
                <Login />
            </div>
        </main>
    );
}
