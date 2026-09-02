import { useEffect, useState } from 'react';
import { fetchHomeSections } from '../../lib/api';
import SliderBlock from './SliderBlock';
import TestimonialsBlock from './TestimonialsBlock';
import VideosBlock from './VideosBlock';
import TextBlock from './TextBlock';
import TextImageBlock from './TextImageBlock';
import PlansBlock from './PlansBlock';

const BLOCKS = {
    slider: SliderBlock,
    testimonials: TestimonialsBlock,
    videos: VideosBlock,
    text: TextBlock,
    text_image: TextImageBlock,
    plans: PlansBlock,
};

export default function HomeSections() {
    const [sections, setSections] = useState([]);

    useEffect(() => {
        fetchHomeSections()
            .then(({ data }) => setSections(data))
            .catch(() => setSections([]));
    }, []);

    return (
        <>
            {sections.map((section) => {
                const Block = BLOCKS[section.type];

                return Block ? <Block key={section.id} content={section.content} /> : null;
            })}
        </>
    );
}
