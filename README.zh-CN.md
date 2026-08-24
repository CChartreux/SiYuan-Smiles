# SiYuan SMILES Renderer

基于 smiles-drawer 的思源笔记插件，可根据 SMILES 字符串动态生成二维化学结构图。

**功能特性**

* 斜杠命令集成：使用 `/chem`、`/smiles` 或 `/insert` 即可快速打开查看器。
* 实时交互预览：在输入或编辑 SMILES 字符串时实时渲染化学结构图。

**使用方法**

|      | 块级 (Block)                             | 行内 (Inline)                             |
|------|------------------------------------------|-------------------------------------------|
| 命令 | /SMILES 块                               | /行内 SMILES                              |
| 示例 | <img src="blockSmiles.png" height="100"> | <img src="inlineSmiles.png" height="100"> |

* 在任意 Protyle 文档块中输入 `/SMILES 块` 或 `/行内 SMILES` 并选择对应选项。
* 输入或粘贴 SMILES 字符串（例如 `n1ccccc1`、`CC(=O)OC1=CC=CC=C1C(=O)O`）。
* 按 Enter 键，即可在光标所在位置将 SMILES 字符串以 PNG 图片形式插入到笔记中。

## 引用

本项目基于 **smiles-drawer** 构建：

> Probst, D., & Reymond, J.-L. (2018). SmilesDrawer: Parsing and Drawing SMILES-Encoded Molecular Structures Using Client-Side JavaScript. _Journal of Chemical Information and Modeling_, 58(1), 1–7. DOI: [10.1021/acs.jcim.7b00425](https://doi.org/10.1021/acs.jcim.7b00425)

_注：本项目中的中文翻译由 AI 生成。_