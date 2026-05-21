import Script from "next/script";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function GoogleSignIn() {
    const { login } = useAuth();
    const router = useRouter();
    const [, setError] = useState(null); // lupa w, malah define type ala typescript

    const handleCredentialResponse = async (response) => {
        fetch("http://localhost:5000/api/auth/user/google", {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                credential: response.credential,
            })
        })
            .then(async response => {
                if (response.ok) {
                    const data = await response.json()
                    return data;
                }
            })
            .then(data => { 
                console.log(data.message);
                login(data.token);
                router.push("/");
             })
            .catch(err => {
                console.error("Detail Error:", err);
                setError(() => {
                    throw err;
                })
            });
    }

    const initializeGoogleSignIn = () => {
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: handleCredentialResponse,
            });
            
            render();
        }
    };

    useEffect(() => {
        window.addEventListener('resize', render);
        return () => window.removeEventListener('resize', render);
    }, [300]); 

    const render = () => {
        const container = document.getElementById('google-button-container');
        const parentWidth = container ? container.offsetWidth : 324;

        window.google.accounts.id.renderButton(
            document.getElementById('sign-in-with-google'), 
            { 
                type: "standard",
                size: "large", 
                theme: "outline", 
                text: "sign_in_with", 
                shape: "pill",
                logo_alignment: "center",
                locale: "id",
                width: Math.min(parentWidth, 400) // 3. Inject the dynamic width here
            }
        );
    }

    return (
        // default mode popup (data-ux-mode="popup")
        <div className="flex items-center justify-center py-2.5 md:py-3 lg:py-4 text-base md:text-lg lg:text-2xl" id="google-button-container">
            <Script src="https://accounts.google.com/gsi/client" 
                    strategy="afterInteractive"
                    onReady={initializeGoogleSignIn}
            />
                {/* <script src="https://accounts.google.com/gsi/client" async></script> */}
            <div id="sign-in-with-google"></div>
        </div>
    );
}