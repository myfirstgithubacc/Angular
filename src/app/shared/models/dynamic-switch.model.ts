export interface TreeNode {
    text: string;
    value?: any; // Adjust the type according to your requirement
    items?: TreeNode[]; // Optional array of child nodes
}