"use client"

import React, { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Info, ChatCircleDots, CheckCircle, WarningCircle, XCircle } from "@phosphor-icons/react"

// Move components definition above Callout
const components: any = {
    callout({ node, ...props }: any) {
        return (
            <Callout type={node.data?.type} title={node.data?.title}>
                {props.children}
            </Callout>
        );
    },
};

function flattenChildren(children: React.ReactNode): string {
    if (children == null) return "";
    if (typeof children === "string") return children;
    if (Array.isArray(children)) return children.map(flattenChildren).join("");
    if (typeof children === "object" && 'props' in children && children.props) {
        return flattenChildren(children.props.children);
    }
    return "";
}

function Callout({ type, title, children }: { type: string, title?: string, children: React.ReactNode }) {
    let color = "bg-blue-50 border-blue-300 text-blue-900";
    let Icon = Info;
    if (type === "success") { color = "bg-green-50 border-green-300 text-green-900"; Icon = CheckCircle; }
    else if (type === "warning") { color = "bg-yellow-50 border-yellow-300 text-yellow-900"; Icon = WarningCircle; }
    else if (type === "danger") { color = "bg-red-50 border-red-300 text-red-900"; Icon = XCircle; }

    // Flatten children to markdown string
    const content = flattenChildren(children);

    // Avoid infinite recursion: do not render callouts inside callouts
    const nestedComponents: any = { ...components };
    delete nestedComponents.callout;

    return (
        <div className={`my-6 p-4 border-l-4 rounded-none ${color} flex items-start gap-3`}>
            <Icon className="w-6 h-6 mt-1 flex-shrink-0" weight="duotone" />
            <div>
                {title && <div className="font-bold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{title}</div>}
                <div className="font-body" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkCallout]} components={nestedComponents}>
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}

function remarkCallout() {
    // Custom plugin to parse > [!type] callouts
    return (tree: any) => {
        const { visit } = require("unist-util-visit");
        visit(tree, "blockquote", (node: any) => {
            if (
                node.children &&
                node.children[0] &&
                node.children[0].type === "paragraph" &&
                node.children[0].children[0] &&
                node.children[0].children[0].type === "text" &&
                /^\[!([a-zA-Z]+)\]/.test(node.children[0].children[0].value)
            ) {
                const match = node.children[0].children[0].value.match(/^\[!([a-zA-Z]+)\]\s*(.*)/)
                if (match) {
                    const type = match[1].toLowerCase();
                    const title = match[2] || undefined;
                    node.type = "callout";
                    node.data = { type, title };
                    node.children[0].children[0].value = ""; // Remove the [!type]
                }
            }
        });
    };
}

export default function AboutPage() {
    const [markdown, setMarkdown] = useState<string>("# About Us\n\n_Loading..._")
    useEffect(() => {
        fetch("/data/about.md")
            .then((res) => res.text())
            .then(setMarkdown)
            .catch(() => setMarkdown("# About Us\n\n_Could not load about file._"))
    }, [])
    return (
        <div className="container mx-auto max-w-3xl py-12 px-4">
            <div className="flex items-center gap-3 mb-10">
                <ChatCircleDots className="w-9 h-9 text-purple-600" weight="duotone" />
                <h1 className="text-3xl md:text-4xl font-bold font-heading tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    About Rant
                </h1>
            </div>
            <div className="bg-card/80 dark:bg-card/80 backdrop-blur rounded-none shadow-sm border-0 p-8">
                <div className="prose max-w-none font-body text-base prose-h2:mt-8 prose-h2:mb-3 prose-h3:mt-6 prose-h3:mb-2 prose-p:mb-4 prose-ul:mb-4 prose-blockquote:my-6 prose-hr:my-8" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkCallout]}
                        components={components}
                    >
                        {markdown}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    )
}
