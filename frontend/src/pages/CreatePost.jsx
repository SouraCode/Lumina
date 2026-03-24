import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { UploadCloud, Clock, Send, PlusSquare, Loader2 } from 'lucide-react';

const CreatePost = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [caption, setCaption] = useState('');
    const [isTimeCapsule, setIsTimeCapsule] = useState(false);
    const [unlockDate, setUnlockDate] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef();
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if(selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!file) return toast.error("Please select a media file");
        if(isTimeCapsule && !unlockDate) return toast.error("Please pick an unlock date");

        setLoading(true);
        const formData = new FormData();
        formData.append('media', file);
        formData.append('caption', caption);
        formData.append('isTimeCapsule', isTimeCapsule);
        if(isTimeCapsule) formData.append('unlockDate', unlockDate);

        try {
            await api.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Post created successfully!");
            navigate('/');
        } catch(err) {
            toast.error(err.response?.data?.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-3xl font-extrabold mb-8 flex items-center gap-4 text-white">
               <div className="p-3 bg-gradient-to-br from-primary-500 to-fuchsia-500 rounded-xl shadow-lg">
                   <PlusSquare className="text-white" size={28} />
               </div>
               Create New Post
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* File Upload Area */}
                <div 
                   onClick={() => !file && fileInputRef.current.click()} 
                   className={`border-2 border-dashed ${file ? 'border-primary-500' : 'border-neutral-700 hover:border-primary-500'} rounded-3xl min-h-[16rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 bg-neutral-900/50 hover:bg-neutral-900 overflow-hidden relative shadow-inner`}
                >
                    {preview ? (
                        <>
                           {file.type.startsWith('video') ? 
                              <video src={preview} className="w-full h-full object-contain max-h-[30rem]" controls /> : 
                              <img src={preview} className="w-full h-full object-contain max-h-[30rem]" alt="Preview"/>
                           }
                           <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }} className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full text-white hover:bg-red-500 transition-colors">
                              ✕
                           </button>
                        </>
                    ) : (
                        <div className="text-center p-8">
                            <UploadCloud size={56} className="mx-auto text-primary-400 mb-6 drop-shadow-lg animate-pulse" />
                            <h3 className="text-xl font-bold text-white mb-2">Click or drag media here</h3>
                            <p className="text-neutral-500 text-sm">Supports JPG, PNG, MP4, WEBM</p>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                </div>

                {/* Caption */}
                <div>
                   <label className="block text-sm font-semibold text-neutral-300 mb-2 pl-1">Caption</label>
                   <textarea 
                     className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-white placeholder-neutral-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none min-h-[120px] shadow-sm transition-all" 
                     placeholder="What's going on?" 
                     value={caption} 
                     onChange={e => setCaption(e.target.value)} 
                   />
                </div>

                {/* Time Capsule Feature Toggle */}
                <div className="bg-gradient-to-r from-neutral-900 to-neutral-800/80 border border-neutral-800 rounded-3xl p-6 shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-purple-500/30 rounded-2xl text-purple-400 shadow-inner">
                                <Clock size={28} className={isTimeCapsule ? "animate-pulse text-purple-300" : ""} />
                            </div>
                            <div>
                                <h4 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Make it a Time Capsule?</h4>
                                <p className="text-sm text-neutral-400 mt-1">Lock this post until a specific future date.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={isTimeCapsule} onChange={e => setIsTimeCapsule(e.target.checked)} />
                          <div className="w-14 h-8 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-purple-500 cursor-pointer shadow-inner"></div>
                        </label>
                    </div>

                    {isTimeCapsule && (
                        <div className="pt-6 mt-4 border-t border-white/5 animate-in slide-in-from-top-4 duration-500 fade-in">
                            <label className="block text-sm font-semibold text-neutral-300 mb-2 pl-1">Unlock Date & Time</label>
                            <input 
                               type="datetime-local" 
                               value={unlockDate}
                               onChange={e => setUnlockDate(e.target.value)}
                               className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none shadow-inner" 
                               min={new Date().toISOString().slice(0, 16)}
                            />
                        </div>
                    )}
                </div>

                <div className="pt-6">
                    <button type="submit" disabled={loading} className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-primary-600 to-fuchsia-600 hover:from-primary-500 hover:to-fuchsia-500 transition-all shadow-xl hover:shadow-primary-500/25 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed">
                        {loading ? <Loader2 className="animate-spin" size={24} /> : <><Send size={24}/> Post Now</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;
