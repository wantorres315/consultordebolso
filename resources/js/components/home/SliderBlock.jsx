import { useEffect, useState } from 'react';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocale } from '../../context/LocaleContext';
import { resolveLocalizedText } from '../../lib/localizedContent';

export default function SliderBlock({ content }) {
    const { locale } = useLocale();
    const slides = (content.slides ?? []).filter((slide) => slide.image_url);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (slides.length < 2) return undefined;

        const timer = setInterval(() => {
            setIndex((current) => (current + 1) % slides.length);
        }, 6000);

        return () => clearInterval(timer);
    }, [slides.length]);

    if (slides.length === 0) return null;

    const slide = slides[index % slides.length];
    const slideTitle = resolveLocalizedText(slide.title, locale);
    const slideSubtitle = resolveLocalizedText(slide.subtitle, locale);
    const slideAlt = resolveLocalizedText(slide.image_alt, locale);

    const Wrapper = slide.link_url ? 'a' : 'div';
    const wrapperProps = slide.link_url ? { href: slide.link_url } : {};

    return (
        <section className="w-full max-w-6xl py-8">
            <div className="relative overflow-hidden rounded-3xl bg-surface shadow-sm shadow-black/5">
                <Wrapper {...wrapperProps} className="block">
                    <img
                        src={slide.image_url}
                        alt={slideAlt || slideTitle}
                        className="h-72 w-full object-cover sm:h-96"
                    />
                </Wrapper>

                {(slideTitle || slideSubtitle) && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white sm:p-8">
                        {slideTitle && <h3 className="text-xl font-semibold sm:text-2xl">{slideTitle}</h3>}
                        {slideSubtitle && <p className="mt-1 text-sm opacity-90 sm:text-base">{slideSubtitle}</p>}
                    </div>
                )}

                {slides.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => setIndex((current) => (current - 1 + slides.length) % slides.length)}
                            aria-label="Previous"
                            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink hover:bg-white"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIndex((current) => (current + 1) % slides.length)}
                            aria-label="Next"
                            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink hover:bg-white"
                        >
                            <FontAwesomeIcon icon={faChevronRight} className="h-3.5 w-3.5" />
                        </button>

                        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                            {slides.map((_, dotIndex) => (
                                <button
                                    key={dotIndex}
                                    type="button"
                                    onClick={() => setIndex(dotIndex)}
                                    aria-label={`Slide ${dotIndex + 1}`}
                                    className={`h-1.5 rounded-full transition-all ${
                                        dotIndex === index % slides.length ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                                    }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
