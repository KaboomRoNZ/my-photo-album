import React, { useState, useEffect } from "react";
import { supabase } from '../supabaseClient';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Heart, Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Favorites() {
  const [favoritePhotos, setFavoritePhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('Photo')
        .select('*')
        .eq('is_favorite', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setFavoritePhotos(data || []);
    } catch (error) {
      console.error("Error loading favorite photos:", error);
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
        <div className="glass rounded-3xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Heart className="w-8 h-8 text-cyan-400 fill-current mr-3" />
                Favorite Photos
              </h1>
              <p className="text-blue-100">
                Your most cherished family memories ({favoritePhotos.length} photos)
              </p>
            </div>
          </div>
        </div>

        {favoritePhotos.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <Heart className="w-16 h-16 text-blue-200/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No favorites yet</h3>
            <p className="text-blue-200 mb-6">
              Start adding photos to your favorites to see them here
            </p>
            <Link to={createPageUrl("Gallery")}>
              <button className="glass rounded-xl px-6 py-3 text-white hover:bg-white/20 transition-all duration-300">
                Browse Gallery
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoritePhotos.map((photo) => (
              <Link key={photo.id} to={createPageUrl(`Photo?id=${photo.id}`)}>
                <Card className="glass border-0 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={photo.file_url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <Heart className="w-6 h-6 text-cyan-400 fill-current drop-shadow-lg" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-white mb-2 truncate">{photo.title}</h3>
                    <div className="flex items-center justify-between text-sm text-blue-200 mb-2">
                      <span>{format(new Date(photo.created_at), 'MMM d, yyyy')}</span>
                      {photo.event && (
                        <Badge className="glass border-0 text-white/80 text-xs">
                          {photo.event}
                        </Badge>
                      )}
                    </div>
                    {(photo.location || photo.people?.length > 0) && (
                      <div className="flex items-center justify-between text-xs text-blue-300">
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
  );
}