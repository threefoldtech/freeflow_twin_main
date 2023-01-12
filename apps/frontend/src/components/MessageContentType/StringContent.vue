<template>
    <div class="flex flex-col pt-2 pl-4 pb-2 pr-8">
        <span class="break-all text-sm whitespace-pre-wrap" v-html="body"></span>
        <div v-if="previewUrl" class="pl-4 border-l-2 border-gray-400 my-message:border-icon">
            <a :href="hyperlink" class="flex items-center font-normal capitalize">
                <img
                    width="32"
                    height="32"
                    class="rounded-full mr-3"
                    alt="logo"
                    :src="getFavIconOfSite(previewUrl.link)"
                />
                <div class="flex flex-col">
                    <h3>{{ previewUrl.title }}</h3>
                    <p>{{ previewUrl.description }}</p>
                </div>
            </a>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { ref, onBeforeMount } from 'vue';
    import DOMPurify from 'dompurify';
    import emoji from 'node-emoji';
    import { getPreview } from '@/store/chatStore';
    import { QuoteBodyType } from '@/types';
    import { useAuthState } from '@/store/authStore';

    interface IProp {
        message: {
            body: string | QuoteBodyType | number;
        };
    }

    const props = defineProps<IProp>();
    const previewUrl = ref<{ title: string; description: string; link: string }>();

    let { body } = props.message;
    if (typeof body === 'object') body = body.message;
    if (typeof body === 'number') body = body.toString();

    onBeforeMount(async () => {
        if (isValidURL(String(body))) {
            try {
                const response = await getPreview(getLinkFromString(String(body)));
                previewUrl.value = response[0];
            } catch (error) {
                return;
            }
        }
    });

    const hyperlink = ref(null);

    const makeLinksFromUrls = (message: string) => {
        if (!message) return;

        const urlRegex =
            /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

        return message.replace(urlRegex, url => {
            hyperlink.value = url;
            if (!url.match('^https?:\/\/')) hyperlink.value = 'http://' + url;

            return `${`<a href="${encodeURI(hyperlink.value)}" target="_blank" rel="noopener noreferrer"> ${encodeURI(
                url
            )} </a>`}`;
        });
    };

    const replacer = (match: string) => emoji.emojify(match);
    const words = body.split(' ');
    const me = useAuthState().user.id;

    const bodyReplacer = (oldBody: string) => {
        oldBody = oldBody.replace(/(:.*:)/g, replacer);
        oldBody = oldBody.replaceAll(/[<>]/g, '&gt');
        words.map(word => {
            const iAmTagged = word.startsWith('@') && word.slice(1) === me;
            const spanTag = `<span class="bg-blue-400 text-white p-1 text-sm rounded-sm cursor-pointer hover:bg-blue-500">${word}</span>`;
            if (iAmTagged) oldBody = oldBody.replace(word, spanTag);
        });

        oldBody = makeLinksFromUrls(oldBody);
        return oldBody;
    };

    body = bodyReplacer(body);
    body = DOMPurify.sanitize(body);

    const getLinkFromString = (body: string) => {
        const regex = /href="([^"]*)/;

        if (body.match(regex)[1] != null) return body.match(regex)[1];
        return null;
    };

    const isValidURL = (url: string) => {
        const res = url.match(
            /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
        );
        return res !== null;
    };

    const getFavIconOfSite = (link: string) => {
        return `https://www.google.com/s2/favicons?sz=64&domain_url=${link}`;
    };
</script>

<style></style>
