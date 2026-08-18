import {Plugin} from "siyuan";
import {SmilesRenderer} from "./SmilesRenderer";

// noinspection JSUnusedGlobalSymbols
export default class SmilesRendererPlugin extends Plugin {
    private smilesRenderer: SmilesRenderer;

    async onload() {
        // Initialize the SmilesDrawer instance during plugin load
        this.smilesRenderer = new SmilesRenderer();

        // Register a slash command to open the Dialog
        this.protyleSlash = [{
            filter: ["insert", "chem", "smiles"],
            html: `<div class="b3-list-item__first"><span class="b3-list-item__text">${this.i18n.insertSmilesDiagram}</span></div>`,
            id: "insert-smiles-dialog",
            callback: (protyle) => {
                this.smilesRenderer.showSmilesDialog("n1ccccc1", protyle);
            },
        }];
    }

    onunload() {
        // Nothing to destroy
    }
}
