import { redirect } from 'next/navigation'
import { getVideoById } from '@/lib/actions/video'
import VideoPlayer from '@/components/VideoPlayer'
import VideoDetailHeader from '@/components/VideoDetailHeader';

const page = async ({ params }: Params) => {
    const { videoId } = await params;

    const result = await getVideoById(videoId);

    if (!result || typeof result === 'string' || !result.video) {
        redirect('/404');
    }

    const { user, video } = result;

    if (!video) {
        redirect('/404');
    }

    return (
        <main className="wrapper page">
            <VideoDetailHeader 
                {...video} 
                userImg={user?.image}
                username={user?.name}
                ownerId={video.userId}
            />

            <section className='video-details'>
                <div className='content'>
                    <VideoPlayer videoId={video.videoId}/>
                </div>
            </section>
        </main>
    )
}

export default page