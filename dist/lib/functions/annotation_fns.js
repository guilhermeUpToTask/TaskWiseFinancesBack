"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepeatedAnnotations = exports.reduceCheckedAnnotations = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
function reduceCheckedAnnotations(annotations) {
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
}
exports.reduceCheckedAnnotations = reduceCheckedAnnotations;
function getRepeatedAnnotations(annotation, quantity) {
    if (annotation.repeat === 'never' || quantity <= 1)
        return [annotation];
    const newArr = new Array(quantity).fill(annotation);
    return newArr.map((ann, i) => {
        if (i > 0) {
            return {
                ...ann,
                name: `${ann.name} - ${i + 1}`,
                description: `${ann.description} - ${i + 1} - repeated generate`,
                date: (0, dayjs_1.default)(ann.date).add(i, (annotation.repeat !== 'never') ? annotation.repeat : 'day').format('YYYY-MM-DD'),
            };
        }
        else {
            return ann;
        }
    });
}
exports.getRepeatedAnnotations = getRepeatedAnnotations;
//# sourceMappingURL=annotation_fns.js.map