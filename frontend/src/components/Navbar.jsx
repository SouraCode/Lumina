import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Search, Compass, MessageCircle, PlusSquare, User, LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    if (!user) return null; // App layout handles unauthenticated pages anyway, but good safety.

    const isActive = (path) => location.pathname === path || (path === '/profile' && location.pathname.startsWith('/user/'));

    return (
        <>
            {/* Desktop Sidebar */}
            <nav className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-black border-r border-neutral-800 p-4 z-50">
                <Link to="/" className="text-2xl font-bold text-primary-500 tracking-tight mb-12 p-3">
                    Lumina
                </Link>
                
                <div className="flex-1 flex flex-col space-y-2">
                    <Link to="/" className={`flex items-center space-x-4 p-3 rounded-xl transition-all ${isActive('/') ? 'font-bold' : 'hover:bg-neutral-900 text-neutral-300'}`}>
                        <Home size={26} className={isActive('/') ? 'text-primary-500' : 'text-neutral-100'} />
                        <span className="text-lg">Home</span>
                    </Link>
                    <Link to="/search" className={`flex items-center space-x-4 p-3 rounded-xl transition-all ${isActive('/search') ? 'font-bold' : 'hover:bg-neutral-900 text-neutral-300'}`}>
                        <Search size={26} className={isActive('/search') ? 'text-primary-500' : 'text-neutral-100'} />
                        <span className="text-lg">Search</span>
                    </Link>
                    <Link to="/explore" className={`flex items-center space-x-4 p-3 rounded-xl transition-all ${isActive('/explore') ? 'font-bold' : 'hover:bg-neutral-900 text-neutral-300'}`}>
                        <Compass size={26} className={isActive('/explore') ? 'text-primary-500' : 'text-neutral-100'} />
                        <span className="text-lg">Explore</span>
                    </Link>
                    <Link to="/messages" className={`flex items-center space-x-4 p-3 rounded-xl transition-all ${isActive('/messages') ? 'font-bold' : 'hover:bg-neutral-900 text-neutral-300'}`}>
                        <MessageCircle size={26} className={isActive('/messages') ? 'text-primary-500' : 'text-neutral-100'} />
                        <span className="text-lg">Messages</span>
                    </Link>
                    <Link to="/create" className={`flex items-center space-x-4 p-3 rounded-xl transition-all ${isActive('/create') ? 'font-bold' : 'hover:bg-neutral-900 text-neutral-300'}`}>
                        <PlusSquare size={26} className={isActive('/create') ? 'text-primary-500' : 'text-neutral-100'} />
                        <span className="text-lg">Create</span>
                    </Link>
                    <Link to="/profile" className={`flex items-center space-x-4 p-3 rounded-xl transition-all ${isActive('/profile') ? 'font-bold' : 'hover:bg-neutral-900 text-neutral-300'}`}>
                        <div className={`w-8 h-8 rounded-full border-2 overflow-hidden flex items-center justify-center bg-neutral-800 ${isActive('/profile') ? 'border-primary-500' : 'border-transparent'}`}>
                            {user.avatar ? <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.avatar}`} className="w-full h-full object-cover"/> : <User size={18}/>}
                        </div>
                        <span className="text-lg">Profile</span>
                    </Link>
                </div>

                <div className="mt-auto">
                    <button onClick={logout} className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-neutral-900 transition-all text-neutral-400 hover:text-red-400">
                        <LogOut size={26} />
                        <span className="text-lg">Logout</span>
                    </button>
                </div>
            </nav>

            {/* Mobile Topbar for Logo */}
            <header className="md:hidden fixed top-0 w-full h-14 bg-black border-b border-neutral-800 flex items-center px-4 z-40">
                <Link to="/" className="text-xl font-bold text-primary-500 tracking-tight">Lumina</Link>
            </header>

            {/* Mobile Bottom Tab Bar */}
            <nav className="md:hidden fixed bottom-0 w-full h-14 bg-black border-t border-neutral-800 flex justify-around items-center z-50">
                <Link to="/" className="p-2"><Home size={26} className={isActive('/') ? 'text-primary-500' : 'text-neutral-100'} /></Link>
                <Link to="/search" className="p-2"><Search size={26} className={isActive('/search') ? 'text-primary-500' : 'text-neutral-100'} /></Link>
                <Link to="/create" className="p-2 whitespace-nowrap"><PlusSquare size={26} className={isActive('/create') ? 'text-primary-500' : 'text-neutral-100'} /></Link>
                <Link to="/messages" className="p-2"><MessageCircle size={26} className={isActive('/messages') ? 'text-primary-500' : 'text-neutral-100'} /></Link>
                <Link to="/profile" className="p-2">
                    <div className={`w-7 h-7 rounded-full border-2 overflow-hidden flex items-center justify-center bg-neutral-800 ${isActive('/profile') ? 'border-primary-500' : 'border-transparent'}`}>
                        {user.avatar ? <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.avatar}`} className="w-full h-full object-cover"/> : <User size={16}/>}
                    </div>
                </Link>
            </nav>
        </>
    );
};

export default Navbar;
