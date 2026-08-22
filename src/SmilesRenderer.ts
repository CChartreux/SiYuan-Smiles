// SmilesRenderer.ts
import { Dialog, Protyle, fetchSyncPost } from "siyuan";
import SmilesDrawer from "smiles-drawer";

export type AtomVisualization = "default" | "balls" | "allballs";
export type CarbonVisualization = "none" | "default" | "terminal" | "acyclic" | "all";

export interface SmilesDrawerTheme {
    C: string; O: string; N: string; F: string; CL: string; BR: string;
    I: string; P: string; S: string; B: string; SI: string; H: string; BACKGROUND: string;
}

export interface SmilesMoleculeOptions {
    width?: number; height?: number; bondThickness?: number; bondLength?: number;
    shortBondLengthFactor?: number; bondSpacing?: number; atomVisualization?: AtomVisualization;
    isomeric?: boolean; debug?: boolean; showCarbons?: CarbonVisualization; terminalCarbons?: boolean;
    explicitHydrogens?: boolean; overlapSensitivity?: number; overlapResolutionIterations?: number;
    compactDrawing?: boolean; fontFamily?: string; fontSizeLarge?: number; fontSizeSmall?: number;
    padding?: number; experimentalSSSR?: boolean; themes?: SmilesDrawerTheme[];
}

export interface PlusOptions { size?: number; thickness?: number; }
export interface ArrowOptions { length?: number; thickness?: number; headSize?: number; margin?: number; }
export interface SmilesReactionOptions { spacing?: number; fontSize?: number; plus?: PlusOptions; arrow?: ArrowOptions; }

const DEFAULT_MOLECULE_OPTIONS: SmilesMoleculeOptions = {
    width: 350, height: 350, bondLength: 18, bondThickness: 0.8,
    shortBondLengthFactor: 0.2, bondSpacing: 4, fontSizeLarge: 8,
    showCarbons: "acyclic", explicitHydrogens: true, atomVisualization: "default",
    compactDrawing: false, isomeric: true,
};

const DEFAULT_REACTION_OPTIONS: SmilesReactionOptions = {
    spacing: 10,
    plus: { size: 5, thickness: 0.8 },
    arrow: { length: 30, thickness: 1, headSize: 10, margin: 3 },
};

export class SmilesRenderer {
    private smilesDrawer: InstanceType<typeof SmilesDrawer.SmiDrawer>;
    private readonly smilesMoleculeOptions: SmilesMoleculeOptions;
    private i18n: Record<string, string>;

    constructor(
        i18n: Record<string, string> = {},
        smilesMoleculeOptions?: SmilesMoleculeOptions,
        smilesReactionOptions?: SmilesReactionOptions,
    ) {
        this.i18n = i18n;
        this.smilesMoleculeOptions = { ...DEFAULT_MOLECULE_OPTIONS, ...smilesMoleculeOptions };
        this.smilesDrawer = new SmilesDrawer.SmiDrawer(
            this.smilesMoleculeOptions,
            { ...DEFAULT_REACTION_OPTIONS, ...smilesReactionOptions },
        );
    }

    private drawSmiles(smiles: string, target: SVGElement, onSuccess: () => void, onError: (err: string) => void): void {
        this.smilesDrawer.draw(smiles, target, "dark", onSuccess, onError);
    }

    private getNotation(smiles: string): Promise<string> {
        return new Promise(resolve => {
            try {
                SmilesDrawer.parse(smiles,
                    (molecule: any) => resolve(molecule?.getFormula?.() ?? smiles),
                    () => resolve(smiles));
            } catch { resolve(smiles); }
        });
    }

    private captureSvgFromDialog(dialog: Dialog, imageScaleFactor: number = 4): string {
        const svgElement = dialog.element.querySelector(".siyuan-smiles-svg") as SVGSVGElement;
        if (!svgElement) return "";

        const { x, y, width = 350, height = 350 } = svgElement.viewBox.baseVal;

        return `<svg xmlns="http://www.w3.org/2000/svg" width="${width * imageScaleFactor}" height="${height * imageScaleFactor}" viewBox="${x} ${y} ${width} ${height}">${svgElement.innerHTML}</svg>`;
    }

    private async svgToPngBlob(svgXml: string): Promise<Blob> {
        const imageElement = new Image();
        imageElement.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgXml);
        await imageElement.decode();

        const canvas = document.createElement("canvas");
        canvas.width = imageElement.naturalWidth || imageElement.width;
        canvas.height = imageElement.naturalHeight || imageElement.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to get 2D canvas context");

        ctx.drawImage(imageElement, 0, 0);

        return new Promise((resolve, reject) =>
            canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Failed to create PNG blob")), "image/png"));
    }

    private async uploadToSiyuan(blob: Blob, filename: string): Promise<string> {
        const formData = new FormData();
        const fullPath = `/data/assets/${filename}`;

        formData.append("path", fullPath);
        formData.append("file", blob, filename);
        formData.append("isDir", "false");
        formData.append("modTime", Math.floor(Date.now() / 1000).toString());

        const result = await fetchSyncPost("/api/file/putFile", formData);
        if (result.code !== 0) {
            throw new Error(result.msg || "Failed to save image to Siyuan");
        }

        return `assets/${filename}`;
    }

    showSmilesDialog(initialSmiles: string, smilesInline: boolean, protyle: Protyle): void {
        const dialog = new Dialog({
            title: this.i18n.dialogTitle || "Chemical Structure Viewer",
            content: `<div class="smiles-dialog-container" style="display:flex; flex-direction:column; align-items:center; gap:8px; padding:16px; box-sizing:border-box;">
                <svg class="siyuan-smiles-svg" width="200px" height="200px"></svg>
                <div class="smiles-error" style="color:#f44336; width:100%;"></div>
                <input class="b3-text-field smiles-input" value="${initialSmiles}" style="width:100%; box-sizing:border-box;" />
            </div>`,
            width: "auto",
        });

        const inputElement = dialog.element.querySelector(".smiles-input") as HTMLInputElement;
        const errorElement = dialog.element.querySelector(".smiles-error") as HTMLElement;
        const svgElement = dialog.element.querySelector(".siyuan-smiles-svg") as SVGSVGElement;

        const render = () => {
            errorElement.textContent = "";
            this.drawSmiles(inputElement.value.trim(), svgElement,
                () => {
                    const { width, height } = svgElement.viewBox.baseVal;
                    svgElement.style.width = `${width * 2}px`;
                    svgElement.style.height = `${height * 2}px`;
                },
                err => errorElement.textContent = err);
        };

        render();
        inputElement.oninput = render;

        inputElement.onkeydown = async e => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            const rawSmiles = inputElement.value.trim();
            const svgXml = this.captureSvgFromDialog(dialog);
            if (!svgXml) return;

            try {
                const pngBlob = await this.svgToPngBlob(svgXml);
                const notation = await this.getNotation(rawSmiles);
                const filename = `smiles-${Date.now()}.png`;
                const assetPath = await this.uploadToSiyuan(pngBlob, filename);
                const escapedTitle = notation.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

                if (smilesInline) protyle.insert(`![Smiles](${assetPath} "${escapedTitle}")`, false, true);
                else protyle.insert(`![Smiles](${assetPath} "${escapedTitle}")`, true, true);

                dialog.destroy();
            } catch (err) {
                errorElement.textContent = String(err);
            }
        };

        requestAnimationFrame(() => {
            inputElement.focus();
            inputElement.select();
        });
    }
}