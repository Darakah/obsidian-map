import { writable } from 'svelte/store';

export const tags = writable('');
export const types = writable([]);
export const year = writable(0);