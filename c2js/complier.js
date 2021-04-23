/*
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-04-13 00:15:28
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-04-14 01:03:35
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

let z = 10 + 20;
const token = (str) => {
    let i = -1, state = 0;
    let symboalExpr = /[,;{}#<>()./]/;
    let numberExpr = /[0-9]/;
    let strExpr = /[a-zA-Z=]/;
    let spaceExpr = /[ \n]/;
    let nextLineExpr = /[\n]/;
    let preNote = '\/';
    let token = '', tokens = [], letter = ''; 
    const type = {
        VariableDeclaration,
        Identifier,
        BinaryExpression,
        Literal 
    };
    // const keyword = 
    function getChar() {
        i += 1;
        return str[i];
    }
    function getNext() {
        return str[i + 1];
    }
    function getLast() {
        return i == 0 ? str[0] : str[i - 1];
    }
    function back() {
        i -= 1;
    }
    function deleteTokenLastLetter() {
        let len = token.length;
        len > 0 ? token = token.substring(0, token.length - 1) : '';
    }
    function addToken() {
        tokens.push(token);
        token = '';
        state = 0;
    }
    while(i < str.length) {
        letter = getChar();
        token += letter;
        switch(state) {
            case 0:
                if (numberExpr.test(letter)) {
                    state = 1;
                } else if(strExpr.test(letter)) {
                    state = 2;
                } else if (symboalExpr.test(letter)) {
                    if (letter == preNote && getNext() == '\/') {
                        //  // 这种注释
                        state = 3;
                    } else if (letter == preNote && getNext() == '*') {
                        // /* 这种注释
                        state = 4;
                    } else {
                        state = -1;
                    }
                } else if (spaceExpr.test(letter)) {
                    deleteTokenLastLetter();
                    state = 0;
                } else {
                    console.log('state 0 miss');
                }
                break;
            case 1:
                if (numberExpr.test(letter)) {
                    state = 1
                } else if (strExpr.test(letter)) {
                    state = 2;
                } else if (symboalExpr.test(letter)) {
                    deleteTokenLastLetter();
                    back();
                    state = -1;
                } else if (spaceExpr.test(letter)) {
                    deleteTokenLastLetter();
                    state = -1;
                } else {
                    console.log('state 1 miss');
                }
                break;
            case 2:
                if (numberExpr.test(letter) || strExpr.test(letter)) {
                    state = 2;
                } else if (symboalExpr.test(letter)) {
                    deleteTokenLastLetter();
                    back();
                    state = -1;
                } else if (spaceExpr.test(letter)) {
                    deleteTokenLastLetter();
                    state = -1;
                } else {
                    console.log('state 2 miss');
                }
                break;
            case 3:
                if (nextLineExpr.test(letter)) {
                    state = -1;
                }
                break;
            case 4:
                if (letter == '\/' && getLast() == '*') {
                    state = -1;
                }
                break;
        }
        if (state == -1) {
            addToken();
         }
    } 
    console.log(tokens, i);
}

// let z = 10 + 20;
const tokens = [
    {
        type: 'VariableDeclaration',
        value: 'let',
    },
    {
        type: 'Identifier',
        value: 'z'
    },
    {
        type: 'Opration',
        value: '='
    },
    {
        type: 'Literal',
        value: '10'
    },
    {
        type: 'Opration',
        value: '12'
    },
    {
        type: 'Literal',
        value: '20'
    },{
        type: 'Symbol',
        value: ';'
    }
]
const parser = (tokens) => {
    const body = [];
    let current = 0;
    function walk() {}

    function getNext() {
        return tokens[current + 1];
    }

    function parseId() {
        const node = {
            type: tokens[current].type,
            name: tokens[current].name
        }
        current ++;
        return node;
    }

    function parseInit() {
        let node = null;
        while(tokens[current] !== ';') {
            const { type, value } = tokens[current];
            if (type == '=') continue;
            if (type == 'Literal' && getNext().type == 'Opration') {
                node = {
                    type: 'BinaryExpression',
                    left: 
                }
            }
            current ++;
        }
    }

    while(current < tokens.length) {
        const token = tokens[current];
        const { type, value } = token;
        if (type === 'VariableDeclaration') {
            current ++;
            const node = {
                type,
                kind: value,
                descrip: [
                    {
                        id: parseId(),
                        init: parseInit(),
                    },
                ]
            };
        }
    }
}
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