# SiYuan SMILES Renderer

基于 smiles-drawer 的思源笔记插件，可根据 SMILES 字符串动态生成二维化学结构图。

**功能特性**

- 斜杠命令集成：使用 `/chem`、`/smiles` 或 `/insert` 即可快速打开查看器。
- 实时交互预览：在输入或编辑 SMILES 字符串时实时渲染化学结构图。
- 高清导出至剪贴板：按 Enter 键自动将矢量图以 4 倍缩放渲染，并将 PNG 图片直接复制到剪贴板。

**使用方法**

- 在任意 Protyle 文档块中输入 `/smiles` 并选择 Insert SMILES Diagram。
- 输入或粘贴 SMILES 字符串（例如 `n1ccccc1`、`CC(=O)OC1=CC=CC=C1C(=O)O`）。
- 按 Enter 键将高分辨率结构图复制到剪贴板，随后直接粘贴到笔记中。

## 引用

本项目基于 **smiles-drawer** 构建：

> Probst, D., & Reymond, J.-L. (2018). SmilesDrawer: Parsing and Drawing SMILES-Encoded Molecular Structures Using Client-Side JavaScript. *Journal of Chemical Information and Modeling*, 58(1), 1–7. DOI: [10.1021/acs.jcim.7b00425](https://doi.org/10.1021/acs.jcim.7b00425)

*注：本项目中的中文翻译由 AI 生成。*