import { getCollection } from 'astro:content';
export const getLessons = async () => (await getCollection('lessons')).sort((a, b) => a.data.lesson - b.data.lesson);
export const sitePath = (path: string = '/') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\/+/, '')}`;
export const lessonUrl = (slug: string) => sitePath(`/lessons/${slug}/`);
export const pad = (n: number) => String(n).padStart(2, '0');
export const author = '守望先锋竞技学教父';
export const brand = '守望先锋竞技学宝典';
