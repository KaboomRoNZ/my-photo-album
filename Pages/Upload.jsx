import React, { useState, useRef, useEffect } from "react";
import { supabase } from '../supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload as UploadIcon, X, Image as ImageIcon, Heart, Users, Tag, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [currentUpload, setCurrentUpload] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event: '',
    date_taken: '',
    location: '',
    people: [],
    tags: [],
    is_favorite: false
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser({ ...user, role: user.user_metadata?.role || 'user' });
        } else {
          navigate(createPageUrl("Dashboard"));
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
        navigate(createPageUrl("Dashboard")); 
      }
      setIsLoading(false);
    };
    checkUser();
  }, [navigate]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      setSelectedFiles(files);
      if (!formData.title && files[0]) setFormData(prev => ({ ...prev, title: files[0].name.split('.')[0] }));
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      setSelectedFiles(files);
      if (!formData.title && files[0]) setFormData(prev => ({ ...prev, title: files[0].name.split('.')[0] }));
    }
  };

  const removeFile = (index) => setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  const addTag = (tag) => { if (tag.trim() && !formData.tags.includes(tag.trim())) setFormData(prev => ({ ...prev, tags: [...prev.tags, tag.trim()] })); };
  const removeTag = (tagToRemove) => setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  const addPerson = (person) => { if (person.trim() && !formData.people.includes(person.trim())) setFormData(prev => ({ ...prev, people: [...prev.people, person.trim()] })); };
  const removePerson = (personToRemove) => setFormData(prev => ({ ...prev, people: prev.people.filter(person => person !== personToRemove) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0 || !user) return;

    setUploading(true);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setCurrentUpload({ name: file.name, progress: 0 });

        // 1. Upload file to Supabase Storage
        const fileName = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('photos').upload(fileName, file);

        if (uploadError) throw uploadError;

        // 2. Get the public URL of the uploaded file
        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName);

        if (!publicUrl) throw new Error("Could not get public URL for the file.");

        // 3. Create photo record in the database
        const photoRecord = {
          ...formData,
          date_taken: formData.date_taken || null, // Ensure empty string becomes null
          file_url: publicUrl,
          title: selectedFiles.length === 1 ? formData.title : `${formData.title} (${i + 1})`,
          user_id: user.id, // Associate photo with the user
        };
        
        const { error: insertError } = await supabase.from('Photo').insert(photoRecord);
        if (insertError) throw insertError;

        setCurrentUpload({ name: file.name, progress: 100 });
      }

      navigate(createPageUrl("Gallery"));
    } catch (error) {
      console.error("Error uploading photos:", error.message);
      // Here you might want to show an error message to the user
    } finally {
      setUploading(false);
      setCurrentUpload(null);
    }
  };
  
  if (isLoading) {
    return (<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div></div>);
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="glass rounded-3xl p-12 text-center max-w-lg mx-auto">
          <Lock className="w-16 h-16 text-cyan-300/50 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-3">Access Denied</h1>
          <p className="text-blue-100 text-lg mb-8">You do not have permission to upload photos. Please contact a site administrator.</p>
          <Button onClick={() => navigate(createPageUrl("Gallery"))} className="glass rounded-xl px-6 py-3 text-white hover:bg-white/20 transition-all duration-300">
            Return to Gallery
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="glass rounded-3xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload New Memories</h1>
          <p className="text-blue-100">Share your precious family moments</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="glass border-0 rounded-2xl overflow-hidden">
            <CardHeader><CardTitle className="text-white flex items-center"><UploadIcon className="w-6 h-6 mr-2" />Select Photos</CardTitle></CardHeader>
            <CardContent>
              <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${dragActive ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/30 hover:border-white/50'}`}>
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                {selectedFiles.length === 0 ? (
                  <div>
                    <ImageIcon className="w-16 h-16 text-blue-200/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Drop your photos here</h3>
                    <p className="text-blue-200 mb-6">or click to browse your files</p>
                    <Button type="button" onClick={() => fileInputRef.current?.click()} className="glass rounded-xl px-6 py-3 text-white hover:bg-white/20">Choose Photos</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">{selectedFiles.length} photo{selectedFiles.length > 1 ? 's' : ''} selected</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img src={URL.createObjectURL(file)} alt={file.name} className="w-full aspect-square object-cover rounded-xl" />
                          <Button type="button" onClick={() => removeFile(index)} className="absolute top-2 right-2 glass rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" size="icon" variant="ghost"><X className="w-4 h-4 text-white" /></Button>
                        </div>
                      ))}
                    </div>
                    <Button type="button" onClick={() => fileInputRef.current?.click()} variant="ghost" className="text-blue-100 hover:text-white hover:bg-white/20 rounded-xl">Add more photos</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {selectedFiles.length > 0 && (
            <Card className="glass border-0 rounded-2xl overflow-hidden">
              <CardHeader><CardTitle className="text-white">Photo Details</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title" className="text-blue-100 mb-2 block">Title *</Label>
                    <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Family vacation, Birthday party..." className="glass border-white/30 text-white placeholder-blue-300/50 rounded-xl" required />
                  </div>
                  <div>
                    <Label htmlFor="event" className="text-blue-100 mb-2 block">Event</Label>
                    <Input id="event" value={formData.event} onChange={(e) => setFormData(prev => ({ ...prev, event: e.target.value }))} placeholder="Birthday, Wedding, Vacation..." className="glass border-white/30 text-white placeholder-blue-300/50 rounded-xl" />
                  </div>
                  <div>
                    <Label htmlFor="date_taken" className="text-blue-100 mb-2 block">Date Taken</Label>
                    <Input id="date_taken" type="date" value={formData.date_taken} onChange={(e) => setFormData(prev => ({ ...prev, date_taken: e.target.value }))} className="glass border-white/30 text-white rounded-xl" />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-blue-100 mb-2 block">Location</Label>
                    <Input id="location" value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} placeholder="Paris, Home, Beach..." className="glass border-white/30 text-white placeholder-blue-300/50 rounded-xl" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description" className="text-blue-100 mb-2 block">Description</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Tell the story behind these photos..." className="glass border-white/30 text-white placeholder-blue-300/50 rounded-xl h-24" />
                </div>
                <div>
                  <Label className="text-blue-100 mb-2 block flex items-center"><Users className="w-4 h-4 mr-2" />People in Photos</Label>
                  <div className="flex flex-wrap gap-2 mb-3">{formData.people.map((person, index) => (<Badge key={index} className="glass border-0 text-blue-100">{person}<Button type="button" onClick={() => removePerson(person)} className="ml-2 p-0 h-auto bg-transparent hover:bg-transparent" size="sm"><X className="w-3 h-3" /></Button></Badge>))}</div>
                  <Input placeholder="Add person name and press Enter" className="glass border-white/30 text-white placeholder-blue-300/50 rounded-xl" onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPerson(e.target.value); e.target.value = ''; } }} />
                </div>
                <div>
                  <Label className="text-blue-100 mb-2 block flex items-center"><Tag className="w-4 h-4 mr-2" />Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-3">{formData.tags.map((tag, index) => (<Badge key={index} className="glass border-0 text-blue-100">#{tag}<Button type="button" onClick={() => removeTag(tag)} className="ml-2 p-0 h-auto bg-transparent hover:bg-transparent" size="sm"><X className="w-3 h-3" /></Button></Badge>))}</div>
                  <Input placeholder="Add tag and press Enter" className="glass border-white/30 text-white placeholder-blue-300/50 rounded-xl" onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(e.target.value); e.target.value = ''; } }} />
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" id="favorite" checked={formData.is_favorite} onChange={(e) => setFormData(prev => ({ ...prev, is_favorite: e.target.checked }))} className="w-5 h-5 rounded border-white/30 bg-transparent" />
                  <Label htmlFor="favorite" className="text-blue-100 flex items-center cursor-pointer"><Heart className={`w-5 h-5 mr-2 ${formData.is_favorite ? 'text-cyan-400 fill-current' : 'text-blue-200'}`} />Mark as favorite</Label>
                </div>
              </CardContent>
            </Card>
          )}
          {selectedFiles.length > 0 && (
            <div className="text-center">
              <Button type="submit" disabled={uploading || !formData.title} className="glass rounded-xl px-8 py-4 text-lg font-semibold text-white hover:bg-white/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50">
                {uploading ? (<div className="flex items-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>Uploading {currentUpload?.name}...</div>) : (<><UploadIcon className="w-5 h-5 mr-2" />Upload {selectedFiles.length} Photo{selectedFiles.length > 1 ? 's' : ''}</>)}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}