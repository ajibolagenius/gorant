import React from 'react';
import { Metadata } from 'next';
import { ProfileSchema } from '@/components/seo/schema-components';
import { generateProfileSchema } from '@/lib/seo/dynamic-schema';
import { serializeSchema } from '@/lib/seo/schema';

// Mock function to fetch profile data (would be replaced with actual implementation)
async function fetchProfile(username: string) {
    return {
        id: `user-${username}`,
        username,
        displayName: username,
        bio: `Profile for ${username}`,
        joinedAt: new Date().toISOString(),
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://rant.example.com'}/profile/${username}`
    };
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
    const profile = await fetchProfile(params.username);

    return {
        title: `${profile.displayName}'s Profile`,
        description: profile.bio || `${profile.displayName}'s profile on Rant`,
        openGraph: {
            title: `${profile.displayName}'s Profile`,
            description: profile.bio || `${profile.displayName}'s profile on Rant`,
            type: 'profile',
            url: profile.url
        },
        twitter: {
            card: 'summary',
            title: `${profile.displayName}'s Profile`,
            description: profile.bio || `${profile.displayName}'s profile on Rant`
        }
    };
}

// Generate JSON-LD schema for the page
export async function generateJsonLd({ params }: { params: { username: string } }) {
    const schemas = await generateProfileSchema(params);
    return schemas.map(schema => ({
        __html: serializeSchema(schema)
    }));
}

// Profile page component
export default async function ProfilePage({ params }: { params: { username: string } }) {
    const profile = await fetchProfile(params.username);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rant.example.com';

    return (
        <div>
            <h1>{profile.displayName}'s Profile</h1>
            <p>{profile.bio}</p>
            <p>Joined: {new Date(profile.joinedAt).toLocaleDateString()}</p>

            {/* Include schema component */}
            <ProfileSchema profile={profile} baseUrl={baseUrl} />
        </div>
    );
}
