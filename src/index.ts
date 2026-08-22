import {Plugin} from "siyuan";
import {SmilesRenderer} from "./SmilesRenderer";

// noinspection JSUnusedGlobalSymbols
export default class SmilesRendererPlugin extends Plugin {
    private smilesRenderer: SmilesRenderer;

    async onload() {
        // Initialize the SmilesDrawer instance during plugin load
        this.smilesRenderer = new SmilesRenderer();


        this.protyleSlash = [
            // Register a slash command to open the Dialog and paste SMILES inline
            {
            filter: ["insert", "chem", "smiles", "inline"],
            html: `<div class="b3-list-item__first"><span class="b3-list-item__text">${this.i18n.insertInlineSmiles}</span></div>`,
            id: "insert-inline-smiles",
            callback: (protyle) => {
                this.smilesRenderer.showSmilesDialog("n1ccccc1", true, protyle);
            },
        },
            // Register a slash command to open the Dialog and paste SMILES as a block
            {
            filter: ["insert", "chem", "smiles", "block"],
            html: `<div class="b3-list-item__first"><span class="b3-list-item__text">${this.i18n.insertSmilesBlock}</span></div>`,
            id: "insert-smiles-block",
            callback: (protyle) => {
                this.smilesRenderer.showSmilesDialog("n1ccccc1", false, protyle);
            },
        }];



    }

    onunload() {
        // Nothing to destroy
    }
}
