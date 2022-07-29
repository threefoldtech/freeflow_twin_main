<template>
    <div class="flex flex-col pt-2 pl-4 pb-2 pr-8">
        <span class="break-all text-sm" v-html="body"></span>
        <div
            v-if="!Object.keys(previewUrl).length == 0"
            class="pl-4 border-l-2 border-gray-400 my-message:border-icon"
        >
            <a :href="hyperlink" class='flex items-center font-normal capitalize'>
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
    import { computed, onMounted, ref, onBeforeMount } from 'vue';
    import DOMPurify from 'dompurify';
    import { marked } from 'marked';
    import emoji from 'node-emoji';
    import { getPreview } from '@/store/chatStore';

    interface IProp {
        message: {
            body: string;
        };
    }

    const props = defineProps<IProp>();

    let hyperlink = ref(null);

    let { body } = props.message;
    const replacer = (match: string) => emoji.emojify(match);
    const words = body.split(' ');

    const previewUrl = ref([]);

    const makeLinksFromUrls = (message: string) => {
        if (!message) return;

        const urlRegex =
            /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

        return message.replace(urlRegex, url => {
            hyperlink.value = url;
            if (!hyperlink.value.match('^https?:\/\/')) {
                hyperlink.value = 'http://' + hyperlink.value;
            }
            return `${`<a href="${encodeURI(hyperlink.value)}" target="_blank" rel="noopener noreferrer"> ${encodeURI(
                url
            )} </a>`}`;
        });
    };

    const bodyReplacer = (oldBody: string) => {
        oldBody = oldBody.replace(/(:.*:)/g, replacer);
        oldBody = oldBody.replaceAll('<', '&lt');
        oldBody = oldBody.replaceAll('>', '&gt');
        words.map(word =>
            word.startsWith('@')
                ? (oldBody = oldBody.replace(
                      word,
                      `<span class="bg-blue-400 text-white p-1 text-sm rounded-sm cursor-pointer hover:bg-blue-500">${word}</span>`
                  ))
                : (oldBody = oldBody)
        );

        oldBody = makeLinksFromUrls(oldBody);
        return oldBody;
    };

    body = bodyReplacer(body);
    body = DOMPurify.sanitize(body);

    const getLinkFromString = (body: string) => {
        const regex = /href="([^"]*)/;

        if (body.match(regex)[1] != null) {
            return body.match(regex)[1];
        } else {
            return null;
        }
    };

    const isValidURL = url => {
        var res = url.match(
            /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
        );
        return res !== null;
    };

    onBeforeMount(async () => {
        if (isValidURL(body)) {
            try {
                const response = await getPreview(getLinkFromString(body));
                previewUrl.value = response[0];
            } catch (error) {
                return;
            }
        }
    });

    const getFavIconOfSite = (link: string) => {
        return `http://www.google.com/s2/favicons?sz=64&domain_url=${link}`;
    };
</script>

<style></style>
