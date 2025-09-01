'use client';

import { useState } from "react";

import FormField from "@/components/FormField";
import FileInput from "@/components/FileInput";
import { ChangeEvent, FormEvent, useEffect } from "react";
import { useFileInput } from "@/lib/hooks/useFileInputs";
import { MAX_VIDEO_SIZE_MB, MAX_THUMBNAIL_SIZE_MB } from "@/constants";
import { getVideoUploadUrl, getThumbnailUploadUrl, saveVideoDetails } from "@/lib/actions/video";
import { useRouter } from "next/navigation";


const uploadFileToBunny = (file: File, uploadUrl: string, accessKey: string): Promise<void> => {
    return fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type,
            AccessKey: accessKey,
        },
        body: file
    }).then((response) => {
        if (!response.ok) {
            throw new Error('Upload failed');
        }
    })
}

const page = () => {
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: 'public',
    });

    const [videoDuration, setVideoDuration] = useState(0);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const video = useFileInput(MAX_VIDEO_SIZE_MB);
    const thumbnail = useFileInput(MAX_THUMBNAIL_SIZE_MB)

    useEffect(() => {
        if (video.duration !== null || 0) {
            setVideoDuration(video.duration);
        }
    }, [video.duration]);

    useEffect(() => {
        const checkForRecordedVideo = async () => {
            try {
                const stored = sessionStorage.getItem('recordedVideo');
                if (!stored) return;

                const { url, name, type, size, duration } = JSON.parse(stored);
                const blob = await fetch(url).then((res) => res.blob());
                const file = new File([blob], name, { type, lastModified: Date.now()});

                if (video.inputRef.current) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    video.inputRef.current.files = dataTransfer.files;
                    
                    const event = new Event('change', { bubbles: true})
                    video.inputRef.current.dispatchEvent(event); 
                }

                if (duration) setVideoDuration(duration);

                sessionStorage.removeItem('recordedVideo');
                URL.revokeObjectURL(url);
            } catch (e) {
                console.error(e, "Error loading recorded video")
            }
        }

        checkForRecordedVideo();
    }, [video])

    const [error, setError] = useState('');

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!video.file || !thumbnail.file) {
                setError("Upload both video and thumbnail");
                return;
            }
            if (!formData.title || !formData.description) {
                setError("Please fill in both title and description");
                return;
            }

            // Get video upload URL
            const {
                videoId,
                uploadUrl: videoUploadUrl,
                accessKey: videoAccessKey
            } = await getVideoUploadUrl();

            if (!videoUploadUrl || !videoAccessKey) {
                setError("Failed to get video upload credentials");
                return;
            }

            // Upload the video to cloud
            await uploadFileToBunny(video.file, videoUploadUrl, videoAccessKey);

            // Get thumbnail upload URL
            const {
                uploadUrl: thumbnailUploadUrl,
                accessKey: thumbnailAccessKey,
                cdnUrl: thumbnailCdnUrl,
            } = await getThumbnailUploadUrl(videoId);

            if (!thumbnailUploadUrl || !thumbnailCdnUrl || !thumbnailAccessKey) {
                setError("Failed to get thumbnail upload credentials");
                return;
            }

            // Upload the thumbnail to DB
            await uploadFileToBunny(thumbnail.file, thumbnailUploadUrl, thumbnailAccessKey);

            // Create a new video entry in the DB for video details
            await saveVideoDetails({
                videoId,
                thumbnailUrl: thumbnailCdnUrl,
                ...formData,
                duration: videoDuration
            })

            router.push(`/`)
        } catch (error) {
            console.log("Error submitting form: ", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="wrapper-md upload-page">
            <h1>Upload a video</h1>

            {error && <div className="error-field">{error}</div>}

            <form className="rounded-20 shadow-10 gap-6 w-full flex flex-col px-5 py-7.5" onSubmit={handleSubmit}>
                <FormField 
                    id="title"
                    label="Title"
                    placeholder="Enter a clear and concise video title"
                    value={formData.title}
                    onChange={handleInputChange}
                />

                <FormField 
                    id="description"
                    label="Description"
                    placeholder="What is the video about?"
                    value={formData.description}
                    as="textarea"
                    onChange={handleInputChange}
                />

                <FileInput 
                    id="video"
                    label="Video"
                    accept="video/*"
                    file={video.file}
                    previewUrl={video.previewUrl}
                    inputRef={video.inputRef}
                    onChange={video.handleFileChange}
                    onReset={video.resetFile}
                    type="video"
                />

                <FileInput 
                    id="thumbnail"
                    label="Thumbnail"
                    accept="image/*"
                    file={thumbnail.file}
                    previewUrl={thumbnail.previewUrl}
                    inputRef={thumbnail.inputRef}
                    onChange={thumbnail.handleFileChange}
                    onReset={thumbnail.resetFile}
                    type="image"
                />

                <FormField 
                    id="visibility"
                    label="Visibility"
                    value={formData.visibility}
                    as="select"
                    options={[
                        { label: 'Public', value: 'public' },
                        { label: 'Private', value: 'private' },
                    ]}
                    onChange={handleInputChange}
                />

                <button type="submit" disabled={isSubmitting} className="submit-button">
                    {isSubmitting ? 'Uploading...' : 'Upload Video'}
                </button>
            </form>
        </div>
    )
}

export default page