/*
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-04-08 23:39:49
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-04-10 15:52:36
*/
// 简单的词法分析，将简单c语言通过状态图进行token分析  
const fs = require('fs');
// 读取c文件
const str = fs.readFileSync('./test.c', 'utf-8');
console.log(str, ' length:', str.length);
function lexer2(str) {
    let i = -1, state = 0;
    let symboalExpr = /[,;{}#<>()./]/;
    let numberExpr = /[0-9]/;
    let strExpr = /[a-zA-Z=]/;
    let spaceExpr = /[ \n]/;
    let nextLineExpr = /[\n]/;
    let preNote = '\/';
    let token = '', tokens = [], letter = ''; 
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

lexer2(str);