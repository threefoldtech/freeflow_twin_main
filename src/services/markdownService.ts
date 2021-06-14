import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
});

export const renderMarkdown = content => {
    return md.render(content);
};
