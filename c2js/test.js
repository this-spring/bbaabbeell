/*
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-04-13 00:15:28
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-04-13 10:42:06
 */
// const b = require('/Users/xuxiuquan/github/bbaabbeell/babel-learn/packages/babel-parser/src/index.js');
// import { parser } from '../packages/babel-parser/src/index.js';
// const t = `function t(a, b) {
//     var c = a + b;
//     console.log('c:', c);
//     return 0
// }`;

// const r = parser.parse(t);
// console.log(r);

// let z = 10 + 20;
const ast = {
    body: [
        {
            type: 'VariableDeclaration',
            kind: 'let',
            descrip: [
                {
                    id: {
                        type: 'Identifier',
                        name: 'z'
                    },
                    init: {
                        type: 'BinaryExpression',
                        left: {
                            type: 'Literal',
                            value: 10
                        },
                        opration: {
                            type: 'Opration',
                            value: '+',
                        },
                        right: {
                            type: 'Literal',
                            value: 20,
                        }
                    }
                }
            ]
        }
    ]
};

const codeGenerator = (t) => {
    const node = t;
    console.log(node);
    const type = node.type;
    switch (type) {
        case 'VariableDeclaration':
            return `${node.kind} ${codeGenerator(node.descrip[0].id)} = ${codeGenerator(node.descrip[0].init)};` 
        case 'Identifier':
            return node.name;
        case 'BinaryExpression':
            return `${codeGenerator(node.left)} ${codeGenerator(node.opration)} ${codeGenerator(node.right)}`;
        case 'Literal':
            return node.value;
        case 'Opration':
            return node.value;
        default:
            console.log(node.type);
            throw new TypeError(node.type);
    } 
}
const str = codeGenerator(ast.body[0]);
console.log(str, eval(str));

// const newAst = {

// }