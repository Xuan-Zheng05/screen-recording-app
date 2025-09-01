import { useState, useRef, ChangeEvent } from "react";

export const useFileInput = (maxSizeMB: number) => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [duration, setDuration] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent) => {
        if (e.target.files?.[0]) {
            const selectedFile = e.target.files[0];
            
            if (selectedFile.size > maxSizeMB * 1024 * 1024) {
                alert(`File size exceeds the limit of ${maxSizeMB}MB.`);
                return;
            }

            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }

            setFile(selectedFile);
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreviewUrl(objectUrl);

            if (selectedFile.type.startsWith('video')) {
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.onloadedmetadata = () => {
                    if(isFinite(video.duration) && video.duration > 0) {
                        setDuration(Math.round(video.duration));
                    } else {
                        setDuration(0);
                    }
                    URL.revokeObjectURL(video.src);
                }
                video.src = objectUrl;
            }
        }
    }

    const resetFile = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setFile(null);
        setPreviewUrl('');
        setDuration(0);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }

    return { file, previewUrl, duration, inputRef, handleFileChange, resetFile}
}