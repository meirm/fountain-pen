import { Editor, Transforms, Range, Path } from "slate";
import { Element, NodeEntry } from "slate";
import {
    CustomBaseElement,
    CustomElement,
    CustomText,
    HeadingElement,
    HeadingTypes,
    Headings,
    editorModes,
} from "../types";
import { ElementType } from "react";

function* getPreviousSiblings(
    editor: Editor,
    path: Path
): Generator<NodeEntry | undefined> {
    if (path.length === 0) {
        return undefined;
    }
    const parentPath = path.slice(0, path.length - 1);
    const currentSiblingNumber = path[path.length - 1];
    for (let i = currentSiblingNumber; i > 0; i--) {
        const entry = Editor.node(editor, parentPath.concat(i));
        yield entry;
    }
}

export const withCustomBehavior = (editor: Editor) => {
    /**
     * Is the current editor selection a range, that is the focus and the anchor are different?
     *
     * @returns {boolean} true if the current selection is a range.
     */
    editor.isSelectionExpanded = (): boolean => {
        return editor.selection ? Range.isExpanded(editor.selection) : false;
    };

    /**
     * Returns true if current selection is collapsed, that is there is no selection at all
     * (the focus and the anchor are the same).
     *
     * @returns {boolean} true if the selection is collapsed
     */
    editor.isSelectionCollapsed = (): boolean => {
        return !editor.isSelectionExpanded();
    };

    /**
     * Returns the first node at the current selection
     */
    editor.getCurrentNode = () => {
        if (editor.selection) {
            const [node, path] = Editor.node(editor, editor.selection);
            return node;
        }
    };

    editor.getCurrentNodePath = () => {
        const [, path] = Editor.parent(editor, editor.selection || [0]);
        return path;
    };

    // editor.isCollapsed = () => {
    //     const { selection } = editor;
    //     return !!(selection && Range.isCollapsed(selection));
    // };

    editor.getCurrentElement = () => {
        const { selection } = editor;
        if (!selection) return undefined;
        try {
            const [node] = Editor.parent(editor, editor.selection || [0]);
            if (Element.isElement(node)) {
                return node;
            }
        } catch (e) {
            console.log(e);
        }
    };

    editor.getCurrentElementText = () => {
        const element = editor.getCurrentElement();
        if (element && element.children.length) {
            let text = element.children
                .map((child) => (child as CustomText).text)
                .join("");
            return text;
        }
        return "";
    };

    editor.getCurrentElementType = () => {
        const [entry] = Editor.nodes(editor, {
            match: (n) => Element.isElement(n),
        });
        const [element] = entry;
        return (element as Element).type;
    };

    editor.isCurrentNodeHeadding = () => {
        const [entry] = Editor.nodes(editor, {
            match: (n) => Element.isElement(n),
        });
        const [element] = entry;
        return Headings.includes((element as HeadingElement).type);
    };

    editor.getSelectedText = (anchorOffset = 0, focusOffset?: any): string => {
        const { selection } = editor;

        if (selection) return Editor.string(editor, selection);

        return "";
    };

    editor.getLastHeadingBeforeSelection = () => {
        const { selection } = editor;

        if (!selection) return undefined;

        const [entry] = Editor.nodes(editor, {
            at: selection,
            match: (n) => Element.isElement(n),
        });
        const [element, path] = entry;
    };

    editor.getPreviousSibling = (types: string[]) => {
        const { selection } = editor;

        if (!selection) return undefined;

        const [entry] = Editor.nodes(editor, {
            at: selection,
            match: (n) => Element.isElement(n),
        });

        const [node, path] = entry;

        if (path.length === 0) {
            return;
        }

        const parentPath = path.slice(0, path.length - 1);
        const currentSiblingNumber = path[path.length - 1];

        for (let i = currentSiblingNumber; i >= 0; i--) {
            const entry = Editor.node(editor, parentPath.concat(i));
            const [n, p] = entry;
            if (Element.isElement(n) && types.some((t) => n.type === t)) {
                return entry;
            }
        }
    };

    return editor;
};

// Use CustomBehaviorEditor in your application
