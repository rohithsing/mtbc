import React from 'react';

const Login = () => {
    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/auth/google`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="glass max-w-md w-full rounded-2xl p-8 text-center">
                <h1 className="text-3xl font-bold text-book-brand mb-2">MTBC Console</h1>
                <p className="text-gray-600 mb-8">Access your movie tickets seamlessly</p>

                <button 
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-xl transition shadow-sm"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                  Continue with Google
                </button>
            </div>
        </div>
    );
};

export default Login;
