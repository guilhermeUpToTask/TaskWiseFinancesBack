"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fakeData = [
    {
        name: 'Energy Bill',
        user_id: '0',
        id: 1,
        description: '',
        annon_type: 'bill',
        value: 100.00,
        date: '2023-06-01',
        repeat: 'never',
        status: 'pendent',
    },
    {
        name: 'Daily Payment',
        user_id: '0',
        id: 2,
        description: '',
        annon_type: 'payment',
        value: 90.00,
        date: '2023-06-01',
        repeat: 'never',
        status: 'pendent',
    },
    {
        name: 'Water Bill',
        id: 3,
        user_id: '0',
        description: '',
        annon_type: 'bill',
        value: 110.00,
        date: '2023-06-12',
        repeat: 'never',
        status: 'pendent',
    },
    {
        name: 'Energy Bill',
        id: 4,
        user_id: '0',
        description: '',
        annon_type: 'bill',
        value: 70,
        date: '2023-06-25',
        repeat: 'never',
        status: 'pendent',
    },
];
const reduceCheckedAnnotations = (annotations) => {
    return annotations.reduce((acc, curr) => {
        if (['recived', 'payed'].includes(curr.status)) {
            console.log(curr);
            return {
                ids: [...acc.ids, curr.id],
                value: (curr.annon_type === 'payment') ? acc.value + curr.value :
                    acc.value - curr.value
            };
        }
        else {
            return acc;
        }
    }, { ids: [], value: 0 });
};
const result = reduceCheckedAnnotations(fakeData);
console.log('result:', result);
//# sourceMappingURL=experimental.js.map