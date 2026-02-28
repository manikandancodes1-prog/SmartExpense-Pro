import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify'; // Toast notification-க்காக

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Backend URL for authentication
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                email,
                password
            });
            
            // Saving the token in localStorage
            localStorage.setItem('token', response.data.token);
            
            toast.success("Login Successful! Redirecting...");
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
            
        } catch (error) {
            toast.error("Login Failed: Please check your credentials.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white">SmartExpense <span className="text-blue-500">Pro</span></h2>
                    <p className="mt-2 text-slate-400">Manage and track your expenses professionally</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700 focus-within:border-blue-500 transition-all">
                        <Mail className="text-slate-400" size={20} />
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            className="w-full bg-transparent outline-none text-white"
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700 focus-within:border-blue-500 transition-all">
                        <Lock className="text-slate-400" size={20} />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            className="w-full bg-transparent outline-none text-white"
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="flex items-center justify-center gap-2 w-full p-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
                        Login <LogIn size={20} />
                    </button>
                </form>
                
                <p className="text-center text-sm text-slate-500">
                    Don't have an account? <span className="text-blue-500 cursor-pointer hover:underline">Register</span>
                </p>
            </div>
        </div>
    );
};

export default Login;