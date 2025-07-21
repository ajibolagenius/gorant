import React from 'react';
import { Metadata } from 'next';
import { RantSchema } from '@/components/seo/schema-components';
import { generateRantSchema } from '@/lib/seo/dynamic-schema';
import { serializeSchema } from '@/lib/seo/schema';

// Mock function to fetch rant data (would be replaced with actual implementation)
async function fetchRant(id: string) {
    return {
        id,
        title: `Rant #${id}`,
        content: 'This is a sample rant content.',
        mood: 'Angry',
        tags: ['sample', 'rant'],
        authorName: 'Anonymous User',
        publishedAt: new Date().toISOString(),
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://rant.example.com'}/rant/${id}`
    };
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const rant = await fetchRant(params.id);

    return {
        title: rant.title,
        description: rant.content.substring(0, 160),
        openGraph: {
            title: rant.title,
            description: rant.content.substring(0, 160),
            type: 'article',
            publishedTime: rant.publishedAt,
            tags: rant.tags
        },
        twitter: {
            card: 'summary_large_image',
            title: rant.title,
            description: rant.content.substring(0, 160)
        }
    };
}

// Generate JSON-LD schema for the page
export async function generateJsonLd({ params }: { params: { id: string } }) {
    const schemas = await generateRantSchema(params);
    return schemas.map(schema => ({
        __html: serializeSchema(schema)
    }));
}

// Rant page component
export default async function RantPage({ params }: { params: { id: string } }) {
    const rant = await fetchRant(params.id);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rant.example.com';

    return (
        <div>
            <h1>{rant.title}</h1>
            <p>{rant.content}</p>

            {/* Include schema component */}
            <RantSchema rant={rant} baseUrl={baseUrl} />
        </div>
    );
}
