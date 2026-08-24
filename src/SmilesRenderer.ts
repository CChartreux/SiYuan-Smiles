// SmilesRenderer.ts
import {Dialog, fetchSyncPost, Protyle} from "siyuan";
import SmilesDrawer from "smiles-drawer";

export type AtomVisualization = "default" | "balls" | "allballs";
export type CarbonVisualization = "none" | "default" | "terminal" | "acyclic" | "all";
export type SmilesDrawerColorScheme = "dark" | "light";

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
    width: 350, height: 350, bondLength: 18, bondThickness: 0.8,
    shortBondLengthFactor: 0.2, bondSpacing: 4, fontSizeLarge: 8,
    showCarbons: "acyclic", explicitHydrogens: true, atomVisualization: "default",
    compactDrawing: false, isomeric: true,
};

const DEFAULT_REACTION_OPTIONS: SmilesReactionOptions = {
    spacing: 10,
    plus: {size: 5, thickness: 0.8},
    arrow: {length: 30, thickness: 1, headSize: 10, margin: 3},
};

export class SmilesRenderer {
    private smilesDrawer: InstanceType<typeof SmilesDrawer.SmiDrawer>;
    private readonly smilesMoleculeOptions: SmilesMoleculeOptions;
    private i18n: Record<string, string>;
    private readonly colorScheme: SmilesDrawerColorScheme;

    constructor(
        i18n: Record<string, string>,
        colorScheme: SmilesDrawerColorScheme = "dark",
        smilesMoleculeOptions?: SmilesMoleculeOptions,
        smilesReactionOptions?: SmilesReactionOptions,
    ) {
        this.i18n = i18n;
        this.colorScheme = colorScheme;
        this.smilesMoleculeOptions = {...DEFAULT_MOLECULE_OPTIONS, ...smilesMoleculeOptions};
        this.smilesDrawer = new SmilesDrawer.SmiDrawer(
            this.smilesMoleculeOptions,
            {...DEFAULT_REACTION_OPTIONS, ...smilesReactionOptions},
        );
    }

    private drawSmiles(smiles: string, target: SVGElement, onSuccess: () => void, onError: (err: string) => void) {
        this.smilesDrawer.draw(smiles, target, this.colorScheme, onSuccess, onError);
    }

    private getNotation(smiles: string): Promise<string> {
        return new Promise(resolve => {
            try {
                SmilesDrawer.parse(smiles,
                    (molecule: any) => resolve(molecule?.getFormula?.() ?? smiles),
                    () => resolve(smiles));
            } catch {
                resolve(smiles);
            }
        });
    }

    async saveSvgToSiYuan(svg: SVGSVGElement, imageScaling: number = 4): Promise<string> {
        const image = new Image();
        image.src = `data:image/svg+xml;utf8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
        await image.decode();

        const width = image.width * imageScaling;
        const height = image.height * imageScaling;

        const canvas = document.createElement("canvas");
        Object.assign(canvas, { width, height });
        canvas.getContext("2d")?.drawImage(image, 0, 0, width, height);

        const blob = await new Promise<Blob>((resolve) =>
            canvas.toBlob((b) => resolve(b!), "image/png"));

        const path = `assets/image-${Date.now()}.png`;
        const formData = new FormData();
        formData.append("path", `/data/${path}`);
        formData.append("file", blob);

        await fetchSyncPost("/api/file/putFile", formData);

        return path;
    }

    showSmilesDialog(initialSmiles: string, smilesInline: boolean, protyle: Protyle) {
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
            this.drawSmiles(inputElement.value, svgElement,
                () => {
                    const {width, height} = svgElement.viewBox.baseVal;
                    svgElement.style.width = `${width * 2}px`;
                    svgElement.style.height = `${height * 2}px`;
                },
                err => errorElement.textContent = err);
        };

        render();
        inputElement.oninput = render;

        inputElement.onkeydown = async (keyboardEvent) => {
            if (keyboardEvent.key !== "Enter") return;
            keyboardEvent.preventDefault();

            const svgElement = dialog.element.querySelector(".siyuan-smiles-svg") as SVGSVGElement;

            try {
                const [assetPath, notation] = await Promise.all([
                    this.saveSvgToSiYuan(svgElement),
                    this.getNotation(inputElement.value),
                ]);

                protyle.insert(`![Smiles](${assetPath} "${notation}")`, !smilesInline, true);

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