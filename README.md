# SiYuan SMILES Renderer

A plugin for SiYuan Note that dynamically generates 2D chemical structure diagrams from SMILES strings using smiles-drawer.

**Features**

* Slash Command Integration: Quickly open the viewer using `/chem`, `/smiles`, or `/insert`.
* Live Interactive Preview: Renders chemical structures in real time as you type or edit SMILES strings.
* High-DPI Clipboard Export: Pressing Enter rasterizes the rendered vector diagram at 4x scaling and copies a PNG directly to your clipboard.

**Usage**

* Type `/smiles` in any Protyle document block and select Insert SMILES Diagram.
* Input or paste your SMILES string (e.g., `n1ccccc1`, `CC(=O)OC1=CC=CC=C1C(=O)O`).
* Press Enter to copy the high-resolution structure image to your clipboard and paste it into your note.

## Citation

This project builds upon **smiles-drawer**:

> Probst, D., & Reymond, J.-L. (2018). SmilesDrawer: Parsing and Drawing SMILES-Encoded Molecular Structures Using Client-Side JavaScript. _Journal of Chemical Information and Modeling_, 58(1), 1–7. DOI: [10.1021/acs.jcim.7b00425](https://doi.org/10.1021/acs.jcim.7b00425)

_Note: Chinese translations in this project were generated using AI._
