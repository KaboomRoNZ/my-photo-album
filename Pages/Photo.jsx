import React, { useState, useEffect } from "react";
import { supabase } from '../supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, MapPin, Users, Tag, ArrowLeft, MessageCircle, Send } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function PhotoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [photo, setPhoto] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    loadData();
  }, [location.search]); // Reload data if the photo ID changes

  const loadData = async () => {
    setIsLoading(true);
    try {
      const urlParams = new URLSearchParams(location.search);
      const photoId = urlParams.get('id');
      
      if (!photoId) {
        navigate(createPageUrl("Gallery"));
        return;
      }

      // Fetch user, photo, and comments in parallel
      const [
        { data: userData }, 
        { data: photoData, error: photoError }, 
        { data: commentData, error: commentError }
      ] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('Photo').select('*').eq('id', photoId).single(),
        supabase.from('Comment').select('*').eq('photo_id', photoId).order('created_at', { ascending: false })
      ]);

      if (photoError || !photoData) {
        console.error("Error loading photo:", photoError);
        navigate(createPageUrl("Gallery"));
        return;
      }

      if (userData.user) {
        setUser({
            ...userData.user,
            full_name: userData.user.user_metadata?.full_name || 'User',
        });
      }
      
      setPhoto(photoData);
      setComments(commentData || []);
      if(commentError) console.error("Error loading comments:", commentError);

    } catch (error) {
      console.error("Error in loadData:", error);
      navigate(createPageUrl("Gallery"));
    }
    setIsLoading(false);
  };

  const toggleFavorite = async () => {
    if (!photo) return;
    
    try {
      const newFavoriteStatus = !photo.is_favorite;
      const { data, error } = await supabase
        .from('Photo')
        .update({ is_favorite: newFavoriteStatus })
        .eq('id', photo.id)
        .select()
        .single();
        
      if (error) throw error;

      setPhoto(data); // Update with the returned data
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !photo) return;

    setIsSubmittingComment(true);
    try {
      const { data: newCommentData, error } = await supabase
        .from('Comment')
        .insert({
          photo_id: photo.id,
          content: newComment.trim(),
          author_name: user.full_name
        })
        .select()
        .single();

      if (error) throw error;
      
      setComments(prev => [newCommentData, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
    }
    setIsSubmittingComment(false);
  };

  if (isLoading) {
    return (<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div></div>);
  }

  if (!photo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl">Photo not found</p>
          <Link to={createPageUrl("Gallery")}><Button className="mt-4 glass rounded-xl">Return to Gallery</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="glass rounded-3xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <Button onClick={() => navigate(createPageUrl("Gallery"))} variant="ghost" className="text-blue-100 hover:text-white hover:bg-white/20 rounded-xl">
              <ArrowLeft className="w-5 h-5 mr-2" />Back to Gallery
            </Button>
            <Button onClick={toggleFavorite} variant="ghost" className="text-blue-100 hover:text-white hover:bg-white/20 rounded-xl">
              <Heart className={`w-5 h-5 mr-2 ${photo.is_favorite ? 'text-cyan-400 fill-current' : ''}`} />
              {photo.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </Button>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="glass border-0 rounded-3xl overflow-hidden">
              <div className="relative">
                <img src={photo.file_url} alt={photo.title} className="w-full h-auto max-h-[70vh] object-contain" />
                {photo.is_favorite && (<div className="absolute top-4 right-4"><Heart className="w-8 h-8 text-cyan-400 fill-current drop-shadow-lg" /></div>)}
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="glass border-0 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold text-white mb-4">{photo.title}</h1>
                {photo.description && (<p className="text-blue-100 mb-6 leading-relaxed">{photo.description}</p>)}
                <div className="space-y-4">
                  <div className="flex items-center text-blue-200"><Calendar className="w-5 h-5 mr-3" /><span>Uploaded {format(new Date(photo.created_at), 'MMMM d, yyyy')}</span></div>
                  {photo.date_taken && (<div className="flex items-center text-blue-200"><Calendar className="w-5 h-5 mr-3" /><span>Taken {format(new Date(photo.date_taken), 'MMMM d, yyyy')}</span></div>)}
                  {photo.location && (<div className="flex items-center text-blue-200"><MapPin className="w-5 h-5 mr-3" /><span>{photo.location}</span></div>)}
                  {photo.event && (<div className="mb-4"><Badge className="glass border-0 text-white/80">{photo.event}</Badge></div>)}
                  {photo.people && photo.people.length > 0 && (
                    <div>
                      <div className="flex items-center text-blue-200 mb-2"><Users className="w-5 h-5 mr-3" /><span>People in this photo:</span></div>
                      <div className="flex flex-wrap gap-2">{photo.people.map((person, index) => (<Badge key={index} className="glass border-0 text-blue-100">{person}</Badge>))}</div>
                    </div>
                  )}
                  {photo.tags && photo.tags.length > 0 && (
                    <div>
                      <div className="flex items-center text-blue-200 mb-2"><Tag className="w-5 h-5 mr-3" /><span>Tags:</span></div>
                      <div className="flex flex-wrap gap-2">{photo.tags.map((tag, index) => (<Badge key={index} className="glass border-0 text-blue-100">#{tag}</Badge>))}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-0 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center mb-6"><MessageCircle className="w-5 h-5 text-white mr-3" /><h3 className="text-lg font-semibold text-white">Comments ({comments.length})</h3></div>
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex gap-3">
                    <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="glass border-white/30 text-white placeholder-blue-300/50 rounded-xl flex-1"/>
                    <Button type="submit" disabled={!newComment.trim() || isSubmittingComment} className="glass rounded-xl px-4 text-white hover:bg-white/20">
                      {isSubmittingComment ? (<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>) : (<Send className="w-4 h-4" />)}
                    </Button>
                  </div>
                </form>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {comments.length === 0 ? (<p className="text-blue-200 text-center py-8">No comments yet. Be the first to share your thoughts!</p>) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="glass rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">{comment.author_name}</span>
                          <span className="text-xs text-blue-300">{format(new Date(comment.created_at), 'MMM d, h:mm a')}</span>
                        </div>
                        <p className="text-blue-100">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}