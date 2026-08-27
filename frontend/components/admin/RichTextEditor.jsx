"use client";

import { useMemo } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  RemoveFormat,
  Link,
  LinkImage,
  AutoLink,
  List,
  BlockQuote,
  HorizontalLine,
  Alignment,
  Indent,
  IndentBlock,
  Table,
  TableToolbar,
  MediaEmbed,
  Autoformat,
  AutoImage,
  PasteFromOffice,
  TextTransformation,
  Image,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,
  ImageInsert,
  ImageUpload,
  Font,
  SourceEditing,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import { uploadsApi } from "@/lib/adminApi";

/**
 * Route CKEditor image uploads through our authenticated /apis/admin/uploads
 * endpoint and map the response ({ data: { url } }) to what CKEditor expects
 * ({ default: url }).
 */
function UploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => ({
    upload: async () => {
      const file = await loader.file;
      const res = await uploadsApi.upload(file);
      return { default: res.data.url };
    },
    abort() {},
  });
}

export default function RichTextEditor({ value, onChange, placeholder }) {
  const config = useMemo(
    () => ({
      licenseKey: "GPL",
      plugins: [
        Essentials, Paragraph, Heading,
        Bold, Italic, Underline, Strikethrough, RemoveFormat,
        Link, LinkImage, AutoLink, List, BlockQuote, HorizontalLine,
        Alignment, Indent, IndentBlock,
        Table, TableToolbar,
        MediaEmbed, Autoformat, AutoImage, PasteFromOffice, TextTransformation,
        Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageInsert, ImageUpload,
        Font, SourceEditing,
      ],
      extraPlugins: [UploadAdapterPlugin],
      toolbar: {
        items: [
          "undo", "redo", "|",
          "sourceEditing", "|",
          "heading", "|",
          "fontSize", "fontColor", "fontBackgroundColor", "|",
          "bold", "italic", "underline", "strikethrough", "removeFormat", "|",
          "link", "insertImage", "mediaEmbed", "insertTable", "blockQuote", "horizontalLine", "|",
          "alignment", "|",
          "bulletedList", "numberedList", "outdent", "indent",
        ],
        shouldNotGroupWhenFull: true,
      },
      heading: {
        options: [
          { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
          { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
          { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
          { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
        ],
      },
      image: {
        toolbar: [
          "imageTextAlternative", "toggleImageCaption", "|",
          "imageStyle:inline", "imageStyle:block", "imageStyle:side", "|",
          "resizeImage",
        ],
      },
      table: {
        contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
      },
      // Emit the actual embed HTML (iframe) into the saved content so it renders
      // on the public page (the public renderer sanitises but allows iframes).
      mediaEmbed: { previewsInData: true },
      link: {
        addTargetToExternalLinks: true,
      },
      placeholder: placeholder || "Write your article…",
    }),
    [placeholder]
  );

  return (
    <div className="ck-blog-editor">
      <CKEditor
        editor={ClassicEditor}
        data={value || ""}
        config={config}
        onChange={(_evt, editor) => onChange(editor.getData())}
      />
      <style jsx global>{`
        .ck-blog-editor .ck-editor__editable {
          min-height: 340px;
          max-height: 60vh;
        }
        .ck-blog-editor .ck.ck-editor {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
