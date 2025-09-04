'use client';

import Link from 'next/link';
import Image from 'next/image';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation'; 
import { useEffect } from 'react'; 

const Page = () => {
    const router = useRouter();
    const { data: session } = authClient.useSession();

    useEffect(() => {
        if (session) {
            // Redirect them to the homepage.
            router.push('/');
        }
    }, [session, router]); 

    const handleSignIn = async () => {
        return await authClient.signIn.social({
            provider: 'google',
            options: {
                redirectUrl: '/',
            },
        });
    };

    if (session) {
        return (
            <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p>Redirecting...</p>
            </main>
        );
    }

    return (
      <main className="sign-in">
        <aside className='testimonial'>
          <Link href="/">
            <Image
              src="/assets/icons/logo.svg"
              alt="Logo"
              width={32}
              height={32}
            />
            <h1>RecordingBuddy</h1>
          </Link>

          <div className='description'>
            <section>
              <figure>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Image 
                    src="/assets/icons/star.svg" 
                    alt="star" 
                    width={20} 
                    height={20} 
                    key={index}
                  />
                ))}
              </figure>
              <p>
                "RecordingBuddy makes it so easy to capture and share my screen recordings. 
                The intuitive interface and seamless sharing options have boosted my productivity!"
              </p>

              <article>
                <Image
                  src="/assets/images/dummy.jpg"
                  alt="Xuan"
                  width={64}
                  height={64}
                  className='rounded-full'
                />
                <div>
                  <h2>Xuan</h2>
                  <p>Software Developer</p>
                </div>
              </article>
            </section>
          </div>
          <p>© RecordingBuddy {(new Date()).getFullYear()}</p>
        </aside>

        <aside className='google-sign-in'>
          <section>
            <Link href="/">
              <Image
                src="/assets/icons/logo.svg"
                alt="Logo"
                width={32}
                height={32}
              />
              <h1>RecordingBuddy</h1>
            </Link>
            <p>Create and share your very own video</p>
            <button onClick={handleSignIn}>
              <Image 
                src="/assets/icons/google.svg" 
                alt="google" 
                width={22} 
                height={22} 
              />
              Sign in with Google
            </button>
          </section>
        </aside>
        <div className='overlay'></div>
      </main>
    );
};

export default Page;
