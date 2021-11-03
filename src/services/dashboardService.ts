import axios from 'axios';
import { ref } from 'vue';

export const posts = ref([]);
export const createPostModalStatus = ref<boolean>(false);
export const showComingSoonToUhuru = ref<boolean>(false)

export const fetchPosts = async () => {
    try {
        //https://news.threefoldconnect.jimber.org/feed.json
        const response = await axios.get('./posts.json');
        posts.value = response.data.items;
        if (posts.value.length > 0) await addLikesAndComments();
    } catch (e) {
        console.log(e);
    }
};

const addLikesAndComments = async () => {
    const { data: names } = await axios.get('./names.json');
    //Add random likes and comments
    posts.value = posts.value.map(post => {
        return {
            ...post,
            likes: Math.floor(Math.random() * 39) + 4,
            comments: Math.floor(Math.random() * 10) + 3,
            persons: [names[Math.floor(Math.random() * names.length)], names[Math.floor(Math.random() * names.length)]],
            author: names[Math.floor(Math.random() * names.length)],
        };
    });
};
