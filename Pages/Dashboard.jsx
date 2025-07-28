import React, { useState, useEffect } from "react";
import { supabase } from '../supabaseClient';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Upload, Image as ImageIcon, Heart, Calendar, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Dashboard() {
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, favorites: 0 });
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This is async, but we don't need to wait for it in the effect
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch user and recent photos in parallel
      const [{ data: userData }, { data: recentPhotosData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('Photo').select('*').order('created_at', { ascending: false }).limit(6)
      ]);

      if (userData.user) {
        setUser({
            ...userData.user,
            full_name: userData.user.user_metadata?.full_name || 'User',
            role: userData.user.user_metadata?.role || 'user'
        });
      }
      setRecentPhotos(recentPhotosData || []);

      // Fetch all photos for stats, this can happen after the initial render
      const { data: allPhotos, error: allPhotosError } = await supabase.from('Photo').select('created_at, is_favorite');
      if (allPhotosError) throw allPhotosError;
      
      const now = new Date();
      const thisMonth = allPhotos.filter(photo => {
        const photoDate = new Date(photo.created_at);
        return photoDate.getMonth() === now.getMonth() && photoDate.getFullYear() === now.getFullYear();
      });
      const favorites = allPhotos.filter(photo => photo.is_favorite);
      
      setStats({
        total: allPhotos.length,
        thisMonth: thisMonth.length,
        favorites: favorites.length
      });

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="glass rounded-3xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {user?.full_name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Your family memories are waiting to be discovered
              </p>
            </div>
            {user?.role === 'admin' && (
              <Link to={createPageUrl("Upload")}>
                <Button className="glass rounded-xl px-6 py-3 text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <Upload className="w-5 h-5 mr-2" />
                  Add New Photos
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass border-0 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="glass rounded-xl p-3">
                  <ImageIcon className="w-8 h-8 text-cyan-300" />
                </div>
                <div>
                  <p className="text-blue-200 text-sm">Total Photos</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-0 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="glass rounded-xl p-3">
                  <Calendar className="w-8 h-8 text-cyan-300" />
                </div>
                <div>
                  <p className="text-blue-200 text-sm">This Month</p>
                  <p className="text-3xl font-bold text-white">{stats.thisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-0 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="glass rounded-xl p-3">
                  <Heart className="w-8 h-8 text-cyan-300" />
                </div>
                <div>
                  <p className="text-blue-200 text-sm">Favorites</p>
                  <p className="text-3xl font-bold text-white">{stats.favorites}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Photos */}
        <div className="glass rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Uploads</h2>
            <Link to={createPageUrl("Gallery")}>
              <Button variant="ghost" className="text-blue-100 hover:text-white hover:bg-white/20 rounded-xl">
                View All →
              </Button>
            </Link>
          </div>
          {recentPhotos.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <div className="glass rounded-2xl p-8 max-w-md mx-auto">
                <ImageIcon className="w-16 h-16 text-blue-200/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No photos yet</h3>
                <p className="text-blue-200 mb-6">Start building your family memories by uploading your first photo!</p>
                {user?.role === 'admin' && (
                  <Link to={createPageUrl("Upload")}>
                    <Button className="glass rounded-xl px-6 py-3 text-white hover:bg-white/20">
                      <Upload className="w-5 h-5 mr-2" />
                      Upload First Photo
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPhotos.map((photo) => (
                <Link key={photo.id} to={createPageUrl(`Photo?id=${photo.id}`)}>
                  <Card className="glass border-0 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer group">
                    <div className="aspect-square relative overflow-hidden">
                      <img src={photo.file_url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      {photo.is_favorite && (
                        <div className="absolute top-3 right-3">
                          <Heart className="w-5 h-5 text-cyan-400 fill-current" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-white mb-2 truncate">{photo.title}</h3>
                      <div className="flex items-center justify-between text-sm text-blue-200">
                        {/* Note: Supabase uses 'created_at'. Ensure your table has this default column. */}
                        <span>{format(new Date(photo.created_at), 'MMM d, yyyy')}</span>
                        {photo.event && (<Badge className="glass border-0 text-white/80 text-xs">{photo.event}</Badge>)}
                      </div>
                      {(photo.location || photo.people?.length > 0) && (
                        <div className="flex items-center justify-between mt-2 text-xs text-blue-300">
                          {photo.location && (
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span className="truncate">{photo.location}</span>
                            </div>
                          )}
                          {photo.people?.length > 0 && (
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              <span>{photo.people.length}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}