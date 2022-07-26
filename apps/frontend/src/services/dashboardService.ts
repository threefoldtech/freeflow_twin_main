import axios from 'axios';
import { ref } from 'vue';

export const posts = ref([]);
export const createPostModalStatus = ref<boolean>(false);
export const showComingSoonToUhuru = ref<boolean>(false);
