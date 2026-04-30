"use client";

import { useState, useRef } from 'react';
import { FiCamera, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function AvatarUpload({ initialImage, onUpload, userName }) {
  const [preview, setPreview] = useState(initialImage);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please upload a valid image (JPG, PNG, or WEBP)");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    // Local Preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      // Simulate/Trigger upload
      await onUpload(file);
      setIsUploading(false);
      toast.success("Avatar updated!");
    } catch (err) {
      setError("Upload failed");
      setIsUploading(false);
      toast.error("Failed to upload image. Please try again.");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 bg-white/5 p-6 md:p-8 rounded-[2rem] border border-white/10 relative overflow-hidden group">
      <div className="relative shrink-0">
        <div className={`
          w-28 h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden ring-4 ring-primary/20 shadow-2xl transition-all duration-500
          ${isUploading ? 'opacity-50 scale-95' : 'group-hover:scale-[1.02] group-hover:ring-primary/40'}
        `}>
          {preview ? (
            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-white text-4xl font-black">
              {userName?.charAt(0).toUpperCase() || 'N'}
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <FiRefreshCw className="text-3xl text-white animate-spin" />
          </div>
        )}

        {/* Edit Button */}
        <label className={`
          absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-xl shadow-xl flex items-center justify-center cursor-pointer hover:bg-primary-hover hover:scale-110 active:scale-90 transition-all
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}>
          <FiCamera className="text-lg" />
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
            disabled={isUploading}
          />
        </label>
      </div>

      <div className="text-center sm:text-left flex-1">
        <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">Profile Picture</h3>
        <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-xs">
          JPG, PNG or WEBP. Max size 5MB. Recommended square aspect ratio.
        </p>
        
        {error && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest hover:text-red-400 transition-colors"
          >
            <FiAlertCircle /> {error} — Click to retry
          </button>
        )}
      </div>
    </div>
  );
}
