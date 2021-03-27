/*
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-03-26 18:39:05
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-03-26 18:41:55
 */
/**
 * Parser 过程-词法分析
 * @param codeString 待转化的字符串
 * @returns Tokens 令牌流
 */
 function tokens(codeString) {
    let tokens = []; //存放 token 的数组

    let current = 0; //当前的索引
    while (current < codeString.length) {
        let char = codeString[current];

        //先处理括号
        if (char === '(' || char === ')') {
            tokens.push({
                type: 'parens',
                value: char
            });
            current++;
            continue;
        }

        //处理空格，空格可能是多个连续的，所以需要将这些连续的空格一起放到token数组中
        const WHITESPACE = /\s/;
        if (WHITESPACE.test(char)) {
            let value = '';
            while (current < codeString.length && WHITESPACE.test(char)) {
                value = value + char;
                current++;
                char = codeString[current];
            }
            tokens.push({
                type: 'whitespace',
                value: value
            });
            continue;
        }

        //处理连续数字,数字也可能是连续的，原理同上
        let NUMBERS = /[0-9]/;
        if (NUMBERS.test(char)) {
            let value = '';
            while (current < codeString.length && NUMBERS.test(char)) {
                value = value + char;
                current++;
                char = codeString[current];
            }
            tokens.push({
                type: 'number',
                value: value
            });
            continue;
        }

        //处理标识符，标识符一般以字母、_、$开头的连续字符
        const LETTERS = /[a-zA-Z\$\_]/;
        if (LETTERS.test(char)) {
            let value = '';
            //标识符
            while (current < codeString.length && /[a-zA-Z0-9\$\_]/.test(char)) {
                value = value + char;
                current++;
                char = codeString[current];
            }
            tokens.push({
                type: 'identifier',
                value: value
            });
            continue;
        }

        //处理 , 分隔符
        const COMMA = /,/;
        if (COMMA.test(char)) {
            tokens.push({
                type: ',',
                value: ','
            });
            current++;
            continue;
        }

        //处理运算符
        const OPERATOR = /=|\+|>/;
        if (OPERATOR.test(char)) {
            let value = '';
            while (OPERATOR.test(char)) {
                value += char;
                current++;
                char = codeString[current];
            }
            //如果存在 => 则说明遇到了箭头函数
            if (value === '=>') {
                tokens.push({
                    type: 'ArrowFunctionExpression',
                    value,
                });
                continue;
            }

            tokens.push({
                type: 'operator',
                value
            });
            continue;
        }
        throw new TypeError(`还未加入此字符处理 ${char}`);
    }
    return tokens;
}

/**
 * Parser 过程-语法分析
 * @param tokens 令牌流
 * @returns AST
 */
 const parser = tokens => {
    // 声明一个全时指针，它会一直存在
    let current = -1;

    // 声明一个暂存栈,用于存放临时指针
    const tem = [];

    // 指针指向的当前token
    let token = tokens[current];

    const parseDeclarations = () => {

        // 暂存当前指针
        setTem();

        // 指针后移
        next();

        // 如果字符为'const'可见是一个声明
        if (token.type === 'identifier' && token.value === 'const') {
            const declarations = {
                type: 'VariableDeclaration',
                kind: token.value
            };

            next();

            // const 后面要跟变量的,如果不是则报错
            if (token.type !== 'identifier') {
                throw new Error('Expected Variable after const');
            }

            // 我们获取到了变量名称
            declarations.identifierName = token.value;

            next();

            // 如果跟着 '=' 那么后面应该是个表达式或者常量之类的,这里咱们只支持解析函数
            if (token.type === 'operator' && token.value === '=') {
                declarations.init = parseFunctionExpression();
            }

            return declarations;
        }
    };

    const parseFunctionExpression = () => {
        next();

        let init;
        // 如果 '=' 后面跟着括号或者字符那基本判断是一个表达式
        if (
            (token.type === 'parens' && token.value === '(') ||
            token.type === 'identifier'
        ) {
            setTem();
            next();
            while (token.type === 'identifier' || token.type === ',') {
                next();
            }

            // 如果括号后跟着箭头,那么判断是箭头函数表达式
            if (token.type === 'parens' && token.value === ')') {
                next();
                if (token.type === 'ArrowFunctionExpression') {
                    init = {
                        type: 'ArrowFunctionExpression',
                        params: [],
                        body: {}
                    };

                    backTem();

                    // 解析箭头函数的参数
                    init.params = parseParams();

                    // 解析箭头函数的函数主体
                    init.body = parseExpression();
                } else {
                    backTem();
                }
            }
        }

        return init;
    };

    const parseParams = () => {
        const params = [];
        if (token.type === 'parens' && token.value === '(') {
            next();
            while (token.type !== 'parens' && token.value !== ')') {
                if (token.type === 'identifier') {
                    params.push({
                        type: token.type,
                        identifierName: token.value
                    });
                }
                next();
            }
        }

        return params;
    };

    const parseExpression = () => {
        next();
        let body;
        while (token.type === 'ArrowFunctionExpression') {
            next();
        }

        // 如果以(开头或者变量开头说明不是 BlockStatement,我们以二元表达式来解析
        if (token.type === 'identifier') {
            body = {
                type: 'BinaryExpression',
                left: {
                    type: 'identifier',
                    identifierName: token.value
                },
                operator: '',
                right: {
                    type: '',
                    identifierName: ''
                }
            };
            next();

            if (token.type === 'operator') {
                body.operator = token.value;
            }

            next();

            if (token.type === 'identifier') {
                body.right = {
                    type: 'identifier',
                    identifierName: token.value
                };
            }
        }

        return body;
    };

    // 指针后移的函数
    const next = () => {
        do {
            ++current;
            token = tokens[current]
                ? tokens[current]
                : {type: 'eof', value: ''};
        } while (token.type === 'whitespace');
    };

    // 指针暂存的函数
    const setTem = () => {
        tem.push(current);
    };

    // 指针回退的函数
    const backTem = () => {
        current = tem.pop();
        token = tokens[current];
    };

    const ast = {
        type: 'Program',
        body: []
    };

    while (current < tokens.length) {
        const statement = parseDeclarations();
        if (!statement) {
            break;
        }
        ast.body.push(statement);
    }
    return ast;
};

