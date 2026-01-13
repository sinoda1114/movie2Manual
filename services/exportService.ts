import { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType } from "docx";
import saveAs from "file-saver";
import { GeneratedManual, FrameData } from '../types';

/**
 * Converts a base64 string to a Uint8Array for docx generation
 */
const base64ToUint8Array = (base64: string): Uint8Array => {
  try {
    const binaryString = window.atob(base64.split(',')[1]);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error("Error converting base64 to Uint8Array", e);
    return new Uint8Array(0);
  }
};

/**
 * Generates and downloads a .docx file from the manual data
 */
export const exportToWord = async (manual: GeneratedManual, frames: FrameData[]) => {
  const children: any[] = [];

  // 1. Title
  children.push(
    new Paragraph({
      text: manual.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  // 2. Overview
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "概要: ",
          bold: true,
        }),
        new TextRun(manual.overview),
      ],
      spacing: { after: 400 },
    })
  );

  // 3. Steps
  manual.steps.forEach((step, index) => {
    // Step Title
    children.push(
      new Paragraph({
        text: `手順 ${index + 1}: ${step.title}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    );

    // Image
    const frame = frames[step.frameIndex];
    if (frame && frame.dataUrl) {
      const imageBuffer = base64ToUint8Array(frame.dataUrl);
      if (imageBuffer.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 500, // max width roughly fit for A4
                  height: 281, // maintain ~16:9 ratio (500 * 9 / 16)
                },
              }),
            ],
            spacing: { after: 100 },
          })
        );
      }
    }

    // Description
    children.push(
      new Paragraph({
        text: step.description,
        spacing: { after: 300 },
      })
    );
  });

  // Create Document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  // Generate and Download
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${manual.title.replace(/\s+/g, '_')}_manual.docx`);
};