import React from 'react';

const Login = ({ setUser }) => {
    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/auth/google`;
    };

    const handleMobileLogin = (e) => {
        e.preventDefault();
        // Simulating backend login return
        setUser({ user_id: 9, name: "Demo User" });
    };

    return (
        <div className="bms-login-page">
            <div className="bms-login-card">

                {/* Brand */}
                <div className="bms-login-logo">
                    Book<span>My</span>Show
                </div>
                <p style={{ fontSize: 11, color: '#cc0000', fontWeight: 600, letterSpacing: 2, marginBottom: 16 }}>
                    MTBC — MOVIE TICKET BOOKING CONSOLE
                </p>
                <p className="bms-login-tagline">
                    Your one-stop destination for movie tickets.<br />
                    Book, manage and cancel seamlessly.
                </p>

                <div className="bms-divider"><span>SIGN IN TO CONTINUE</span></div>

                <form style={{ textAlign: 'left', marginBottom: 24, width: '100%' }} onSubmit={handleMobileLogin}>
                    <label style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Mobile Number or Email
                    </label>
                    <input 
                        type="text" 
                        placeholder="Enter your mobile number or email" 
                        style={{ 
                            width: '100%', 
                            padding: '12px 14px', 
                            marginTop: 8, 
                            borderRadius: 6, 
                            border: '1px solid #ccc', 
                            fontSize: 14,
                            fontFamily: 'Poppins, sans-serif'
                        }}
                    />
                    <button 
                        type="submit" 
                        className="bms-google-btn" 
                        style={{ background: '#cc0000', color: '#fff', border: 'none', fontWeight: 600, marginTop: 16 }}
                    >
                        Continue
                    </button>
                </form>

                <div className="bms-divider"><span>OR</span></div>

                <button
                    id="google-login-btn"
                    onClick={handleGoogleLogin}
                    className="bms-google-btn"
                >
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        style={{ width: 20, height: 20 }}
                        alt="Google"
                    />
                    Continue with Google
                </button>

                <p style={{ marginTop: 24, fontSize: 11, color: '#ccc', lineHeight: 1.8 }}>
                    By signing in, you agree to our{' '}
                    <span style={{ color: '#cc0000' }}>Terms &amp; Conditions</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
