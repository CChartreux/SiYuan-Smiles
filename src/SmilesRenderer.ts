// SmilesRenderer.ts
import {Dialog} from "siyuan";
import SmilesDrawer from "smiles-drawer";

export type AtomVisualization = "default" | "balls" | "allballs";
export type CarbonVisualization = "none" | "default" | "terminal" | "acyclic" | "all";

export interface SmilesDrawerTheme {
    C: string;
    O: string;
    N: string;
    F: string;
    CL: string;
    BR: string;
    I: string;
    P: string;
    S: string;
    B: string;
    SI: string;
    H: string;
    BACKGROUND: string;
}

export interface SmilesMoleculeOptions {
    width?: number;
    height?: number;
    bondThickness?: number;
    bondLength?: number;
    shortBondLengthFactor?: number;
    bondSpacing?: number;
    atomVisualization?: AtomVisualization;
    isomeric?: boolean;
    debug?: boolean;
    showCarbons?: CarbonVisualization;
    terminalCarbons?: boolean;
    explicitHydrogens?: boolean;
    overlapSensitivity?: number;
    overlapResolutionIterations?: number;
    compactDrawing?: boolean;
    fontFamily?: string;
    fontSizeLarge?: number;
    fontSizeSmall?: number;
    padding?: number;
    experimentalSSSR?: boolean;
    themes?: SmilesDrawerTheme[];
}

export interface PlusOptions {
    size?: number;
    thickness?: number;
}

export interface ArrowOptions {
    length?: number;
    thickness?: number;
    headSize?: number;
    margin?: number;
}

export interface SmilesReactionOptions {
    spacing?: number;
    fontSize?: number;
    plus?: PlusOptions;
    arrow?: ArrowOptions;
}

const DEFAULT_MOLECULE_OPTIONS: SmilesMoleculeOptions = {
    width: 350,
    height: 350,
    bondLength: 18,
    bondThickness: 0.8,
    shortBondLengthFactor: 0.2,
    bondSpacing: 4,
    fontSizeLarge: 8,
    showCarbons: "acyclic",
    explicitHydrogens: true,
    atomVisualization: "default",
};

const DEFAULT_REACTION_OPTIONS: SmilesReactionOptions = {
    spacing: 10,
    plus: {
        size: 5,
        thickness: 0.8,
    },
    arrow: {
        length: 30,
        thickness: 1,
        headSize: 10,
        margin: 3,
    },
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
        this.smilesMoleculeOptions = {...DEFAULT_MOLECULE_OPTIONS, ...smilesMoleculeOptions};
        this.smilesDrawer = new SmilesDrawer.SmiDrawer(this.smilesMoleculeOptions, {
            ...DEFAULT_REACTION_OPTIONS,
            smilesReactionOptions,
        });
    }

    private drawSmiles(
        smiles: string,
        target: SVGElement,
        onSuccess: () => void,
        onError: (err: string) => void,
    ): void {
        this.smilesDrawer.draw(smiles, target, "dark", onSuccess, onError);
    }

    async captureSvgFromDialog(dialog: Dialog) {
        const svgElement = dialog.element.querySelector(".siyuan-smiles-svg") as SVGSVGElement;
        const viewBox = svgElement.viewBox.baseVal;
        const imageScaleFactor = 4;

        const xOffset = viewBox.x,
            yOffset = viewBox.y,
            width = viewBox.width || 350,
            height = viewBox.height || 350;

        const xml = `<svg xmlns="http://www.w3.org/2000/svg" width="${width * imageScaleFactor}" height="${
            height * imageScaleFactor
        }" viewBox="${xOffset} ${yOffset} ${width} ${height}">${svgElement.innerHTML}</svg>`;

        const imageElement = new Image();
        imageElement.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
        await imageElement.decode();

        const canvas = document.createElement("canvas");
        canvas.width = width * imageScaleFactor;
        canvas.height = height * imageScaleFactor;
        canvas.getContext("2d")?.drawImage(imageElement, 0, 0);

        canvas.toBlob(blob => {
            if (blob) navigator.clipboard.write([new ClipboardItem({"image/png": blob})]);
        });
    }

    showSmilesDialog(initialSmiles: string): Dialog {
        const dialog = new Dialog({
            title: this.i18n.dialogTitle || "Chemical Structure Viewer",
            content:
                `<div class="smiles-dialog-container" style="display:flex; flex-direction:column; align-items:center; gap:8px; padding:16px; box-sizing:border-box;">
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
            errorElement.style.color = "#f44336";

            this.drawSmiles(
                inputElement.value.trim(),
                svgElement,
                () => {
                    const {width: viewBoxWidth, height: viewBoxHeight} = svgElement.viewBox.baseVal;

                    svgElement.style.width = `${viewBoxWidth * 2}px`;
                    svgElement.style.height = `${viewBoxHeight * 2}px`;
                },
                err => errorElement.textContent = err,
            );
        };

        render();
        inputElement.oninput = render;
        inputElement.onkeydown = e => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.captureSvgFromDialog(dialog).then(() => {
                    errorElement.style.color = "#4caf50";
                    errorElement.textContent = this.i18n.copiedToClipboard || "Copied SVG to clipboard!";
                });
            }
        };

        requestAnimationFrame(() => {
            inputElement.focus();
            inputElement.select();
        });

        return dialog;
    }
}
