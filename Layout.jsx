import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { supabase } from './supabaseClient'; // Make sure you have created supabaseClient.js
import { Camera, Home, Upload, Image, Heart, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: { user } } = await supabase.auth.getUser();
          setUser({
            ...user,
            full_name: user.user_metadata?.full_name || 'User',
            role: user.user_metadata?.role || 'user'
          });
        }
      } catch (error) {
        console.log("Error checking auth:", error);
      }
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
          const userObj = session.user;
          setUser({
            ...userObj,
            full_name: userObj.user_metadata?.full_name || 'User',
            role: userObj.user_metadata?.role || 'user'
          });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    // You can change the provider to 'google', 'facebook', etc.
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate(createPageUrl("Dashboard"));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const navigationItems = [
    { title: "Home", url: createPageUrl("Dashboard"), icon: Home },
    user?.role === 'admin' && { title: "Upload", url: createPageUrl("Upload"), icon: Upload },
    { title: "Gallery", url: createPageUrl("Gallery"), icon: Image },
    { title: "Favorites", url: createPageUrl("Favorites"), icon: Heart },
  ].filter(Boolean);

  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <style>{`
          :root {
            --glass-bg: rgba(200, 220, 255, 0.15);
            --glass-border: rgba(255, 255, 255, 0.2);
            --shadow-light: rgba(31, 38, 135, 0.37);
            --text-color: #e0f2fe; /* Light sky blue */
            --text-color-darker: #bae6fd; /* A bit darker sky blue */
          }
          .glass { background: var(--glass-bg); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid var(--glass-border); box-shadow: 0 8px 32px var(--shadow-light); }
          .glass-card { background: rgba(100, 150, 255, 0.1); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 12px 40px rgba(31, 38, 135, 0.4); }
          .gradient-bg { background: linear-gradient(135deg, #022c43 0%, #053f5e 25%, #115173 50%, #053f5e 75%, #022c43 100%); }
          .floating-orb { position: absolute; border-radius: 50%; filter: blur(2px); animation: float 8s ease-in-out infinite; }
          @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-30px) rotate(180deg); } }
        `}</style>
        <div className="absolute inset-0 gradient-bg">
          <div className="floating-orb top-20 left-20 w-32 h-32 bg-blue-400 opacity-20"></div>
          <div className="floating-orb top-40 right-32 w-24 h-24 bg-cyan-400 opacity-15" style={{animationDelay: '2s'}}></div>
          <div className="floating-orb bottom-32 left-40 w-20 h-20 bg-blue-300 opacity-20" style={{animationDelay: '4s'}}></div>
          <div className="floating-orb bottom-20 right-20 w-28 h-28 bg-cyan-300 opacity-15" style={{animationDelay: '6s'}}></div>
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="glass-card rounded-3xl p-12 max-w-md w-full text-center">
            <div className="glass rounded-2xl p-6 mb-8">
              <Camera className="w-16 h-16 mx-auto text-cyan-200 mb-4" />
              <h1 className="text-4xl font-bold text-white mb-2">Family Memories</h1>
              <p className="text-blue-100 text-lg">Your private photo sanctuary</p>
            </div>
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-blue-100 mb-6 text-lg leading-relaxed">
                  Preserve and share your most precious family moments in a beautiful, secure space designed just for you.
                </p>
              </div>
              <Button onClick={handleLogin} className="w-full glass rounded-xl py-4 text-lg font-semibold text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                Enter Your Family Gallery
              </Button>
              <div className="flex items-center justify-center space-x-8 pt-6">
                <div className="glass rounded-xl p-4">
                  <Upload className="w-6 h-6 text-blue-200 mx-auto mb-2" />
                  <p className="text-blue-200 text-sm">Upload</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <Image className="w-6 h-6 text-blue-200 mx-auto mb-2" />
                  <p className="text-blue-200 text-sm">Organize</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <Heart className="w-6 h-6 text-blue-200 mx-auto mb-2" />
                  <p className="text-blue-200 text-sm">Cherish</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <style>{`
        :root { --glass-bg: rgba(200, 220, 255, 0.1); --glass-border: rgba(255, 255, 255, 0.18); --shadow-light: rgba(31, 38, 135, 0.37); --text-color: #e0f2fe; --text-color-darker: #bae6fd; }
        .glass { background: var(--glass-bg); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid var(--glass-border); box-shadow: 0 8px 32px var(--shadow-light); }
        .glass-nav { background: rgba(20, 40, 80, 0.2); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px); border-bottom: 1px solid rgba(255, 255, 255, 0.15); }
        .gradient-bg { background: linear-gradient(135deg, #022c43 0%, #053f5e 25%, #115173 50%, #053f5e 75%, #022c43 100%); }
        .nav-link { transition: all 0.3s ease; color: var(--text-color-darker); }
        .nav-link:hover { background: rgba(255, 255, 255, 0.1); color: white; transform: translateY(-2px); }
        .nav-link.active { background: rgba(255, 255, 255, 0.2); color: white; }
      `}</style>
      <div className="absolute inset-0 gradient-bg"></div>
      <nav className="glass-nav relative z-20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={createPageUrl("Dashboard")} className="flex items-center space-x-3">
              <div className="glass rounded-xl p-2">
                <Camera className="w-6 h-6 text-cyan-300" />
              </div>
              <span className="text-xl font-bold text-white">Family Memories</span>
            </Link>
            <div className="hidden md:flex items-center space-x-2">
              {navigationItems.map((item) => (
                <Link key={item.title} to={item.url} className={`nav-link flex items-center space-x-2 px-4 py-2 rounded-xl ${ location.pathname === item.url ? 'active' : '' }`}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <div className="glass rounded-xl px-4 py-2">
                  <span className="text-white font-medium">{user.full_name}</span>
                </div>
                <Button onClick={handleLogout} variant="ghost" size="icon" className="glass rounded-xl text-blue-100 hover:text-white hover:bg-white/20">
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
              <Button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} variant="ghost" size="icon" className="md:hidden glass rounded-xl text-blue-100 hover:text-white hover:bg-white/20">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
          {isMobileMenuOpen && (
            <div className="md:hidden glass rounded-2xl m-4 p-4 space-y-2">
              {navigationItems.map((item) => (
                <Link key={item.title} to={item.url} onClick={() => setIsMobileMenuOpen(false)} className={`nav-link flex items-center space-x-3 px-4 py-3 rounded-xl ${ location.pathname === item.url ? 'active' : '' }`}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              ))}
              <div className="border-t border-white/20 pt-4 mt-4">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-white font-medium">{user.full_name}</span>
                  <Button onClick={handleLogout} variant="ghost" size="sm" className="text-blue-100 hover:text-white hover:bg-white/20">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}