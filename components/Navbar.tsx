'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter, redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";


const Navbar = () => {
    const router = useRouter()
    const { data: session } = authClient.useSession();
    const user = session?.user;

  return (
    <header className = "navbar">
        <nav>
            <Link href="/">
                <Image
                    src="/assets/icons/logo.svg" 
                    alt="Logo"
                    width={32} 
                    height={32} 
                />
                <h1>RecordingBuddy</h1>
            </Link>

            {user && (
                <figure>
                    <button onClick={() => router.push(`/profile/${user?.id}`)} className="cursor-pointer">
                        <Image src={user.image || ''} alt="User" width={36} height={36}
                        className = "rounded-full aspect-square" />
                    </button>
                    <button
                        onClick={async () => {
                            await authClient.signOut();
                            router.push("/sign-in");
                        }}
                        className="cursor-pointer"
                    >
                        <Image
                            src="/assets/icons/logout.svg"
                            alt="logout"
                            width={24}
                            height={24}
                            className="rotate-180"
                        />
                    </button>
                </figure>
            )}
        </nav>
    </header>
  )
}

export default Navbar