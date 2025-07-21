export interface OgTemplateData {
    title: string;
    description?: string;
    author?: string;
    date?: string;
    imageUrl?: string;
    tags?: string[];
    mood?: string;
}

export type OgTemplate = React.FC<{
    data: OgTemplateData;
}>;
