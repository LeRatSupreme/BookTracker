import React, { useRef, useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { resizeImage } from '../utils/imageUtils';
import clsx from 'clsx';

const AvatarUploader = ({ currentAvatar, name, theme, onUpdate }) => {
    const fileInputRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsProcessing(true);
        try {
            // Process image: Resize and Compress
            const compressedAvatar = await resizeImage(file, 300, 300, 0.7);
            onUpdate(compressedAvatar);
        } catch (error) {
            console.error("Image processing failed", error);
            alert("Impossible de traiter cette image.");
        } finally {
            setIsProcessing(false);
        }
    };

    const triggerFileSelect = () => {
        if (!isProcessing) {
            fileInputRef.current?.click();
        }
    };

    // Helper for gradient classes based on theme
    const getGradientClass = (themeName) => {
        const map = {
            blue: 'from-blue-400',
            purple: 'from-purple-400',
            green: 'from-emerald-400',
            orange: 'from-orange-400'
        };
        return map[themeName] || 'from-blue-400';
    };

    return (
        <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={triggerFileSelect}
        >
            <div className={clsx(
                "w-24 h-24 rounded-full shadow-lg overflow-hidden border-4 border-white dark:border-slate-800 transition-transform active:scale-95 relative",
                !currentAvatar && `bg-gradient-to-br ${getGradientClass(theme)} to-white flex items-center justify-center`
            )}>
                {currentAvatar ? (
                    <img src={currentAvatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-4xl font-bold text-white">{name.charAt(0)}</span>
                )}

                {/* Processing Overlay */}
                {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {/* Edit Badge / Overlay */}
            <div className="absolute bottom-0 right-0 bg-white dark:bg-slate-700 p-2 rounded-full shadow-md text-slate-600 dark:text-slate-300 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                <Camera size={16} />
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
};

export default AvatarUploader;
