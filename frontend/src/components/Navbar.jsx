import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Search, User, LogOut, PlusSquare, MessageCircle } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <header className="fixed top-0 w-full border-b border-white/10 bg-black/80 backdrop-blur-md z-50">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold text-primary-500 tracking-tight">
                    Lumina
                </Link>
                {user && (
                    <nav className="flex items-center space-x-6 text-neutral-400">
                        <Link to="/" className="hover:text-white transition-colors" title="Feed"><Home size={24} /></Link>
                        <Link to="/messages" className="hover:text-white transition-colors" title="Messages"><MessageCircle size={24} /></Link>
                        <Link to="/search" className="hover:text-white transition-colors" title="Search"><Search size={24} /></Link>
                        <Link to="/create" className="hover:text-white transition-colors" title="Create Post"><PlusSquare size={24} /></Link>
                        <Link to={`/profile`} className="hover:text-white transition-colors" title="Profile"><User size={24} /></Link>
                        <button onClick={logout} className="hover:text-red-400 transition-colors" title="Logout"><LogOut size={24} /></button>
                    </nav>
                )}
            </div>
        </header>
    );
};

export default Navbar;
