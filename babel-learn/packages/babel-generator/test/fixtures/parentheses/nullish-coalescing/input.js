const foo = 'test'
console.log((foo ?? '') == '')


a ?? (b ?? c);
(a ?? b) ?? c;

a ?? (b || c);
a || (b ?? c);
(a ?? b) || c;
(a || b) ?? c;

a ?? (b && c);
a && (b ?? c);
(a ?? b) && c;
(a && b) ?? c;