const traverser = (ast, visitor) => {

    // 如果节点是数组那么遍历数组
    const traverseArray = (array, parent) => {
        array.forEach((child) => {
            traverseNode(child, parent);
        });
    };

    // 遍历 ast 节点
    const traverseNode = (node, parent) => {
        const methods = visitor[node.type];

        if (methods && methods.enter) {
            methods.enter(node, parent);
        }

        switch (node.type) {
            case 'Program':
                traverseArray(node.body, node);
                break;

            case 'VariableDeclaration':
                traverseArray(node.init.params, node.init);
                break;

            case 'identifier':
                break;

            default:
                throw new TypeError(node.type);
        }

        if (methods && methods.exit) {
            methods.exit(node, parent);
        }
    };
    traverseNode(ast, null);
};

/**
 * Transform 过程
 * @param ast 待转化的AST
 * 此函数会调用traverser，传入自定义的visitor完成AST转化
 */
const transformer = (ast) => {
    // 新 ast
    const newAst = {
        type: 'Program',
        body: []
    };

    // 此处在ast上新增一个 _context 属性，与 newAst.body 指向同一个内存地址，traverser函数操作的ast_context都会赋值给newAst.body
    ast._context = newAst.body;

    traverser(ast, {
        VariableDeclaration: {
            enter(node, parent) {
                let functionDeclaration = {
                    params: []
                };
                if (node.init.type === 'ArrowFunctionExpression') {
                    functionDeclaration.type = 'FunctionDeclaration';
                    functionDeclaration.identifierName = node.identifierName;
                    functionDeclaration.params = node.init.params;
                }
                if (node.init.body.type === 'BinaryExpression') {
                    functionDeclaration.body = {
                        type: 'BlockStatement',
                        body: [{
                            type: 'ReturnStatement',
                            argument: node.init.body
                        }],
                    };
                }
                parent._context.push(functionDeclaration);
            }
        },
    });

    return newAst;
};

/**
 * Generator 过程
 * @param node 新的ast
 * @returns 新的代码
 */
 const generator = (node) => {
    switch (node.type) {
        // 如果是 `Program` 结点，那么我们会遍历它的 `body` 属性中的每一个结点，并且递归地
        // 对这些结点再次调用 codeGenerator，再把结果打印进入新的一行中。
        case 'Program':
            return node.body.map(generator)
                .join('\n');

        // 如果是FunctionDeclaration我们分别遍历调用其参数数组以及调用其 body 的属性
        case 'FunctionDeclaration':
            return 'function' + ' ' + node.identifierName + '(' + node.params.map(generator) + ')' + ' ' + generator(node.body);

        // 对于 `Identifiers` 我们只是返回 `node` 的 identifierName
        case 'identifier':
            return node.identifierName;

        // 如果是BlockStatement我们遍历调用其body数组
        case 'BlockStatement':
            return '{' + node.body.map(generator) + '}';

        // 如果是ReturnStatement我们调用其 argument 的属性
        case 'ReturnStatement':
            return 'return' + ' ' + generator(node.argument);

        // 如果是ReturnStatement我们调用其左右节点并拼接
        case 'BinaryExpression':
            return generator(node.left) + ' ' + node.operator + ' ' + generator(node.right);

        // 没有符合的则报错
        default:
            throw new TypeError(node.type);

    }
};
const codeString = 'const add = (a, b) => a + b';

let token = tokens(codeString);
console.log('token:', token);
let ast = parser(token);
console.log("ast:", ast);
let newAST = transformer(ast);
console.log('newAst:', newAST);
let newCode = generator(newAST);
console.log(newCode);