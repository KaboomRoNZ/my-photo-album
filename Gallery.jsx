import React, { useState, useEffect } from "react";
import { supabase } from '../supabaseClient';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, Filter, Heart, Calendar, MapPin, Users, Grid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    loadPhotos();
  }, []);

  useEffect(() => {
    // This effect now runs whenever the original photos or any filter/sort option changes
    filterAndSortPhotos();
  }, [photos, searchTerm, sortBy, filterBy]);

  const loadPhotos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('Photo')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error("Error loading photos:", error);
    }
    setIsLoading(false);
  };

  const filterAndSortPhotos = () => {
    // All filtering and sorting is now done client-side after fetching all photos
    let filtered = [...photos];

    // Search filter
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(photo =>
        photo.title.toLowerCase().includes(lowercasedTerm) ||
        photo.description?.toLowerCase().includes(lowercasedTerm) ||
        photo.event?.toLowerCase().includes(lowercasedTerm) ||
        photo.location?.toLowerCase().includes(lowercasedTerm) ||
        photo.tags?.some(tag => tag.toLowerCase().includes(lowercasedTerm)) ||
        photo.people?.some(person => person.toLowerCase().includes(lowercasedTerm))
      );
    }

    // Category filter
    if (filterBy === 'favorites') {
      filtered = filtered.filter(photo => photo.is_favorite);
    } else if (filterBy === 'recent') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      filtered = filtered.filter(photo => new Date(photo.created_at) > lastMonth);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'date_taken':
        filtered.sort((a, b) => {
          if (!a.date_taken) return 1;
          if (!b.date_taken) return -1;
          return new Date(b.date_taken) - new Date(a.date_taken);
        });
        break;
      default:
        break;
    }

    setFilteredPhotos(filtered);
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
        {/* Header */}
        <div className="glass rounded-3xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Photo Gallery</h1>
              <p className="text-blue-100">
                {filteredPhotos.length} of {photos.length} photos
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300/50" />
                <Input
                  placeholder="Search photos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass border-white/30 text-white placeholder-blue-300/50 rounded-xl pl-10 w-full md:w-64"
                />
              </div>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="glass border-white/30 text-blue-100 rounded-xl w-full md:w-32">
                  <Filter className="w-4 h-4 mr-2" /><SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="favorites">Favorites</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="glass border-white/30 text-blue-100 rounded-xl w-full md:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="date_taken">Date Taken</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center glass rounded-xl p-1">
                <Button variant="ghost" size="icon" onClick={() => setViewMode('grid')} className={`rounded-lg ${viewMode === 'grid' ? 'bg-white/20' : ''} text-white hover:bg-white/20`}>
                  <Grid className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setViewMode('list')} className={`rounded-lg ${viewMode === 'list' ? 'bg-white/20' : ''} text-white hover:bg-white/20`}>
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Grid */}
        {filteredPhotos.length === 0 && !isLoading ? (
          <div className="glass rounded-3xl p-12 text-center">
            <div className="text-blue-200/50 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No photos found</h3>
            <p className="text-blue-200">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
            {filteredPhotos.map((photo) => (
              <Link key={photo.id} to={createPageUrl(`Photo?id=${photo.id}`)}>
                {viewMode === 'grid' ? (
                  <Card className="glass border-0 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer group">
                    <div className="aspect-square relative overflow-hidden">
                      <img src={photo.file_url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      {photo.is_favorite && (<div className="absolute top-3 right-3"><Heart className="w-5 h-5 text-cyan-400 fill-current" /></div>)}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-white mb-2 truncate">{photo.title}</h3>
                      <div className="flex items-center justify-between text-sm text-blue-200 mb-2">
                        <span>{format(new Date(photo.created_at), 'MMM d, yyyy')}</span>
                        {photo.event && (<Badge className="glass border-0 text-white/80 text-xs">{photo.event}</Badge>)}
                      </div>
                      {(photo.location || photo.people?.length > 0) && (
                        <div className="flex items-center justify-between text-xs text-blue-300">
                          {photo.location && (<div className="flex items-center"><MapPin className="w-3 h-3 mr-1" /><span className="truncate">{photo.location}</span></div>)}
                          {photo.people?.length > 0 && (<div className="flex items-center"><Users className="w-3 h-3 mr-1" /><span>{photo.people.length}</span></div>)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="glass border-0 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={photo.file_url} alt={photo.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-white text-lg mb-1">{photo.title}</h3>
                              {photo.description && (<p className="text-blue-200 text-sm mb-2 line-clamp-2">{photo.description}</p>)}
                              <div className="flex items-center space-x-4 text-sm text-blue-300">
                                <div className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{format(new Date(photo.created_at), 'MMM d, yyyy')}</div>
                                {photo.location && (<div className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{photo.location}</div>)}
                                {photo.people?.length > 0 && (<div className="flex items-center"><Users className="w-4 h-4 mr-1" />{photo.people.length} people</div>)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              {photo.is_favorite && (<Heart className="w-5 h-5 text-cyan-400 fill-current" />)}
                              {photo.event && (<Badge className="glass border-0 text-white/80 text-xs">{photo.event}</Badge>)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}