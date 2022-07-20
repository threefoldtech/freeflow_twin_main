import { HTMLElement } from 'node-html-parser';

export const getURLTitle = (data: HTMLElement) => {
    const ogTitle = data.querySelector('meta[property="og:title"]');
    if (ogTitle != null) {
        return ogTitle.getAttribute('content');
    }
    const twitterTitle = data.querySelector('meta[name="twitter:title"]');
    if (twitterTitle != null) {
        return twitterTitle.getAttribute('content');
    }
    const docTitle = data.getAttribute('title');
    if (docTitle != null) {
        return docTitle;
    }
    const h1El = data.querySelector('h1');
    const h1 = h1El ? h1El.innerHTML : null;
    if (h1 != null) {
        return h1;
    }
    const h2El = data.querySelector('h2');
    const h2 = h2El ? h2El.innerHTML : null;
    if (h2 != null) {
        return h2;
    }
    return 'Title not found';
};

export const getURLDescription = (data: any) => {
    const ogDescription = data.querySelector('meta[property="og:description"]');
    if (ogDescription != null) {
        return ogDescription.getAttribute('content');
    }
    const twitterDescription = data.querySelector('meta[name="twitter:description"]');
    if (twitterDescription != null) {
        return twitterDescription.getAttribute('content');
    }
    const metaDescription = data.querySelector('meta[name="description"]');
    if (metaDescription != null) {
        return metaDescription.getAttribute('content');
    }
    const paragraphs = data.querySelectorAll('p');
    let fstVisibleParagraph = null;
    for (let i = 0; i < paragraphs.length; i++) {
        if (
            // if object is visible in dom
            paragraphs[i].offsetParent !== null
        ) {
            fstVisibleParagraph = paragraphs[i].textContent;
            break;
        }
    }
    return fstVisibleParagraph;
};
