"use client";
// ArticleEditor.tsx

import {
    useState,
    useMemo,
    useCallback,
    useEffect,
    createContext,
} from "react";
import pipe from "lodash/fp/pipe";
import { withEditableVoids } from "./plugins/withEditableVoids";
import { createEditor, Transforms, Editor, Descendant } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import {
    CustomElementProps,
    LeafProps,
    NotesElement,
    editorModes,
} from "./types";
import { ElementNode, LeafNode } from "./renderers";
import { withHistory } from "slate-history";
import { withCustomBehavior } from "./plugins/withCustomBehavior";
import EditorModeSwitch from "../editor_mode_switch";

const createEditorWithPlugins = pipe(
    withCustomBehavior,
    withEditableVoids,
    withReact,
    withHistory
);

const localContentKey = "localEditorContent";

export const ModeContext = createContext<editorModes>("edit");

const fallbackValue: Descendant[] = [
    {
        type: "title",
        children: [{ text: "Your Article Heading" }],
    },
    {
        type: "paragraph",
        children: [{ text: "Start writing your article..." }],
    },
];
const ArticleEditor = () => {
    const [winReady, setWinReady] = useState(false);

    useEffect(() => {
        setWinReady(true);
    }, []);

    const editor = useMemo(() => createEditorWithPlugins(createEditor()), []);

    const [value, setValue] = useState<Descendant[]>(fallbackValue);

    useEffect(() => {
        const stored = localStorage.getItem(localContentKey);
        const content = stored ? JSON.parse(stored) : fallbackValue;
        setValue(content);
        editor.children = content;
    }, []);

    const saveOnChange = (value: Descendant[]) => {
        const content = JSON.stringify(value);
        localStorage.setItem(localContentKey, content);
    };

    // Editor Mode
    const [editorMode, setMode] = useState<editorModes>("edit");

    const handleModeChange = () => {
        let newMode: editorModes = "edit";
        if (editorMode === "edit") {
            newMode = "outline";
        }
        if (editorMode === "outline") {
            newMode = "readonly";
        }
        if (editorMode === "readonly") {
            newMode = "edit";
        }
        setMode(newMode);
    };
    //

    const renderElement = useCallback(
        (props: CustomElementProps) => <ElementNode {...props} />,
        []
    );

    const renderLeaf = useCallback(
        (props: LeafProps) => <LeafNode {...props} />,
        []
    );

    return (
        <>
            {winReady && (
                <Slate
                    editor={editor}
                    initialValue={value}
                    onChange={saveOnChange}
                >
                    <ModeContext.Provider value={editorMode}>
                        <div className="ml-5 mr-0">
                            <EditorModeSwitch
                                className="mt-5 mb-5"
                                onClick={handleModeChange}
                            />
                            <Editable
                                renderElement={renderElement}
                                renderLeaf={renderLeaf}
                                onKeyDown={(event) =>
                                    handleKeyDown(event, editor)
                                }
                                className="focus:outline-none"
                                readOnly={
                                    editorMode === "readonly" ? true : false
                                }
                            />
                        </div>
                    </ModeContext.Provider>
                </Slate>
            )}
        </>
    );
};

const handleKeyDown = (event: React.KeyboardEvent, editor: Editor) => {
    if (event.key === "Enter") {
        event.preventDefault();
        Transforms.insertNodes(editor, {
            type: "paragraph",
            children: [{ text: "" }],
        });
    }
    if (event.ctrlKey) {
        event.preventDefault();
        switch (event.key) {
            case "1": {
                Transforms.setNodes(editor, { type: "heading1" });
                break;
            }
            case "2": {
                Transforms.setNodes(editor, { type: "heading2" });
                break;
            }
            case "3": {
                Transforms.setNodes(editor, { type: "heading3" });
                break;
            }
            case "0": {
                Transforms.setNodes(editor, { type: "paragraph" });
                break;
            }
            case "n": {
                insertNotes(editor);
                break;
            }
            default: {
                break;
            }
        }
    }
};

const insertNotes = (editor: Editor) => {
    const notes: NotesElement = {
        type: "notes",
        children: [{ text: "" }],
        notes: "",
    };
    Transforms.insertNodes(editor, notes);
    Transforms.insertNodes(editor, {
        type: "paragraph",
        children: [{ text: "" }],
    });
};

export default ArticleEditor;
