// ==UserScript==
// @name         Joonko BitBucket Conventional Comments
// @version      1.0.1
// @description  Adds label to code review comments
// @author       Itai Soudry
// @match        https://bitbucket.org/joonkodev/*/pull-requests/*
// @downloadURL  https://github.com/itaisoudry/ConventionalComments/blob/main/Joonko%20BitBucket%20Conventional%20Comments.user.js
// @updateURL    https://github.com/itaisoudry/ConventionalComments/blob/main/Joonko%20BitBucket%20Conventional%20Comments.user.js
// @grant        none
// ==/UserScript==

document.addEventListener('click', (e) => {
    clickEventHandler(e);
});

const LABELS = {
    "praise": "#35F252",
    "nitpick": "#29D1FF",
    "suggestion": "#FC8A00",
    "issue": "#FB067A",
    "todo": "#FCF21A",
    "question": "#1994FF",
    "thought": "#35F2BD",
    "chore": "#BA19FC",
    "typo": "#99EF43",
    "polish": "#F6E5DF",
    "quibble": "#B28474",
    "MENO": "#DDE006",
    "TEST": "#AAA000"
}
const DECORATIONS = {"(non-blocking)": "#9EFE00", "(blocking)": "#FB0001", "(if-minor)": "#FAFE04"}

function clickEventHandler(e) {
    if (e.target.innerText === 'Save') {
        setTimeout(() => parseConventionalCommits(), 1000);
    }
}

const parsedCommentIds = [];

function parseConventionalCommits() {
    const commentDivs = document.querySelectorAll('[id^="comment-"]');

    commentDivs.forEach(div => {
        let textNode = div.childNodes[1].childNodes[0].childNodes[1];

        if (!parsedCommentIds.includes(div.id)) {
            const divText = textNode.innerText;
            const comment = parse(divText);

            if (comment && divText.includes(":")) {
                injectLabelAndDecoration(textNode, comment);
                parsedCommentIds.push(div.id);
            }
        }
    });
}

function injectLabelAndDecoration(textNode, comment) {
    if (comment.label && textNode.innerText.includes(comment.label)) {
        textNode = inject(textNode, comment.label, LABELS[comment.label]);

        if (comment.decoration) {
            inject(textNode, comment.decoration, DECORATIONS[comment.decoration]);
        }
    }
}

function parse(text) {
    const lines = text.split("\n");
    const subjectLine = lines[0];
    const splitedText = subjectLine.split(":");
    const labelAndDecoration = splitedText[0].split(" ");
    const label = labelAndDecoration[0];
    const decoration = labelAndDecoration[1];

    const response = {};

    if (LABELS[label]) {
        response.label = label;

        if (DECORATIONS[decoration]) {
            response.decoration = decoration;
        }

        return response
    }

    return null;
}

function inject(textNode, label, color) {
    if (label && color) {
        const spanToInject = `<span style="background-color:${color}; border-radius:0.375em; padding: 0.2rem 0.5rem;">${label}</span>`;
        textNode.innerHTML = textNode.innerHTML.replace(label, spanToInject);
    }

    return textNode;
}

const descriptionInterval = setInterval(() => {
    console.log('description interval');
    if (document.querySelector('[aria-label="Diffs"]')) {
        parseConventionalCommits();
        clearInterval(descriptionInterval);
    }
}, 500);

const commentsInterval = setInterval(() => {
    if (document.querySelector('.bitkit-diff-inline-content-container')) {
        parseConventionalCommits();
        clearInterval(commentsInterval);
    }
}, 500);
