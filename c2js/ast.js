/*
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-04-23 14:40:49
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-04-24 01:29:01
*/

const TT = {
    OPT: 'OPT', // + - * /
    VAR: 'VAR', // const
    ID: 'ID', // 1,2,3, c
    END: ';', // ;
}

function Node() {
    this.left = null;
    this.right = null;
    this.value = null;
    this.type = null;
}
// const c = 1 + 2;
const testToken = [
    {
        type: TT.VAR,
        value: 'const'
    },
    {
        type: TT.ID,
        value: 'c',
    },
    {
        type: TT.OPT,
        value: '=',
    },
    {
        type: TT.ID,
        value: 1,
    },
    {
        type: TT.OPT,
        value: '+',
    },
    {
        type: TT.ID,
        value: 2,
    },
    {
        type: TT.OPT,
        value: '-',
    },
    {
        type: TT.ID,
        value: 3,
    },
    {
        type: TT.END,
        value: ';'
    }
];
function parser(tokens) {
    let i = 0;
    // 递归遍历生成ast
    function walk() {
        i+= 1;
        const token = tokens[i];
        const parentNode = new Node();
        const node = new Node();
        node.type = token.type;
        node.value = token.value;
        if (token.type == TT.ID) {
            node.value = token.value;
            i += 1;
            if (tokens[i].type === TT.OPT) {
                parentNode.value = tokens[i].value;
                parentNode.type = tokens[i ].value;
                parentNode.left = node;
                parentNode.right = walk();
            } else if (tokens[i].type == TT.END) {
                return node;
            }
        }
        return parentNode;
    }
    return walk(); 
}

function transform(ast) {
    // 前序序遍历替换节点(其实无所谓，只要能遍历树就可以)
    const newAst = JSON.parse(JSON.stringify(ast));
    function preOrder(root) {
        if (!root) return;
        if (root.value == '+') {
            root.value = '*';
            root.type = '*';
        } else if (root.value == '-') {
            root.value = '/';
            root.type = '/';
        }
        preOrder(root.left);
        preOrder(root.right);
    }
    preOrder(newAst);
    return newAst;
}
const ast = parser(testToken);
console.log(JSON.stringify(ast));
const newAst = transform(ast);
console.log(JSON.stringify(newAst));
