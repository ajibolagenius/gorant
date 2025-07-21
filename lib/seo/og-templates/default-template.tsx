import { OgTemplateData } from '@/types/seo';
import { BaseTemplate } from './base-template';

/**
 * Default template for Open Graph images
 * Used when no specific template is available
 */
export const DefaultTemplate = ({ data }: { data: OgTemplateData }) => {
    return (
        <BaseTemplate data={data}>
            {/* Additional content specific to default template can go here */}
        </BaseTemplate>
    );
};
